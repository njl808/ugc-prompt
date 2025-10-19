class OnboardingTour {
    constructor() {
        this.currentStep = 0;
        this.steps = [
            {
                target: '.header-title',
                title: 'Welcome to UGC Prompt Studio! 🎬',
                content: 'Create professional User-Generated Content video prompts in just 5 simple steps. Let\'s take a quick tour!',
                position: 'bottom'
            },
            {
                target: '.tab-btn[data-tab="product"]',
                title: 'Step 1: Product Analysis',
                content: 'Start by uploading your product image or describing it manually. Our AI will analyze key features, colors, and materials.',
                position: 'bottom'
            },
            {
                target: '.tab-btn[data-tab="actor"]',
                title: 'Step 2: Choose Your Actor',
                content: 'Select from our diverse cast of creators or upload your own. Each actor is designed for specific audiences and product types.',
                position: 'bottom'
            },
            {
                target: '.tab-btn[data-tab="visual"]',
                title: 'Step 3: Visual Settings',
                content: 'Configure the perfect environment - location, lighting, camera work, and platform optimization.',
                position: 'bottom'
            },
            {
                target: '.tab-btn[data-tab="hook"]',
                title: 'Step 4: Hook Strategy',
                content: 'Create compelling opening hooks that stop the scroll. Choose from proven strategies or write your own.',
                position: 'bottom'
            },
            {
                target: '.tab-btn[data-tab="generate"]',
                title: 'Step 5: Generate Prompt',
                content: 'Get your professional UGC video prompt, optimized for AI video generation platforms like Runway and Pika.',
                position: 'bottom'
            },
            {
                target: '#theme-toggle',
                title: 'Customize Your Experience',
                content: 'Switch between dark and light themes, use keyboard shortcuts (Ctrl+?), and enjoy auto-save every 30 seconds.',
                position: 'left'
            },
            {
                target: '.navigation-container',
                title: 'Ready to Create!',
                content: 'You\'re all set! Use the navigation buttons or keyboard shortcuts (Alt + arrows) to move between steps. Happy creating! 🚀',
                position: 'top'
            }
        ];
        this.isActive = false;
        this.overlay = null;
        this.tooltip = null;
    }

    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.currentStep = 0;
        this.createOverlay();
        this.showStep(0);
        
        // Track onboarding start
        this.trackEvent('onboarding_started');
    }

    createOverlay() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'onboarding-overlay';
        this.overlay.innerHTML = `
            <div class="onboarding-backdrop"></div>
        `;
        
        // Create tooltip
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'onboarding-tooltip';
        
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.tooltip);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Bind events
        this.bindEvents();
    }

    bindEvents() {
        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // Click outside to close
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay || e.target.classList.contains('onboarding-backdrop')) {
                this.skip();
            }
        });
    }

    handleKeydown(e) {
        if (!this.isActive) return;
        
        switch (e.key) {
            case 'Escape':
                this.skip();
                break;
            case 'ArrowRight':
            case ' ':
                e.preventDefault();
                this.next();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.previous();
                break;
        }
    }

    showStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.steps.length) return;
        
        this.currentStep = stepIndex;
        const step = this.steps[stepIndex];
        
        // Find target element
        const target = document.querySelector(step.target);
        if (!target) {
            console.warn(`Onboarding target not found: ${step.target}`);
            this.next();
            return;
        }
        
        // Highlight target
        this.highlightElement(target);
        
        // Position and show tooltip
        this.showTooltip(target, step);
        
        // Track step view
        this.trackEvent('onboarding_step_viewed', { step: stepIndex + 1 });
    }

    highlightElement(element) {
        // Remove previous highlights
        document.querySelectorAll('.onboarding-highlight').forEach(el => {
            el.classList.remove('onboarding-highlight');
        });
        
        // Add highlight to current element
        element.classList.add('onboarding-highlight');
        
        // Scroll element into view
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });
        
        // Create spotlight effect
        this.createSpotlight(element);
    }

    createSpotlight(element) {
        const rect = element.getBoundingClientRect();
        const spotlight = document.createElement('div');
        spotlight.className = 'onboarding-spotlight';
        
        // Position spotlight
        spotlight.style.left = `${rect.left - 10}px`;
        spotlight.style.top = `${rect.top - 10}px`;
        spotlight.style.width = `${rect.width + 20}px`;
        spotlight.style.height = `${rect.height + 20}px`;
        
        // Remove previous spotlight
        const existingSpotlight = document.querySelector('.onboarding-spotlight');
        if (existingSpotlight) {
            existingSpotlight.remove();
        }
        
        document.body.appendChild(spotlight);
    }

    showTooltip(target, step) {
        const rect = target.getBoundingClientRect();
        const isFirstStep = this.currentStep === 0;
        const isLastStep = this.currentStep === this.steps.length - 1;
        
        this.tooltip.innerHTML = `
            <div class="tooltip-content">
                <div class="tooltip-header">
                    <h3>${step.title}</h3>
                    <button class="tooltip-close" onclick="window.onboardingTour.skip()">
                        <i class='bx bx-x'></i>
                    </button>
                </div>
                <div class="tooltip-body">
                    <p>${step.content}</p>
                </div>
                <div class="tooltip-footer">
                    <div class="step-indicator">
                        ${this.currentStep + 1} of ${this.steps.length}
                    </div>
                    <div class="tooltip-actions">
                        ${!isFirstStep ? `
                            <button class="btn btn-secondary btn-sm" onclick="window.onboardingTour.previous()">
                                <i class='bx bx-chevron-left'></i>
                                Previous
                            </button>
                        ` : ''}
                        ${!isLastStep ? `
                            <button class="btn btn-primary btn-sm" onclick="window.onboardingTour.next()">
                                Next
                                <i class='bx bx-chevron-right'></i>
                            </button>
                        ` : `
                            <button class="btn btn-primary btn-sm" onclick="window.onboardingTour.finish()">
                                <i class='bx bx-check'></i>
                                Get Started
                            </button>
                        `}
                    </div>
                </div>
                <div class="tooltip-progress">
                    <div class="progress-bar" style="width: ${((this.currentStep + 1) / this.steps.length) * 100}%"></div>
                </div>
            </div>
            <div class="tooltip-arrow"></div>
        `;
        
        // Position tooltip
        this.positionTooltip(target, step.position);
        
        // Show tooltip with animation
        this.tooltip.classList.add('visible');
    }

    positionTooltip(target, position = 'bottom') {
        const rect = target.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        let left, top;
        
        switch (position) {
            case 'top':
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                top = rect.top - tooltipRect.height - 15;
                break;
            case 'bottom':
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                top = rect.bottom + 15;
                break;
            case 'left':
                left = rect.left - tooltipRect.width - 15;
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                break;
            case 'right':
                left = rect.right + 15;
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                break;
        }
        
        // Adjust for viewport boundaries
        if (left < 10) left = 10;
        if (left + tooltipRect.width > viewport.width - 10) {
            left = viewport.width - tooltipRect.width - 10;
        }
        if (top < 10) top = 10;
        if (top + tooltipRect.height > viewport.height - 10) {
            top = viewport.height - tooltipRect.height - 10;
        }
        
        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.top = `${top}px`;
        this.tooltip.setAttribute('data-position', position);
    }

    next() {
        if (this.currentStep < this.steps.length - 1) {
            this.showStep(this.currentStep + 1);
        } else {
            this.finish();
        }
    }

    previous() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }

    skip() {
        this.trackEvent('onboarding_skipped', { step: this.currentStep + 1 });
        this.end();
    }

    finish() {
        this.trackEvent('onboarding_completed');
        this.end();
        
        // Show completion message
        if (window.app && window.app.showToast) {
            window.app.showToast('Welcome to UGC Prompt Studio! Ready to create amazing content? 🎉', 'success');
        }
    }

    end() {
        this.isActive = false;
        
        // Remove elements
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        
        if (this.tooltip) {
            this.tooltip.remove();
            this.tooltip = null;
        }
        
        // Remove highlights and spotlights
        document.querySelectorAll('.onboarding-highlight').forEach(el => {
            el.classList.remove('onboarding-highlight');
        });
        
        document.querySelectorAll('.onboarding-spotlight').forEach(el => {
            el.remove();
        });
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeydown);
        
        // Mark onboarding as completed
        localStorage.setItem('ugc_studio_onboarding_completed', 'true');
    }

    // Static methods for easy access
    static shouldShowOnboarding() {
        return !localStorage.getItem('ugc_studio_onboarding_completed');
    }

    static resetOnboarding() {
        localStorage.removeItem('ugc_studio_onboarding_completed');
    }

    // Analytics tracking
    trackEvent(eventName, properties = {}) {
        // Example analytics call (replace with your analytics service)
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                'event_category': 'Onboarding',
                ...properties
            });
        }
        
        console.log(`Onboarding event: ${eventName}`, properties);
    }

    // Auto-start onboarding for new users
    static autoStart(delay = 1000) {
        if (OnboardingTour.shouldShowOnboarding()) {
            setTimeout(() => {
                if (!window.onboardingTour) {
                    window.onboardingTour = new OnboardingTour();
                }
                window.onboardingTour.start();
            }, delay);
        }
    }
}

// CSS for onboarding (inject into page)
const onboardingCSS = `
.onboarding-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    pointer-events: none;
}

.onboarding-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(1px);
    pointer-events: all;
}

.onboarding-spotlight {
    position: fixed;
    background: transparent;
    border-radius: 8px;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4);
    z-index: 10001;
    pointer-events: none;
    transition: all 0.3s ease;
    border: 2px solid var(--primary-400);
}

.onboarding-highlight {
    position: relative;
    z-index: 10002 !important;
    pointer-events: all !important;
}

.onboarding-tooltip {
    position: fixed;
    z-index: 10003;
    max-width: 400px;
    background: var(--bg-elevated);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-xl);
    opacity: 0;
    transform: scale(0.9);
    transition: all 0.3s ease;
    pointer-events: all;
}

.onboarding-tooltip.visible {
    opacity: 1;
    transform: scale(1);
}

.tooltip-content {
    padding: 0;
    overflow: hidden;
    border-radius: var(--radius-xl);
}

.tooltip-header {
    padding: var(--space-5) var(--space-6) var(--space-3);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--gradient-primary);
    color: white;
}

.tooltip-header h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
}

.tooltip-close {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: var(--space-1);
    border-radius: 50%;
    transition: background-color 0.2s ease;
}

.tooltip-close:hover {
    background: rgba(255, 255, 255, 0.2);
}

.tooltip-body {
    padding: var(--space-4) var(--space-6);
}

.tooltip-body p {
    margin: 0;
    color: var(--text-secondary);
    line-height: 1.5;
}

.tooltip-footer {
    padding: var(--space-4) var(--space-6);
    background: var(--bg-secondary);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.step-indicator {
    font-size: 0.875rem;
    color: var(--text-tertiary);
    font-weight: 500;
}

.tooltip-actions {
    display: flex;
    gap: var(--space-3);
}

.tooltip-progress {
    height: 3px;
    background: var(--bg-tertiary);
    position: relative;
}

.progress-bar {
    height: 100%;
    background: var(--gradient-primary);
    transition: width 0.3s ease;
}

.tooltip-arrow {
    position: absolute;
    width: 12px;
    height: 12px;
    background: var(--bg-elevated);
    border: 1px solid var(--border-primary);
    transform: rotate(45deg);
}

.onboarding-tooltip[data-position="bottom"] .tooltip-arrow {
    top: -7px;
    left: 50%;
    margin-left: -6px;
    border-bottom: none;
    border-right: none;
}

.onboarding-tooltip[data-position="top"] .tooltip-arrow {
    bottom: -7px;
    left: 50%;
    margin-left: -6px;
    border-top: none;
    border-left: none;
}

.onboarding-tooltip[data-position="left"] .tooltip-arrow {
    right: -7px;
    top: 50%;
    margin-top: -6px;
    border-left: none;
    border-bottom: none;
}

.onboarding-tooltip[data-position="right"] .tooltip-arrow {
    left: -7px;
    top: 50%;
    margin-top: -6px;
    border-right: none;
    border-top: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .onboarding-tooltip {
        max-width: calc(100vw - 40px);
        left: 20px !important;
        right: 20px !important;
        width: auto !important;
    }
    
    .tooltip-footer {
        flex-direction: column;
        gap: var(--space-3);
        align-items: stretch;
    }
    
    .tooltip-actions {
        justify-content: center;
    }
}
`;

// Inject CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = onboardingCSS;
document.head.appendChild(styleSheet);

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OnboardingTour;
}

// Make available globally
window.OnboardingTour = OnboardingTour;
