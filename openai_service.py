import json
import os
import logging
from openai import OpenAI
from secure_config import get_openai_api_key_optional
try:
    import httpx  # optional, used for proxy support with OpenAI v1
except Exception:  # pragma: no cover
    httpx = None

# the newest OpenAI model is "gpt-4o" which was released May 13, 2024.
# do not change this unless explicitly requested by the user

# OpenAI client is created lazily to avoid failing on import if no key is present
OPENAI_API_KEY = get_openai_api_key_optional()
openai_client = None

def get_openai_client():
    """Return a cached OpenAI client or initialize it if a key is available.

    Avoids raising on import-time when no API key exists. Returns None when
    no key is configured so callers can gracefully degrade.
    """
    global openai_client, OPENAI_API_KEY
    if openai_client is not None:
        return openai_client

    # Try current cached key first, then fetch optionally
    api_key = OPENAI_API_KEY or get_openai_api_key_optional()
    if not api_key:
        logging.warning("OpenAI API key not configured; skipping client initialization.")
        return None

    try:
        # Optional proxy support via env: OPENAI_HTTP_PROXY, HTTPS_PROXY, HTTP_PROXY
        proxy = (
            os.environ.get("OPENAI_HTTP_PROXY")
            or os.environ.get("HTTPS_PROXY")
            or os.environ.get("HTTP_PROXY")
        )

        if proxy and httpx is not None:
            http_client = httpx.Client(proxies=proxy)
            openai_client = OpenAI(api_key=api_key, http_client=http_client)
        else:
            openai_client = OpenAI(api_key=api_key)
        logging.info("OpenAI client initialized successfully.")
    except Exception as e:
        logging.error(f"Failed to initialize OpenAI client: {e}")
        openai_client = None

    return openai_client

def analyze_scene_image(base64_image):
    """Analyze scene/location image for technical description"""
    client = get_openai_client()
    if not client:
        return {"scene_description": "OpenAI client not available. Cannot analyze image."}

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are a technical scene analyst for video production. "
                    + "Analyze this location/room image and provide a detailed technical description "
                    + "focused on lighting, spatial layout, surfaces, colors, and atmosphere. "
                    + "This will be used for AI video generation, so be precise about visual elements. "
                    + "Focus on: lighting quality and direction, wall colors and textures, floor materials, "
                    + "furniture placement, room size/scale, ambient mood, and any distinctive features. "
                    + "Write as a single paragraph technical description suitable for video generation prompts."
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Analyze this scene/location image. Provide a technical description focusing on lighting, spatial elements, colors, textures, and overall atmosphere that would help recreate this environment in video generation."
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                        }
                    ]
                }
            ],
            max_tokens=500
        )

        description = response.choices[0].message.content or 'Scene analysis failed'
        return {"scene_description": description}

    except Exception as e:
        logging.error(f"Failed to analyze scene image: {e}")
        return {"scene_description": f"Error during scene analysis: {e}"}


def analyze_actor_image(base64_image):
    """Analyze actor image to generate detailed physical description"""
    client = get_openai_client()
    if not client:
        return {"actor_description": "OpenAI client not available. Cannot analyze image."}

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are describing a person's physical appearance for a blind person. "
                    + "Describe only what you SEE in the image, as if for a blind person. Do NOT guess, do NOT infer, do NOT describe anything not visually obvious. "
                    + "No names unless printed. "
                    + "Focus on: hair (color, length, style), facial features (eye color if visible, facial hair, skin tone), "
                    + "posture, and any distinctive visual characteristics. "
                    + "Be precise and factual - only describe what is clearly visible of the person in the image."
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Describe exactly what you see in this image of a person. Focus only on visible physical characteristics, clothing, and posture. Do not guess  name, or make assumptions about anything not clearly visible."
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                        }
                    ]
                }
            ],
            max_tokens=300
        )

        description = response.choices[0].message.content or 'Actor analysis failed'
        return {"actor_description": description}

    except Exception as e:
        logging.error(f"Failed to analyze actor image: {e}")
        return {"actor_description": f"Error during actor analysis: {e}"}


def analyze_product_image(base64_image):
    """Provide detailed analysis and description of product image"""
    client = get_openai_client()
    if not client:
        return {} # Return empty dict if client not available

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are a precise product analyst creating descriptions for video generation. "
                    + "CRITICAL: Only describe what you actually see in the image. Do not add fictional elements or substitute products. "
                    + "Provide a focused, accurate description that captures the exact visual elements present. "
                    + "This description will be used for AI video generation, so accuracy is essential. "
                    + "Focus on: exact colors, visible text/branding, materials, shape, size, and positioning. "
                    + "Keep descriptions clear and specific - imagine describing this to someone who cannot see the image. "
                    + "Respond with JSON in this exact format: "
                    + "{'detailed_description': 'precise visual description (100-150 words)', "
                    + "'product_name': 'exact name if visible', 'product_type': 'category', 'key_features': ['feature1', 'feature2'], "
                    + "'target_audience': 'likely audience', 'use_cases': ['use1', 'use2'], 'visual_style': 'style', "
                    + "'suggested_setting': 'setting', 'emotional_appeal': 'appeal', "
                    + "'materials_textures': ['material1', 'material2'], 'color_palette': ['primary_color', 'secondary_color'], "
                    + "'lighting_style': 'lighting', 'composition_notes': 'composition'}"
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Analyze this product image with precision. Describe ONLY what you can actually see - do not invent details or substitute different products. Focus on exact colors, visible text, materials, and physical characteristics. Be accurate and concise, as if describing to someone who cannot see the image."
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                        }
                    ]
                }
            ],
            response_format={"type": "json_object"},
            max_tokens=2000
        )

        result = json.loads(response.choices[0].message.content or '{}')
        return result

    except Exception as e:
        logging.error(f"Failed to analyze product image: {e}")
        return {} # Return empty dict on error


def generate_ugc_prompt(form_data):
    """Generate optimized UGC prompt using template-based logic (no AI tokens used)"""
    try:
        # Build comprehensive context from form data
        context = {
            "product": form_data.get("product", ""),
            "ugc_type": form_data.get("ugc_type", ""),
            "target_audience": form_data.get("target_audience", ""),
            "actor_type": form_data.get("actor_type", ""),
            "age_range": form_data.get("age_range", ""),
            "gender": form_data.get("gender", ""),
            "setting": form_data.get("setting", ""),
            "lighting": form_data.get("lighting", ""),
            "camera_movement": form_data.get("camera_movement", ""),
            "hook_type": form_data.get("hook_type", ""),
            "custom_hook": form_data.get("custom_hook", ""),
            "performance_style": form_data.get("performance_style", ""),
            "video_length": form_data.get("video_length", "8"),
            "aspect_ratio": form_data.get("aspect_ratio", "9:16"),
            "audio_enabled": form_data.get("audio_enabled", True),
            "product_analysis": form_data.get("product_analysis", {}),
            "actor_description": form_data.get("actor_description"),
            "character_archetype": form_data.get("character_archetype")
        }

        # Generate prompt using template-based logic
        result = _build_prompt_from_templates(context)
        return result

    except Exception as e:
        logging.error(f"Failed to generate UGC prompt: {e}")
        # Return a basic structure or error message if generation fails
        return {
            "prompt": "Failed to generate prompt.",
            "key_elements": [],
            "conversion_psychology": [],
            "technical_elements": [],
            "estimated_conversion_potential": "low",
            "optimization_tips": [],
            "prompt_structure": "Error",
            "generation_method": "Template Logic"
        }


def _build_prompt_logic(context):
    """Build strategic logic for prompt generation based on context"""
    logic = {
        "hook_strategy": _determine_hook_strategy(context),
        "emotional_triggers": _identify_emotional_triggers(context),
        "conversion_elements": _select_conversion_elements(context),
        "technical_requirements": _build_technical_specs(context),
        "audience_psychology": _analyze_audience_psychology(context)
    }
    return logic

def _determine_hook_strategy(context):
    """Determine the best hook strategy based on product and audience"""
    hook_type = context.get("hook_type", "")
    custom_hook = context.get("custom_hook", "")

    if custom_hook:
        return {"type": "custom", "message": custom_hook}

    hook_strategies = {
        "problem_agitate_solve": "Start with relatable problem, agitate pain point, reveal solution",
        "curiosity_gap": "Create knowledge gap that viewers must fill by watching",
        "social_proof": "Lead with testimonial or crowd validation",
        "pattern_interrupt": "Break expected patterns to capture attention",
        "controversial": "Present contrarian viewpoint to spark engagement",
        "fomo": "Create urgency and scarcity to drive immediate action"
    }

    return {"type": hook_type, "strategy": hook_strategies.get(hook_type, "Direct product showcase")}

def _identify_emotional_triggers(context):
    """Identify key emotional triggers for the target audience"""
    audience = context.get("target_audience", "")
    product_analysis = context.get("product_analysis", {})

    triggers = []

    if "gen-z" in audience.lower():
        triggers.extend(["authenticity", "social_validation", "trending", "self_expression"])
    elif "millennials" in audience.lower():
        triggers.extend(["nostalgia", "value_optimization", "life_balance", "social_impact"])
    elif "parents" in audience.lower():
        triggers.extend(["family_safety", "time_saving", "child_development", "peace_of_mind"])
    elif "professionals" in audience.lower():
        triggers.extend(["productivity", "status", "efficiency", "career_advancement"])

    emotional_appeal = product_analysis.get("emotional_appeal", "")
    if emotional_appeal:
        triggers.append(emotional_appeal.lower())

    return list(set(triggers))

def _select_conversion_elements(context):
    """Select conversion optimization elements"""
    elements = []

    ugc_type = context.get("ugc_type", "")
    if "unboxing" in ugc_type:
        elements.extend(["anticipation_building", "reveal_moment", "first_impression"])
    elif "review" in ugc_type:
        elements.extend(["credibility_indicators", "before_after", "specific_benefits"])
    elif "tutorial" in ugc_type:
        elements.extend(["step_by_step", "transformation", "ease_of_use"])

    elements.extend(["clear_cta", "social_proof", "urgency", "value_proposition"])

    return elements

def _build_technical_specs(context):
    """Build technical specifications for Veo3 optimization"""
    specs = {
        "duration": f"{context.get('video_length', '8')} seconds",
        "aspect_ratio": "9:16 vertical format",
        "camera_work": context.get("camera_movement", "smooth_tracking"),
        "lighting": context.get("lighting", "natural"),
        "setting": context.get("setting", "home_bedroom"),
        "audio": "clear dialogue with ambient sound" if context.get("audio_enabled", True) else "visual only"
    }

    return specs

def _analyze_audience_psychology(context):
    """Analyze target audience psychology for optimization"""
    audience = context.get("target_audience", "")
    age_range = context.get("age_range", "")

    psychology = {
        "attention_span": "short" if "gen-z" in audience.lower() else "medium",
        "trust_factors": ["peer_recommendations", "authentic_reactions", "real_results"],
        "decision_triggers": ["social_validation", "fear_of_missing_out", "problem_solution_fit"],
        "communication_style": "casual_conversational" if "gen-z" in audience.lower() else "informative_friendly"
    }

    return psychology

def _build_prompt_from_templates(context):
    """Build UGC prompt using template-based system generation"""

    # Get template components
    hook = _build_hook(context)
    subject = _build_subject(context)
    action = _build_action(context)
    setting = _build_setting(context)
    camera = _build_camera_work(context)
    audio = _build_audio(context)

    # Add detailed product description if available
    product_analysis = context.get("product_analysis", {})
    detailed_description = product_analysis.get("detailed_description", "")

    # Build structured prompt in required format
    product_analysis = context.get("product_analysis", {})
    detailed_description = product_analysis.get("detailed_description", "")

    # Format exactly as required
    prompt_sections = []

    # PRODUCT section (visual ground truth)
    if detailed_description:
        prompt_sections.append(f"PRODUCT (read this exactly; use as visual ground truth):\n{detailed_description}\n\nDO NOT SUBSTITUTE ANOTHER PRODUCT. Keep exact branding/text/colors.")

    # UGC advert section
    duration = context.get("video_length", "8")
    setting = context.get("setting", "modern office desk")
    lighting = context.get("lighting", "soft natural light")

    # Use the actor_persona built in _build_subject
    actor_persona = _build_subject(context) # Re-call to get the actor_persona

    ugc_section = f"""UGC advert. Duration {duration} seconds. Aspect 9:16.
Setting: {setting}, {lighting}. Camera: handheld.
Actor: {actor_persona}.
Action: {action}
Dialogue (to camera): {hook}
Captions: match the spoken line. Audio: clear voice, faint room tone only."""

    prompt_sections.append(ugc_section)

    # Combine sections
    final_prompt = "\n\n".join(prompt_sections)

    # Generate metadata
    key_elements = _extract_key_elements(context)
    conversion_potential = _assess_conversion_potential(context)
    optimization_tips = _generate_optimization_tips(context)

    return {
        "prompt": final_prompt,
        "key_elements": key_elements,
        "conversion_psychology": _get_conversion_psychology(context),
        "technical_elements": _get_technical_elements(context),
        "estimated_conversion_potential": conversion_potential,
        "optimization_tips": optimization_tips,
        "prompt_structure": "Structured Format",
        "generation_method": "Template Logic"
    }

def _build_hook(context):
    """Build compelling hook based on strategy"""
    hook_type = context.get("hook_type", "")
    custom_hook = context.get("custom_hook", "")
    product = context.get("product", "Product")

    if custom_hook:
        return custom_hook

    hooks = {
        "problem_agitate_solve": f"Are you tired of [problem with {product}]? Here's the game-changer",
        "curiosity_gap": f"This {product} trick will blow your mind",
        "social_proof": f"Everyone's talking about this {product} - here's why",
        "pattern_interrupt": f"Stop! Before you buy another {product}, watch this",
        "controversial": f"Unpopular opinion: Most {product} advice is wrong",
        "fomo": f"Limited time: This {product} is flying off the shelves"
    }

    return hooks.get(hook_type, f"Check out this amazing {product}")

def _build_subject(context):
    """Build subject description"""
    character_archetype = context.get("character_archetype", "")
    actor_description = context.get("actor_description")

    # Use Maya's detailed description for gamer archetype
    if character_archetype == "gamer":
        return "Maya is a 22 year old woman with an oval face clear fair skin with warm pink undertones defined cheekbones almond shaped hazel eyes framed by straight slightly arched brows a straight medium length nose full lips with a wide natural smile long chestnut brown hair falling past her shoulders and a slim average build with youthful proportions"
    elif actor_description and isinstance(actor_description, str):
        return actor_description
    else:
        # Build basic description
        creator_age = context.get("creator_age", "young adult")
        creator_style = context.get("creator_style", "authentic")
        energy_level = context.get("energy_level", "upbeat")
        return f"{creator_age}, {creator_style}, {energy_level}"


def _build_action(context):
    """Build action description based on UGC type"""
    ugc_type = context.get("ugc_type", "")
    product = context.get("product", "product")

    # Get detailed description to enhance the action
    product_analysis = context.get("product_analysis", {})
    detailed_description = product_analysis.get("detailed_description", "")

    # Build base action
    actions = {
        "unboxing": f"unboxing and revealing the {product} with genuine excitement and surprise reactions",
        "review": f"demonstrating and reviewing the {product}, showing its key features and benefits",
        "tutorial": f"showing step-by-step how to use the {product} with clear instructions",
        "lifestyle": f"naturally incorporating the {product} into their daily routine",
        "problem_solving": f"solving a common problem using the {product} as the solution",
        "before_after": f"showing dramatic before and after results using the {product}"
    }

    base_action = actions.get(ugc_type, f"showcasing the {product}")

    # Enhance with detailed description if available
    if detailed_description:
        # Extract key visual elements from description
        visual_details = _extract_visual_details(detailed_description)
        if visual_details:
            base_action += f", highlighting {visual_details}"

    return base_action

def _extract_visual_details(description):
    """Extract key visual details from description for prompt enhancement"""
    description_lower = description.lower()
    found_details = []

    # Enhanced color detection with more dynamic descriptions
    colors = {
        "white": "crisp white", "black": "sleek black", "blue": "vibrant blue",
        "red": "bold red", "green": "fresh green", "yellow": "bright yellow",
        "purple": "rich purple", "orange": "energetic orange", "pink": "playful pink",
        "brown": "warm brown", "gray": "sophisticated gray", "grey": "sophisticated grey",
        "beige": "elegant beige", "cream": "luxurious cream", "gold": "stunning gold",
        "silver": "polished silver", "navy": "classic navy", "tan": "rich tan"
    }

    for color, enhanced_desc in colors.items():
        if color in description_lower:
            found_details.append(f"the {enhanced_desc} coloring")
            break

    # Enhanced material detection with exciting descriptions
    materials = {
        "leather": "premium leather craftsmanship",
        "fabric": "high-quality fabric construction",
        "metal": "gleaming metal accents",
        "plastic": "durable design elements",
        "wood": "natural wood grain",
        "glass": "crystal-clear finish",
        "suede": "luxurious suede texture",
        "canvas": "sturdy canvas build",
        "rubber": "flexible grip technology"
    }

    for material, enhanced_desc in materials.items():
        if material in description_lower:
            found_details.append(enhanced_desc)
            break

    # Look for brand/product specific details
    if "nike" in description_lower or "nikki" in description_lower:
        found_details.append("the iconic design elements")
    if "logo" in description_lower or "text" in description_lower:
        found_details.append("the distinctive branding")
    if "shoe" in description_lower or "sneaker" in description_lower:
        found_details.append("the athletic silhouette and comfort features")

    # Look for quality indicators
    quality_words = ["professional", "detailed", "clear", "high-quality", "premium", "luxury"]
    for word in quality_words:
        if word in description_lower:
            found_details.append("the exceptional build quality")
            break

    return ", ".join(found_details[:4])  # Allow up to 4 details for richer descriptions

def _create_enhanced_product_description(original_description, context):
    """Transform basic product description into engaging, dynamic content"""
    product = context.get("product", "product")
    description_lower = original_description.lower()

    # Build enhanced description components
    enhanced_parts = []

    # Start with exciting product intro
    if "shoe" in description_lower or "sneaker" in description_lower:
        enhanced_parts.append(f"This stunning {product} showcases incredible attention to detail")
    elif "clothing" in description_lower or "apparel" in description_lower:
        enhanced_parts.append(f"This beautiful {product} features premium design and craftsmanship")
    else:
        enhanced_parts.append(f"This amazing {product} combines style and functionality")

    # Add color descriptions with emotion
    colors = {
        "white": "featuring crisp, clean white tones that exude elegance",
        "brown": "with rich, warm brown accents that add sophistication",
        "black": "showcasing sleek black elements for a modern aesthetic",
        "blue": "highlighting vibrant blue details that catch the eye",
        "red": "with bold red features that command attention"
    }

    for color, desc in colors.items():
        if color in description_lower:
            enhanced_parts.append(desc)
            break

    # Add material and construction details
    if "leather" in description_lower:
        enhanced_parts.append("crafted with premium materials for lasting quality")
    elif "fabric" in description_lower:
        enhanced_parts.append("made with high-performance materials")
    else:
        enhanced_parts.append("built with exceptional attention to quality")

    # Add brand recognition
    if "nike" in description_lower or "nikki" in description_lower:
        enhanced_parts.append("featuring the iconic brand elements you love")
    if "logo" in description_lower or "text" in description_lower:
        enhanced_parts.append("with distinctive branding that makes a statement")

    # Add visual appeal for video
    enhanced_parts.append("perfectly designed for stunning visual content")

    # Add engagement elements
    if "professional" in description_lower:
        enhanced_parts.append("professionally styled for maximum impact")

    # Combine with dynamic connectors
    connectors = [", ", " while ", ". The design ", ", and ", ". Every detail "]
    description = enhanced_parts[0]

    for i, part in enumerate(enhanced_parts[1:], 1):
        if i < len(connectors):
            description += connectors[i-1] + part
        else:
            description += ", " + part

    return description

def _generate_ai_powered_ugc_prompt(context, product_analysis):
    """Use OpenAI to generate engaging UGC prompts from product analysis"""
    client = get_openai_client()
    if not client:
        logging.warning("OpenAI client not available, falling back to template prompt generation.")
        return _generate_basic_template_prompt(context)

    try:
        # Extract all available data
        product_name = product_analysis.get("product_name", "product")
        detailed_description = product_analysis.get("detailed_description", "")
        key_features = product_analysis.get("key_features", [])
        target_audience = context.get("target_audience", "general consumers")
        ugc_type = context.get("ugc_type", "unboxing")
        setting = context.get("setting", "indoors")
        lighting = context.get("lighting", "natural")
        duration = context.get("video_length", "8")

        # Create comprehensive prompt for OpenAI - MUST include full description
        ai_input = f"""
        Create an engaging UGC video prompt for this product. IMPORTANT: You must include the complete product description in the final prompt.

        Product: {product_name}
        Full Product Description: {detailed_description}
        Key Features: {', '.join(key_features) if key_features else 'Not specified'}

        Video Details:
        - Type: {ugc_type}
        - Target Audience: {target_audience}
        - Setting: {setting}
        - Lighting: {lighting}
        - Duration: {duration} seconds
        - Format: Vertical 9:16

        Generate a compelling video prompt that MUST end with: "Product description: [the full detailed description provided above]"

        Structure: [Engaging UGC directions]. Product description: {detailed_description}
        """

        # Using gpt-4o for AI generation
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert UGC video strategist who creates compelling, authentic video prompts that drive conversions. Focus on natural, engaging language that resonates with real people."
                },
                {
                    "role": "user",
                    "content": ai_input
                }
            ],
            max_tokens=500,
            temperature=0.7
        )

        ai_generated_prompt = response.choices[0].message.content.strip() if response.choices[0].message.content else "AI generation failed"

        # Generate metadata using existing functions
        key_elements = _extract_key_elements(context)
        conversion_potential = _assess_conversion_potential(context)
        optimization_tips = _generate_optimization_tips(context)

        return {
            "prompt": ai_generated_prompt,
            "key_elements": key_elements,
            "conversion_psychology": _get_conversion_psychology(context),
            "technical_elements": _get_technical_elements(context),
            "estimated_conversion_potential": conversion_potential,
            "optimization_tips": optimization_tips,
            "prompt_structure": "AI-Generated Comprehensive UGC Prompt",
            "generation_method": "OpenAI GPT-4o"
        }

    except Exception as e:
        logging.error(f"Error generating AI prompt: {e}")
        # Fallback to template method
        return _generate_basic_template_prompt(context)


def _generate_basic_template_prompt(context):
    """Fallback template method when AI generation fails"""
    # Basic template components
    hook = _build_hook(context)
    subject = _build_subject(context)
    action = _build_action(context)
    setting = _build_setting(context)
    camera = _build_camera_work(context)
    audio = _build_audio(context)

    # Build basic prompt
    prompt_parts = [hook, subject, action, setting, camera, audio]
    prompt = ". ".join([part for part in prompt_parts if part])

    return {
        "prompt": prompt,
        "key_elements": _extract_key_elements(context),
        "conversion_psychology": _get_conversion_psychology(context),
        "technical_elements": _get_technical_elements(context),
        "estimated_conversion_potential": _assess_conversion_potential(context),
        "optimization_tips": _generate_optimization_tips(context),
        "prompt_structure": "Template-Based Fallback",
        "generation_method": "Template Logic"
    }

def _build_setting(context):
    """Build setting description enhanced with product details"""
    setting = context.get("setting", "")
    lighting = context.get("lighting", "")

    settings = {
        "home_bedroom": "in a cozy, well-lit bedroom",
        "kitchen": "in a modern, clean kitchen",
        "office": "in a professional office workspace",
        "outdoors": "in a beautiful outdoor location with natural scenery",
        "car": "inside a clean, modern vehicle",
        "bathroom": "in a clean, well-lit bathroom"
    }

    lighting_styles = {
        "natural": "with soft natural lighting",
        "ring_light": "with professional ring light setup",
        "golden_hour": "during golden hour with warm, flattering light",
        "soft_indoor": "with soft, diffused indoor lighting"
    }

    setting_desc = settings.get(setting, "in an attractive indoor setting")
    lighting_desc = lighting_styles.get(lighting, "with good lighting")

    # Enhance with product analysis if available
    product_analysis = context.get("product_analysis", {})
    detailed_description = product_analysis.get("detailed_description", "")

    base_setting = f"{setting_desc} {lighting_desc}"

    # Add environmental details from product description
    if detailed_description:
        env_details = _extract_environmental_details(detailed_description)
        if env_details:
            base_setting += f", {env_details}"

    return base_setting

def _extract_environmental_details(description):
    """Extract environmental/background details from description"""
    description_lower = description.lower()

    # Look for background/surface mentions
    surfaces = ["fabric", "wood", "table", "surface", "background", "floor", "wall"]
    for surface in surfaces:
        if surface in description_lower:
            if "fabric" in description_lower:
                return "with textured fabric surfaces visible"
            elif "wood" in description_lower:
                return "with warm wooden surfaces"
            elif "neutral" in description_lower and "background" in description_lower:
                return "against a clean, neutral background"

    return ""

def _build_camera_work(context):
    """Build camera work description"""
    camera_movement = context.get("camera_movement", "")
    video_length = context.get("video_length", "8")

    camera_styles = {
        "static": "Shot with a steady, static camera for clear focus",
        "handheld": "Filmed with natural handheld movement for authenticity",
        "smooth_tracking": "Using smooth camera tracking to follow the action",
        "close_zoom": "Starting wide and smoothly zooming in for detail"
    }

    camera_desc = camera_styles.get(camera_movement, "with steady, professional camera work")

    return f"{camera_desc}. {video_length}-second duration, vertical 9:16 format"

def _build_audio(context):
    """Build audio description"""
    audio_enabled = context.get("audio_enabled", True)
    performance_style = context.get("performance_style", "")

    if not audio_enabled:
        return "Silent video with text overlays and engaging visuals"

    audio_styles = {
        "conversational": "with clear, natural speech and ambient background",
        "excited": "with enthusiastic, high-energy narration",
        "calm": "with calm, trustworthy voice and subtle background music",
        "energetic": "with upbeat music and dynamic audio",
        "emotional": "with heartfelt narration and supporting music"
    }

    audio_desc = audio_styles.get(performance_style, "with clear audio and engaging narration")

    return f"Audio: {audio_desc}"

def _extract_key_elements(context):
    """Extract key elements from context"""
    elements = []

    if context.get("hook_type"):
        elements.append(f"Hook Strategy: {context['hook_type'].replace('_', ' ').title()}")
    if context.get("ugc_type"):
        elements.append(f"Content Type: {context['ugc_type'].replace('_', ' ').title()}")
    if context.get("target_audience"):
        elements.append(f"Target: {context['target_audience'].replace('_', ' ').title()}")
    if context.get("setting"):
        elements.append(f"Setting: {context['setting'].replace('_', ' ').title()}")
    if context.get("performance_style"):
        elements.append(f"Style: {context['performance_style'].replace('_', ' ').title()}")

    return elements

def _assess_conversion_potential(context):
    """Assess conversion potential based on context"""
    score = 0

    # Score based on completeness and quality of inputs
    if context.get("hook_type"): score += 20
    if context.get("ugc_type"): score += 20
    if context.get("target_audience"): score += 15
    if context.get("product_analysis"): score += 15
    if context.get("performance_style"): score += 10
    if context.get("setting"): score += 10
    if context.get("custom_hook"): score += 10

    if score >= 80:
        return "high"
    elif score >= 50:
        return "medium"
    else:
        return "low"

def _generate_optimization_tips(context):
    """Generate optimization tips based on context"""
    tips = []

    if not context.get("hook_type"):
        tips.append("Add a compelling hook strategy to grab immediate attention")

    if not context.get("custom_hook"):
        tips.append("Consider adding a custom hook message for more personalization")

    if context.get("target_audience") == "gen-z":
        tips.append("Keep pace fast and include trending elements for Gen Z audience")

    if context.get("ugc_type") == "unboxing":
        tips.append("Focus on the excitement and surprise elements during unboxing")

    tips.append("Test different hooks with your audience to find what converts best")
    tips.append("Ensure the first 3 seconds are highly engaging to prevent scroll-past")

    return tips

def _get_conversion_psychology(context):
    """Get conversion psychology elements"""
    return [
        "Social proof through authentic reactions",
        "Problem-solution framework",
        "Emotional triggers and relatability",
        "Visual demonstration of benefits"
    ]

def _get_technical_elements(context):
    """Get technical elements for Veo3"""
    return [
        "9:16 vertical aspect ratio",
        f"{context.get('video_length', '8')}-second duration",
        "Clear subject focus and framing",
        "Optimized for mobile viewing"
    ]

def _get_enhancement_templates(context=None):
    """Get enhancement templates for different focus areas"""
    return {
        "conversion": {
            "improvements": ["Added urgency triggers", "Enhanced call-to-action", "Included social proof elements"],
            "changes": ["Stronger opening hook", "Clear value proposition", "Conversion-focused language"],
            "boost_explanation": "Enhanced psychological triggers and conversion elements for higher sales potential"
        },
        "visual": {
            "improvements": ["Enhanced cinematography", "Better visual composition", "Improved lighting description"],
            "changes": ["More detailed camera work", "Professional visual elements", "Aesthetic improvements"],
            "boost_explanation": "Improved visual storytelling and cinematography for more engaging content"
        },
        "emotion": {
            "improvements": ["Deeper emotional connection", "Enhanced storytelling", "Relatable scenarios"],
            "changes": ["Emotional language", "Personal connection points", "Empathy-driven content"],
            "boost_explanation": "Amplified emotional resonance for stronger viewer connection and engagement"
        },
        "engagement": {
            "improvements": ["Social media optimized", "Viral potential elements", "Interactive components"],
            "changes": ["Platform-specific optimization", "Shareability factors", "Engagement hooks"],
            "boost_explanation": "Optimized for maximum social media engagement and viral potential"
        }
    }

def _apply_enhancement_template(original_prompt, focus, templates):
    """Apply enhancement template to original prompt"""

    # Enhancement strategies based on focus
    if focus == "conversion":
        # Add conversion elements
        enhanced = f"URGENT: {original_prompt}. Viewers can't stop buying this! Limited time offer - act now before it's gone!"

    elif focus == "visual":
        # Enhance visual elements
        enhanced = f"Cinematic quality: {original_prompt}. Shot with professional-grade lighting, perfect composition, and stunning visual appeal that stops viewers mid-scroll."

    elif focus == "emotion":
        # Add emotional elements
        enhanced = f"Heartfelt story: {original_prompt}. The genuine emotion and personal connection will move viewers to tears and create lasting impact."

    elif focus == "engagement":
        # Add engagement elements
        enhanced = f"Viral potential: {original_prompt}. Designed to maximize shares, comments, and saves. This content will dominate social feeds!"

    else:
        enhanced = original_prompt

    return enhanced

def enhance_prompt_with_templates(original_prompt, enhancement_focus="conversion"):
    """Enhance existing prompt using template-based improvements (no AI tokens used)"""
    try:
        enhancement_templates = _get_enhancement_templates()

        # Apply enhancement based on focus
        enhanced_prompt = _apply_enhancement_template(original_prompt, enhancement_focus, enhancement_templates)

        result = {
            "enhanced_prompt": enhanced_prompt,
            "improvements_made": enhancement_templates[enhancement_focus]["improvements"],
            "enhancement_score": "15-25% improvement",
            "key_changes": enhancement_templates[enhancement_focus]["changes"],
            "conversion_boost": enhancement_templates[enhancement_focus]["boost_explanation"]
        }

        return result

    except Exception as e:
        logging.error(f"Failed to enhance prompt: {e}")
        return {"enhanced_prompt": original_prompt, "improvements_made": [], "enhancement_score": "0% improvement", "key_changes": [], "conversion_boost": "Failed to apply enhancements"}
