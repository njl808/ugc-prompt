# Overview

This is an AI-powered UGC (User-Generated Content) advertisement prompt generator that analyzes product images and creates optimized prompts for generating high-converting video advertisements.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application uses a traditional server-rendered Flask architecture with progressive enhancement through JavaScript. The frontend consists of:

- **Multi-step wizard interface**: Three-step process (upload → configure → generate) with visual progress tracking
- **Responsive design**: Built with modern CSS custom properties and flexbox/grid layouts
- **Interactive components**: File upload with drag-and-drop, theme toggling, and dynamic form handling
- **State management**: Client-side JavaScript class managing application state and user interactions

## Backend Architecture
The backend is built on Flask with a modular service-oriented approach:

- **Flask web framework**: Lightweight Python web server handling HTTP requests and responses
- **Service layer separation**: OpenAI integration abstracted into dedicated service module
- **File handling**: Secure image upload with validation, resizing, and base64 conversion
- **Session management**: Flask sessions for maintaining user state across requests

## Data Processing Pipeline
The application follows a linear data processing workflow:

1. **Image preprocessing**: Uploaded images are validated, resized (max 1024px), converted to RGB format, and encoded to base64
2. **AI analysis**: Images are sent to OpenAI's GPT-4V model for structured product analysis
3. **Prompt generation**: Analysis results combined with user preferences to generate UGC video prompts
4. **Template system**: Jinja2 templates render dynamic content based on application state

## Security and Validation
Security measures implemented throughout the application:

- **File type validation**: Restricted to common image formats (PNG, JPG, JPEG, GIF, WebP)
- **File size limits**: Maximum 16MB upload size to prevent abuse
- **Secure filename handling**: Werkzeug's secure_filename for safe file storage
- **Environment variable configuration**: Sensitive data like API keys stored in environment variables

# External Dependencies

## AI Services
- **OpenAI API**: GPT-4V model for image analysis and prompt generation, requiring OPENAI_API_KEY environment variable

## Python Libraries
- **Flask**: Web framework with CORS support for cross-origin requests
- **Pillow (PIL)**: Image processing for resizing, format conversion, and optimization
- **Werkzeug**: File handling utilities and security functions

## Frontend Assets
- **Custom CSS**: No external CSS frameworks, using modern CSS features and custom design system
- **Vanilla JavaScript**: No frontend frameworks, pure JavaScript for interactivity and state management

## Development Environment
- **Environment variables**: SESSION_SECRET for Flask sessions, OPENAI_API_KEY for AI integration
- **File system**: Local file storage in uploads directory for temporary image processing

# License

This project is licensed under the [MIT License](./LICENSE).