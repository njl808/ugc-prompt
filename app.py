import os
import logging
import base64
from io import BytesIO
from PIL import Image
from flask import Flask, render_template, request, jsonify, flash, redirect, url_for
from flask_cors import CORS
from werkzeug.utils import secure_filename
from openai_service import analyze_product_image, generate_ugc_prompt, enhance_prompt_with_templates
# Google Vision removed - using OpenAI only

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

# Restrict CORS to local origins by default; override via ALLOWED_ORIGINS env
allowed_origins = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://127.0.0.1:5050,http://localhost:5050"
).split(",")
CORS(app, resources={r"/*": {"origins": [o.strip() for o in allowed_origins if o.strip()]}})

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def image_to_base64(image_path):
    """Convert image file to base64 string"""
    try:
        with Image.open(image_path) as img:
            # Resize image if too large (max 1024px on longest side)
            img.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
            
            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Save to bytes
            buffer = BytesIO()
            img.save(buffer, format='JPEG', quality=85)
            img_bytes = buffer.getvalue()
            
            # Encode to base64
            return base64.b64encode(img_bytes).decode('utf-8')
    except Exception as e:
        logging.error(f"Error converting image to base64: {e}")
        raise

@app.route('/')
def index():
    # Check API availability from both sources
    from secure_config import api_key_manager
    
    # Try environment variable first
    openai_available = bool(os.environ.get("OPENAI_API_KEY"))
    
    # If not in env, check secure storage (without password for status check)
    if not openai_available:
        try:
            # Check if secure config files exist
            import pathlib
            config_dir = pathlib.Path(".secure_config")
            openai_available = (config_dir / "api_keys.enc").exists()
        except:
            openai_available = False
    
    return render_template('index.html', 
                         openai_available=openai_available)

@app.route('/api-settings')
def api_settings():
    """API Settings management page"""
    from secure_config import api_key_manager
    import pathlib
    
    # Check if API is currently connected
    api_connected = False
    has_stored_keys = False
    
    try:
        # Check environment variable
        if os.environ.get("OPENAI_API_KEY"):
            api_connected = True
        else:
            # Check if secure storage exists
            config_dir = pathlib.Path(".secure_config")
            has_stored_keys = (config_dir / "api_keys.enc").exists()
    except:
        pass
    
    return render_template('api_settings.html',
                         api_connected=api_connected,
                         has_stored_keys=has_stored_keys)

@app.route('/api/save-key', methods=['POST'])
def save_api_key():
    """Save API key securely"""
    try:
        from secure_config import api_key_manager
        
        data = request.get_json()
        master_password = data.get('masterPassword')
        api_key = data.get('apiKey')
        
        if not master_password:
            return jsonify({'success': False, 'error': 'Master password is required'})
        
        # If no API key provided, just test the password
        if not api_key:
            # Try to retrieve existing key to validate password
            existing_key = api_key_manager.get_api_key('openai', master_password)
            if existing_key:
                return jsonify({'success': True, 'message': 'Password validated successfully'})
            else:
                return jsonify({'success': False, 'error': 'Invalid password or no stored key found'})
        
        # Validate API key format
        if not api_key.startswith('sk-'):
            return jsonify({'success': False, 'error': 'Invalid OpenAI API key format'})
        
        # Store the API key
        if api_key_manager.store_api_key('openai', api_key, master_password):
            return jsonify({'success': True, 'message': 'API key saved successfully!'})
        else:
            return jsonify({'success': False, 'error': 'Failed to save API key'})
            
    except Exception as e:
        return jsonify({'success': False, 'error': f'Error: {str(e)}'})

@app.route('/api/test-connection', methods=['POST'])
def test_connection():
    """Test OpenAI API connection"""
    try:
        from secure_config import api_key_manager
        from openai import OpenAI
        try:
            import httpx  # optional for proxy support
        except Exception:
            httpx = None
        
        data = request.get_json()
        master_password = data.get('masterPassword')
        
        if not master_password:
            return jsonify({'success': False, 'error': 'Master password is required'})
        
        # Get API key
        api_key = api_key_manager.get_api_key('openai', master_password)
        if not api_key:
            # Try environment variable as fallback
            api_key = os.environ.get('OPENAI_API_KEY')
            if not api_key:
                return jsonify({'success': False, 'error': 'No API key found'})
        
        # Test the connection (with optional proxy support)
        proxy = os.environ.get('OPENAI_HTTP_PROXY') or os.environ.get('HTTPS_PROXY') or os.environ.get('HTTP_PROXY')
        if proxy and httpx is not None:
            client = OpenAI(api_key=api_key, http_client=httpx.Client(proxies=proxy))
        else:
            client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "Say 'Connection successful!'"}],
            max_tokens=10
        )
        
        result = response.choices[0].message.content
        return jsonify({'success': True, 'message': f'Connection successful! Response: {result}'})
        
    except Exception as e:
        return jsonify({'success': False, 'error': f'Connection failed: {str(e)}'})

@app.route('/api/list-services', methods=['POST'])
def list_services():
    """List stored services"""
    try:
        from secure_config import api_key_manager
        
        data = request.get_json()
        master_password = data.get('masterPassword')
        
        if not master_password:
            return jsonify({'success': False, 'error': 'Master password is required'})
        
        services = api_key_manager.list_stored_services(master_password)
        return jsonify({'success': True, 'services': services})
        
    except Exception as e:
        return jsonify({'success': False, 'error': f'Error: {str(e)}'})

@app.route('/api/delete-key', methods=['POST'])
def delete_api_key():
    """Delete stored API key"""
    try:
        from secure_config import api_key_manager
        
        data = request.get_json()
        master_password = data.get('masterPassword')
        service_name = data.get('serviceName', 'openai')
        
        if not master_password:
            return jsonify({'success': False, 'error': 'Master password is required'})
        
        if api_key_manager.delete_api_key(service_name, master_password):
            return jsonify({'success': True, 'message': f'{service_name} API key deleted successfully'})
        else:
            return jsonify({'success': False, 'error': 'Failed to delete API key'})
            
    except Exception as e:
        return jsonify({'success': False, 'error': f'Error: {str(e)}'})

@app.route('/tutorial')
def tutorial():
    """Complete tutorial and user guide"""
    return render_template('tutorial_complete.html')

@app.route('/faq')
def faq():
    """Frequently Asked Questions page"""
    return render_template('faq.html')

@app.route('/help')
def help_redirect():
    """Redirect /help to /faq for convenience"""
    return redirect(url_for('faq'))

@app.route('/analyze-scene', methods=['POST'])
def analyze_scene():
    """Analyze scene/location image using OpenAI Vision"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        image_data = data['image']
        # Extract base64 data
        if 'base64,' in image_data:
            base64_image = image_data.split('base64,')[1]
        else:
            base64_image = image_data
        
        # Use OpenAI Vision for scene analysis  
        from openai_service import analyze_scene_image
        analysis_result = analyze_scene_image(base64_image)
        
        return jsonify({
            'success': True,
            'scene_analysis': analysis_result
        })
        
    except Exception as e:
        logging.error(f"Error analyzing scene: {e}")
        return jsonify({'error': f'Failed to analyze scene: {str(e)}'}), 500

@app.route('/analyze-actor', methods=['POST'])
def analyze_actor():
    """Analyze actor image using OpenAI Vision"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        image_data = data['image']
        # Extract base64 data
        if 'base64,' in image_data:
            base64_image = image_data.split('base64,')[1]
        else:
            base64_image = image_data
        
        # Use OpenAI Vision for actor analysis  
        from openai_service import analyze_actor_image
        analysis_result = analyze_actor_image(base64_image)
        
        return jsonify({
            'success': True,
            'actor_analysis': analysis_result
        })
        
    except Exception as e:
        logging.error(f"Error analyzing actor: {e}")
        return jsonify({'error': f'Failed to analyze actor: {str(e)}'}), 500

@app.route('/analyze', methods=['POST'])
def analyze():
    """Analyze product image using OpenAI Vision"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        image_data = data['image']
        # Extract base64 data (remove data:image/jpeg;base64, prefix if present)
        if 'base64,' in image_data:
            base64_image = image_data.split('base64,')[1]
        else:
            base64_image = image_data
        
        # Use OpenAI Vision with 4o-mini
        analysis_result = analyze_product_image(base64_image)
        
        return jsonify({
            'success': True,
            'analysis': analysis_result
        })
        
    except Exception as e:
        logging.error(f"Error analyzing image: {e}")
        return jsonify({'error': f'Failed to analyze image: {str(e)}'}), 500



@app.route('/generate', methods=['POST'])
def generate():
    """Generate UGC prompt based on form data and analysis"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract analysis and settings
        analysis = data.get('analysis', {})
        settings = data.get('settings', {})
        
        # Create context from form data and analysis
        context = {
            'product': settings.get('product', ''),
            'target_audience': settings.get('target_audience', ''),
            'ugc_type': settings.get('ugc_type', ''),
            'creator_age': settings.get('creator_age', ''),
            'creator_style': settings.get('creator_style', ''),
            'energy_level': settings.get('energy_level', ''),
            'tone': settings.get('tone', ''),
            'duration': settings.get('duration', ''),
            'platform': settings.get('platform', ''),
            'setting': settings.get('setting', ''),
            'lighting': settings.get('lighting', ''),
            'camera_movement': settings.get('camera_movement', ''),
            'hook_type': settings.get('hook_type', ''),
            'custom_hook': settings.get('custom_hook', ''),
            'conversion_focus': settings.get('conversion_focus', ''),
            'visual_style': settings.get('visual_style', ''),
            'product_analysis': analysis
        }
        
        # Generate prompt using templates
        prompt_result = generate_ugc_prompt(context)
        
        return jsonify({
            'success': True,
            'prompt': prompt_result
        })
        
    except Exception as e:
        logging.error(f"Error generating prompt: {e}")
        return jsonify({'error': f'Failed to generate prompt: {str(e)}'}), 500

@app.route('/enhance-prompt', methods=['POST'])
def enhance_prompt():
    """Enhance existing prompt with AI optimization"""
    try:
        data = request.get_json()
        
        if not data or 'prompt' not in data:
            return jsonify({'error': 'No prompt provided'}), 400
        
        original_prompt = data['prompt']
        enhancement_focus = data.get('enhancement_focus', 'conversion')
        
        # Enhance prompt using templates
        enhancement_result = enhance_prompt_with_templates(original_prompt, enhancement_focus)
        
        return jsonify({
            'success': True,
            'enhancement': enhancement_result
        })
        
    except Exception as e:
        logging.error(f"Error enhancing prompt: {e}")
        return jsonify({'error': f'Failed to enhance prompt: {str(e)}'}), 500

@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'File too large. Maximum size is 16MB.'}), 413

if __name__ == '__main__':
    debug_flag = os.environ.get('FLASK_DEBUG', '0') == '1'
    app.run(host='0.0.0.0', port=5050, debug=debug_flag)
