# 🔐 Secure API Key Management

This project now includes a secure API key management system that encrypts and stores your OpenAI API key safely on your local machine.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set Up Your API Key (One-time setup)
```bash
python setup_api_keys.py
```

This will:
- Ask you to create a master password
- Securely store your OpenAI API key encrypted
- Test that everything works

### 3. Run Your Application

#### Option A: Set password as environment variable (Recommended)
```bash
export API_KEY_PASSWORD="your_master_password"
python app.py
```

#### Option B: Traditional environment variable (Still works)
```bash
export OPENAI_API_KEY="your_openai_key"
python app.py
```

## 🛠️ Managing API Keys

Use the management tool to view, add, update, or delete stored keys:

```bash
python manage_api_keys.py
```

Features:
- View all stored services
- Add/update API keys
- Test OpenAI connection
- Delete stored keys

## 🔒 How It Works

### Security Features:
- **Encryption**: API keys are encrypted using Fernet (AES 128) with PBKDF2 key derivation
- **Password Protection**: Master password required to access keys
- **Local Storage**: Keys stored locally in `.secure_config/` directory
- **No Hardcoding**: No API keys in your source code
- **Git Safe**: `.secure_config/` is automatically ignored by git

### File Structure:
```
.secure_config/
├── api_keys.enc    # Encrypted API keys
└── salt.key        # Salt for key derivation
```

## 🔄 Migration from Environment Variables

Your existing setup will continue to work! The system checks for API keys in this order:

1. **Environment Variable**: `OPENAI_API_KEY` (highest priority)
2. **Secure Storage**: Encrypted local storage with `API_KEY_PASSWORD`
3. **Error**: If neither found, shows helpful setup instructions

## 🚨 Security Best Practices

### ✅ DO:
- Use a strong master password (8+ characters)
- Keep your master password secure
- Use environment variables in production
- Regularly rotate your API keys

### ❌ DON'T:
- Share your master password
- Commit `.secure_config/` to version control
- Use weak passwords
- Store passwords in plain text

## 🔧 Production Deployment

For production environments, use environment variables:

```bash
# Production
export OPENAI_API_KEY="your_production_key"
export FLASK_ENV="production"
```

The secure storage is perfect for:
- Local development
- Testing environments
- Personal projects
- When you don't want to manage environment variables

## 🆘 Troubleshooting

### "OpenAI API key not found" Error
Run the setup script:
```bash
python setup_api_keys.py
```

### "Wrong password" Error
Your master password is incorrect. Try the management tool:
```bash
python manage_api_keys.py
```

### Reset Everything
Delete the secure config directory:
```bash
rm -rf .secure_config/
python setup_api_keys.py
```

### Test Your Setup
```bash
python manage_api_keys.py
# Choose option 3: Test OpenAI connection
```

## 🔄 Key Rotation

To update your API key:
1. Get new API key from OpenAI
2. Run: `python manage_api_keys.py`
3. Choose "Add/Update API key"
4. Enter your existing master password
5. Enter the new API key

## 📱 Environment Variables Reference

| Variable | Purpose | Required |
|----------|---------|----------|
| `OPENAI_API_KEY` | Direct API key (production) | No* |
| `API_KEY_PASSWORD` | Master password for secure storage | No* |
| `FLASK_ENV` | Environment (development/production) | No |

*At least one method must be configured

## 🎯 Benefits

- **Easy Setup**: One-time configuration
- **Secure**: Military-grade encryption
- **Flexible**: Works with existing environment variables
- **Local**: No external dependencies
- **Git Safe**: Automatically ignored by version control
- **User Friendly**: Simple management tools

Your API keys are now much safer! 🛡️
