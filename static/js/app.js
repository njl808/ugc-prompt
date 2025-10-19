class UGCStudio {
    constructor() {
        this.currentTab = 'product';
        this.analysisData = null;
        this.actorData = null;
        this.locationData = null;
        this.sceneData = null;
        this.autoSaveTimer = null;
        this.tourStep = 0;
        this.tourActive = false;
        this.selectedOptions = {
            contentType: 'unboxing',
            analysisMethod: 'upload',
            creatorAge: 'young_adult',
            creatorStyle: 'authentic',
            characterArchetype: 'Jake',
            energyLevel: 'moderate',
            tone: 'conversational',
            platform: 'tiktok',
            location: 'office',
            lighting: 'natural',
            cameraStyle: 'handheld',
            hookStrategy: 'problem_solution',
            conversionFocus: 'consideration',
            visualStyle: 'minimal'
        };

        this.init();
    }

    init() {
        // Initialize lazy loading
        this.initLazyLoading();

        // Initialize UX enhancements
        this.initUXEnhancements();

        this.bindEvents();
        this.setTheme(localStorage.getItem('theme') || 'dark');
        this.updateTabNavigation();

        // Ensure only the first tab is visible on load
        this.switchTab('product');

        // Force render all dynamic content
        setTimeout(() => {
            this.renderContentTypes();
            this.renderAnalysisMethods();
            this.renderActorCards();
            this.renderPerformanceStyles();
            this.renderVisualSettings();
            this.renderHookStrategies();
            this.renderEnhancementOptions();
        }, 100);
    }

    // UX Enhancement Initialization
    initUXEnhancements() {
        // Initialize auto-save
        this.initAutoSave();
        
        // Initialize keyboard shortcuts
        this.initKeyboardShortcuts();
        
        // Initialize tooltips
        this.initTooltips();
        
        // Initialize form validation
        this.initFormValidation();
        
        // Initialize progress tracking
        this.initProgressTracking();
        
        // Add auto-save indicator to DOM
        this.createAutoSaveIndicator();
        
        // Initialize accessibility features
        this.initAccessibility();
    }

    // Auto-save functionality
    initAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.autoSave();
        }, 30000); // Auto-save every 30 seconds
        
        // Save on significant changes
        this.lastSaveState = JSON.stringify(this.selectedOptions);
    }

    autoSave() {
        const currentState = JSON.stringify({
            selectedOptions: this.selectedOptions,
            analysisData: this.analysisData,
            actorData: this.actorData,
            sceneData: this.sceneData,
            currentTab: this.currentTab
        });

        if (currentState !== this.lastSaveState) {
            this.showAutoSaveIndicator('saving');
            
            try {
                localStorage.setItem('ugc_studio_autosave', currentState);
                this.lastSaveState = currentState;
                
                setTimeout(() => {
                    this.showAutoSaveIndicator('saved');
                    setTimeout(() => {
                        this.hideAutoSaveIndicator();
                    }, 2000);
                }, 500);
            } catch (error) {
                console.error('Auto-save failed:', error);
                this.showAutoSaveIndicator('error');
            }
        }
    }

    createAutoSaveIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'auto-save-indicator';
        indicator.className = 'auto-save-indicator';
        indicator.innerHTML = `
            <i class='bx bx-save'></i>
            <span>Auto-saved</span>
        `;
        document.body.appendChild(indicator);
    }

    showAutoSaveIndicator(state) {
        const indicator = document.getElementById('auto-save-indicator');
        if (!indicator) return;

        indicator.className = `auto-save-indicator show ${state}`;
        
        const icon = indicator.querySelector('i');
        const text = indicator.querySelector('span');
        
        switch (state) {
            case 'saving':
                icon.className = 'bx bx-loader-alt bx-spin';
                text.textContent = 'Saving...';
                break;
            case 'saved':
                icon.className = 'bx bx-check';
                text.textContent = 'Auto-saved';
                break;
            case 'error':
                icon.className = 'bx bx-error';
                text.textContent = 'Save failed';
                break;
        }
    }

    hideAutoSaveIndicator() {
        const indicator = document.getElementById('auto-save-indicator');
        if (indicator) {
            indicator.classList.remove('show');
        }
    }

    // Keyboard shortcuts
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S for manual save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.manualSave();
            }
            
            // Ctrl/Cmd + ? for help
            if ((e.ctrlKey || e.metaKey) && e.key === '?') {
                e.preventDefault();
                this.toggleKeyboardShortcuts();
            }
            
            // Arrow keys for tab navigation
            if (e.key === 'ArrowLeft' && e.altKey) {
                e.preventDefault();
                this.previousTab();
            }
            
            if (e.key === 'ArrowRight' && e.altKey) {
                e.preventDefault();
                this.nextTab();
            }
            
            // Escape to close modals/uploaders
            if (e.key === 'Escape') {
                this.closeActiveModals();
                this.hideKeyboardShortcuts();
            }
        });
    }

    // Toggle keyboard shortcuts modal
    toggleKeyboardShortcuts() {
        const modal = document.getElementById('keyboard-shortcuts');
        if (modal) {
            modal.classList.toggle('visible');
        }
    }

    hideKeyboardShortcuts() {
        const modal = document.getElementById('keyboard-shortcuts');
        if (modal) {
            modal.classList.remove('visible');
        }
    }

    manualSave() {
        this.showAutoSaveIndicator('saving');
        this.autoSave();
        this.showToast('Project saved manually! 💾', 'success');
    }

    closeActiveModals() {
        // Close any active uploaders
        const sceneUploader = document.getElementById('scene-uploader');
        const actorUploader = document.getElementById('actor-uploader');
        
        if (sceneUploader) sceneUploader.remove();
        if (actorUploader) actorUploader.remove();
    }

    // Tooltip initialization
    initTooltips() {
        // Add tooltips to key elements
        this.addTooltips();
    }

    addTooltips() {
        const tooltipElements = [
            { selector: '#theme-toggle', text: 'Toggle dark/light theme' },
            { selector: '#new-project', text: 'Start a new project (clears all data)' },
            { selector: '.tab-btn[data-tab="product"]', text: 'Define your product and analysis method' },
            { selector: '.tab-btn[data-tab="actor"]', text: 'Choose your content creator' },
            { selector: '.tab-btn[data-tab="visual"]', text: 'Set visual and technical parameters' },
            { selector: '.tab-btn[data-tab="hook"]', text: 'Create compelling hooks and messages' },
            { selector: '.tab-btn[data-tab="generate"]', text: 'Generate your final UGC prompt' },
            { selector: '#generate-prompt', text: 'Create your UGC video prompt' },
            { selector: '#copy-prompt', text: 'Copy prompt to clipboard' }
        ];

        tooltipElements.forEach(({ selector, text }) => {
            const element = document.querySelector(selector);
            if (element) {
                element.classList.add('tooltip');
                element.setAttribute('data-tooltip', text);
            }
        });
    }

    // Form validation
    initFormValidation() {
        // Add character counters to text inputs
        this.addCharacterCounters();
        
        // Add real-time validation
        this.addFormValidation();
    }

    addCharacterCounters() {
        const textInputs = [
            { selector: '#product-name', maxLength: 100 },
            { selector: '#target-audience', maxLength: 200 },
            { selector: '#manual-description', maxLength: 1000 },
            { selector: '#custom-message', maxLength: 300 }
        ];

        textInputs.forEach(({ selector, maxLength }) => {
            const input = document.querySelector(selector);
            if (input) {
                this.addCharacterCounter(input, maxLength);
            }
        });
    }

    addCharacterCounter(input, maxLength) {
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        
        const updateCounter = () => {
            const length = input.value.length;
            counter.textContent = `${length}/${maxLength}`;
            
            counter.classList.remove('warning', 'error');
            if (length > maxLength * 0.8) {
                counter.classList.add('warning');
            }
            if (length > maxLength) {
                counter.classList.add('error');
            }
        };

        input.addEventListener('input', updateCounter);
        input.parentNode.appendChild(counter);
        updateCounter();
    }

    addFormValidation() {
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldValidation(input));
        });
    }

    validateField(field) {
        const fieldContainer = field.closest('.form-field');
        if (!fieldContainer) return;

        let isValid = true;
        let message = '';

        // Required field validation
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            message = 'This field is required';
        }

        this.setFieldValidation(fieldContainer, isValid, message);
    }

    setFieldValidation(fieldContainer, isValid, message) {
        fieldContainer.classList.remove('error', 'success');
        
        // Remove existing feedback
        const existingFeedback = fieldContainer.querySelector('.field-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        if (!isValid) {
            fieldContainer.classList.add('error');
            if (message) {
                const feedback = document.createElement('div');
                feedback.className = 'field-feedback error';
                feedback.innerHTML = `<i class='bx bx-error-circle'></i> ${message}`;
                fieldContainer.appendChild(feedback);
            }
        } else if (fieldContainer.querySelector('input, textarea').value.trim()) {
            fieldContainer.classList.add('success');
        }
    }

    clearFieldValidation(field) {
        const fieldContainer = field.closest('.form-field');
        if (fieldContainer) {
            fieldContainer.classList.remove('error');
            const feedback = fieldContainer.querySelector('.field-feedback.error');
            if (feedback) {
                feedback.remove();
            }
        }
    }

    // Progress tracking
    initProgressTracking() {
        this.completedSteps = new Set();
        this.updateStepCompletion();
    }

    updateStepCompletion() {
        const steps = ['product', 'actor', 'visual', 'hook', 'generate'];
        
        steps.forEach(step => {
            const isCompleted = this.isStepCompleted(step);
            const tabBtn = document.querySelector(`[data-tab="${step}"]`);
            
            if (tabBtn) {
                if (isCompleted) {
                    tabBtn.classList.add('completed');
                    this.completedSteps.add(step);
                } else {
                    tabBtn.classList.remove('completed');
                    this.completedSteps.delete(step);
                }
            }
        });
    }

    isStepCompleted(step) {
        switch (step) {
            case 'product':
                return this.analysisData || (this.selectedOptions.analysisMethod === 'manual' && 
                       document.getElementById('product-name')?.value && 
                       document.getElementById('manual-description')?.value);
            case 'actor':
                return this.selectedOptions.characterArchetype;
            case 'visual':
                return this.selectedOptions.location && this.selectedOptions.lighting;
            case 'hook':
                return this.selectedOptions.hookStrategy;
            case 'generate':
                return document.getElementById('prompt-display')?.textContent;
            default:
                return false;
        }
    }

    // Accessibility features
    initAccessibility() {
        // Add keyboard navigation class when using keyboard
        document.addEventListener('keydown', () => {
            document.body.classList.add('keyboard-navigation');
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });

        // Add ARIA labels and roles
        this.addAriaLabels();
    }

    addAriaLabels() {
        // Add ARIA labels to tab navigation
        const tabNav = document.querySelector('.tab-nav');
        if (tabNav) {
            tabNav.setAttribute('role', 'tablist');
            tabNav.setAttribute('aria-label', 'UGC Studio Steps');
        }

        // Add ARIA labels to tab buttons
        document.querySelectorAll('.tab-btn').forEach((btn, index) => {
            btn.setAttribute('role', 'tab');
            btn.setAttribute('aria-controls', `${btn.dataset.tab}-tab`);
            btn.setAttribute('tabindex', index === 0 ? '0' : '-1');
        });

        // Add ARIA labels to tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.setAttribute('role', 'tabpanel');
            panel.setAttribute('tabindex', '0');
        });
    }

    // Lazy Loading Implementation
    initLazyLoading() {
        // Check if IntersectionObserver is supported
        if ('IntersectionObserver' in window) {
            this.lazyImageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px', // Start loading 50px before image enters viewport
                threshold: 0.01
            });
        } else {
            // Fallback for older browsers
            this.lazyImageObserver = null;
        }
    }

    loadImage(img) {
        const src = img.dataset.src;
        if (src) {
            // Show loading placeholder
            img.style.opacity = '0.5';
            img.style.filter = 'blur(5px)';

            // Create a new image to preload
            const imageLoader = new Image();
            imageLoader.onload = () => {
                img.src = src;
                img.removeAttribute('data-src');
                img.classList.add('loaded');

                // Smooth transition
                img.style.transition = 'opacity 0.3s ease, filter 0.3s ease';
                img.style.opacity = '1';
                img.style.filter = 'none';
            };
            imageLoader.onerror = () => {
                img.style.opacity = '1';
                img.style.filter = 'none';
                img.alt = 'Image failed to load';
            };
            imageLoader.src = src;
        }
    }

    observeLazyImages() {
        if (this.lazyImageObserver) {
            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => {
                this.lazyImageObserver.observe(img);
            });
        } else {
            // Fallback: load all images immediately
            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => this.loadImage(img));
        }
    }

    async renderContentTypes() {
        const container = document.querySelector('.content-type-grid');
        if (!container) return;

        const data = await this.getLocationData();
        const contentTypes = data.content_types;

        container.innerHTML = contentTypes.map(type => `
            <div class="content-card ${type.id === 'unboxing' ? 'active' : ''}" data-type="${type.id}">
                <i class='bx ${type.icon}'></i>
                <span>${type.name}</span>
            </div>
        `).join('');
    }

    async renderAnalysisMethods() {
        const container = document.querySelector('.method-options');
        if (!container) return;

        const data = await this.getLocationData();
        const methods = data.analysis_methods;

        container.innerHTML = methods.map(method => `
            <div class="method-card ${method.active ? 'active' : ''}" data-method="${method.id}">
                <i class='bx ${method.icon}'></i>
                <h4>${method.name}</h4>
                <p>${method.description}</p>
            </div>
        `).join('');
    }

    async renderPerformanceStyles() {
        const container = document.querySelector('.performance-grid');
        if (!container) return;

        const data = await this.getLocationData();

        container.innerHTML = `
            <div class="selection-group">
                <label>Energy Level</label>
                <div class="option-cards">
                    ${data.energy_levels.map(level => `
                        <div class="option-card ${level.active ? 'active' : ''}" data-value="${level.id}">
                            <i class='bx ${level.icon}'></i>
                            <div class="content">
                                <span>${level.name}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="selection-group">
                <label>Tone</label>
                <div class="option-cards">
                    ${data.tones.map(tone => `
                        <div class="option-card ${tone.active ? 'active' : ''}" data-value="${tone.id}">
                            <i class='bx ${tone.icon}'></i>
                            <div class="content">
                                <span>${tone.name}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async renderHookStrategies() {
        const container = document.querySelector('.hook-cards');
        if (!container) return;

        const data = await this.getLocationData();
        const hooks = data.hook_strategies;

        container.innerHTML = hooks.map(hook => `
            <div class="option-card ${hook.active ? 'active' : ''}" data-value="${hook.id}">
                <i class='bx ${hook.icon}'></i>
                <div class="content">
                    <span>${hook.name}</span>
                    <small>"${hook.description}"</small>
                </div>
            </div>
        `).join('');
    }

    async renderEnhancementOptions() {
        const container = document.querySelector('.enhancement-grid');
        if (!container) return;

        const data = await this.getLocationData();

        container.innerHTML = `
            <div class="selection-group">
                <label>Conversion Focus</label>
                <div class="option-cards">
                    ${data.conversion_focus.map(focus => `
                        <div class="option-card ${focus.active ? 'active' : ''}" data-value="${focus.id}">
                            <i class='bx ${focus.icon}'></i>
                            <div class="content">
                                <span>${focus.name}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="selection-group">
                <label>Visual Style</label>
                <div class="option-cards">
                    ${data.visual_styles.map(style => `
                        <div class="option-card ${style.active ? 'active' : ''}" data-value="${style.id}">
                            <i class='bx ${style.icon}'></i>
                            <div class="content">
                                <span>${style.name}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async renderActorCards() {
        const actorContainer = document.querySelector('.character-cards');
        console.log('Actor container found:', !!actorContainer);

        if (!actorContainer) {
            console.error('Actor container not found!');
            return;
        }

        const actorData = await this.getActorData();
        console.log('Actor data loaded:', actorData.length, 'actors');

        const cardsHTML = actorData.map(actor => `
            <div class="option-card ${actor.name === 'Jake' ? 'active' : ''}" data-value="${actor.name}">
                <div class="actor-image-container">
                    <img data-src="${actor.image}" alt="${actor.name} - ${actor.role}" class="actor-image lazy-image" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='92' height='180' viewBox='0 0 92 180'%3E%3Crect width='92' height='180' fill='%23334155'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' fill='%23cbd5e1' text-anchor='middle' dominant-baseline='middle'%3ELoading...%3C/text%3E%3C/svg%3E">
                </div>
                <div class="content">
                    <div class="actor-name">${actor.name}</div>
                    <div class="actor-details">${actor.age} year old</div>
                    <div class="actor-role">${actor.role}</div>
                    <div class="actor-bio">${actor.bio}</div>
                </div>
            </div>
        `).join('');

        actorContainer.innerHTML = cardsHTML;
        console.log('Actor cards rendered:', actorContainer.children.length);

        // Add custom actor upload button
        this.addCustomActorButton(actorContainer);

        // Initialize lazy loading for newly added images
        setTimeout(() => this.observeLazyImages(), 100);
    }

    async renderVisualSettings() {
        // Render Platform options
        const platformContainer = document.querySelector('[data-setting="platform"] .option-cards');
        if (platformContainer) {
            const platformData = await this.getPlatformData();
            platformContainer.innerHTML = platformData.map(platform => `
                <div class="option-card ${platform.id === 'tiktok' ? 'active' : ''}" data-value="${platform.id}">
                    <i class='bx ${platform.icon}'></i>
                    <div class="content">
                        <span>${platform.name}</span>
                    </div>
                </div>
            `).join('');
        }

        // Render Location options (excluding custom_scene)
        const locationContainer = document.querySelector('.location-cards');
        console.log('Location container found:', !!locationContainer);

        if (locationContainer) {
            const locationData = await this.getLocationDataList();
            const filteredLocations = locationData.filter(location => location.id !== 'custom_scene');
            console.log('Location data loaded:', filteredLocations.length, 'locations');

            const locationHTML = filteredLocations.map(location => `
                <div class="option-card ${location.id === 'office' ? 'active' : ''}" data-value="${location.id}">
                    <i class='bx ${location.icon}'></i>
                    <div class="content">
                        <span>${location.name}</span>
                        <small>${location.description}</small>
                    </div>
                </div>
            `).join('');

            locationContainer.innerHTML = locationHTML;
            console.log('Location cards rendered:', locationContainer.children.length);

            // Add event listeners to dynamically rendered location cards
            locationContainer.querySelectorAll('.option-card').forEach(card => {
                card.addEventListener('click', (e) => this.selectOption(e.currentTarget));
            });

            // Add custom scene upload button
            this.addCustomSceneButton(locationContainer);
        }

        // Render Lighting options
        const lightingContainer = document.querySelector('[data-setting="lighting"] .option-cards');
        if (lightingContainer) {
            const lightingData = await this.getLightingData();
            lightingContainer.innerHTML = lightingData.map(lighting => `
                <div class="option-card ${lighting.id === 'natural' ? 'active' : ''}" data-value="${lighting.id}">
                    <i class='bx ${lighting.icon}'></i>
                    <div class="content">
                        <span>${lighting.name}</span>
                    </div>
                </div>
            `).join('');
        }

        // Render Camera Style options
        const cameraContainer = document.querySelector('[data-setting="camera"] .option-cards');
        if (cameraContainer) {
            const cameraData = await this.getCameraData();
            cameraContainer.innerHTML = cameraData.map(camera => `
                <div class="option-card ${camera.id === 'handheld' ? 'active' : ''}" data-value="${camera.id}">
                    <i class='bx ${camera.icon}'></i>
                    <div class="content">
                        <span>${camera.name}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    bindEvents() {
        // Theme toggle
        document.getElementById('theme-toggle')?.addEventListener('click', () => this.toggleTheme());

        // New project
        document.getElementById('new-project')?.addEventListener('click', () => this.newProject());

        // Help toggle
        document.getElementById('help-toggle')?.addEventListener('click', () => this.toggleKeyboardShortcuts());

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const tab = e.currentTarget.dataset.tab;
                if (tab) {
                    this.switchTab(tab);
                }
            });
        });

        // Navigation buttons
        document.getElementById('prev-tab')?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.previousTab();
        });
        document.getElementById('next-tab')?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.nextTab();
        });

        // Use event delegation for dynamically created content
        document.addEventListener('click', (e) => {
            // Content type cards
            if (e.target.closest('.content-card')) {
                const card = e.target.closest('.content-card');
                this.selectContentType(card.dataset.type);
            }
            
            // Method selection cards
            if (e.target.closest('.method-card')) {
                const card = e.target.closest('.method-card');
                this.selectAnalysisMethod(card.dataset.method);
            }
            
            // Option cards (including actor cards)
            if (e.target.closest('.option-card')) {
                const card = e.target.closest('.option-card');
                this.selectOption(card);
            }
            
            // Manual description button
            if (e.target.matches('#use-manual-btn') || e.target.closest('#use-manual-btn')) {
                e.preventDefault();
                this.useManualDescription();
            }
        });

        // File upload with debugging
        const uploadZone = document.getElementById('upload-zone');
        const imageInput = document.getElementById('image-input');

        console.log('Upload elements:', {uploadZone: !!uploadZone, imageInput: !!imageInput});

        if (uploadZone && imageInput) {
            uploadZone.addEventListener('click', (e) => {
                console.log('Upload zone clicked');
                // Don't prevent default, just trigger file input
                imageInput.click();
            });
            uploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
            uploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            uploadZone.addEventListener('drop', (e) => this.handleDrop(e));

            imageInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Generate prompt
        document.getElementById('generate-prompt')?.addEventListener('click', () => this.generatePrompt());

        // Copy prompt
        document.getElementById('copy-prompt')?.addEventListener('click', () => this.copyPrompt());

        // Regenerate prompt
        document.getElementById('regenerate-prompt')?.addEventListener('click', () => this.generatePrompt());
    }

    // Theme Management
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        const themeIcon = document.querySelector('#theme-toggle i');
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
        }
    }

    // Tab Management
    switchTab(tabName) {
        if (!tabName || this.currentTab === tabName) return;

        console.log('Switching to tab:', tabName);
        this.currentTab = tabName;

        // Use requestAnimationFrame to ensure smooth transitions
        requestAnimationFrame(() => {
            // Update tab buttons
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
            if (targetBtn) {
                targetBtn.classList.add('active');
                targetBtn.setAttribute('aria-selected', 'true');
            }

            // Update tab panels - hide all first
            document.querySelectorAll('.tab-panel').forEach(panel => {
                panel.classList.remove('active');
                panel.style.display = 'none';
                panel.setAttribute('aria-hidden', 'true');
            });

            // Show the target panel
            const targetPanel = document.getElementById(`${tabName}-tab`);
            if (targetPanel) {
                targetPanel.classList.add('active');
                targetPanel.style.display = 'block';
                targetPanel.setAttribute('aria-hidden', 'false');
            }

            this.updateTabNavigation();
        });
    }

    updateTabNavigation() {
        const tabs = ['product', 'actor', 'visual', 'hook', 'generate'];
        const currentIndex = tabs.indexOf(this.currentTab);

        // Update progress bar
        this.updateProgressBar(currentIndex);

        // Mark previous steps as completed
        document.querySelectorAll('.tab-btn').forEach((btn, index) => {
            btn.classList.remove('completed');
            if (index < currentIndex) {
                btn.classList.add('completed');
            }
        });

        const prevBtn = document.getElementById('prev-tab');
        const nextBtn = document.getElementById('next-tab');

        if (prevBtn) {
            prevBtn.style.display = currentIndex > 0 ? 'flex' : 'none';
        }

        if (nextBtn) {
            if (currentIndex < tabs.length - 1) {
                nextBtn.style.display = 'flex';
                nextBtn.innerHTML = `Next <i class='bx bx-chevron-right'></i>`;
            } else {
                nextBtn.style.display = 'none';
            }
        }
    }

    updateProgressBar(currentStep) {
        // Get all progress segments
        const progressSegments = document.querySelectorAll('.progress-segment');
        if (!progressSegments.length) return;

        // Show segments based on current step
        // Segment 1: Product to Actor (show when on Actor or later)
        // Segment 2: Actor to Visual (show when on Visual or later)  
        // Segment 3: Visual to Hook (show when on Hook or later)
        // Segment 4: Hook to Generate (show when on Generate)
        
        progressSegments.forEach((segment, index) => {
            const segmentNumber = index + 1;
            
            if (currentStep >= segmentNumber) {
                // Show this segment with animation
                segment.classList.add('active');
            } else {
                // Hide this segment
                segment.classList.remove('active');
            }
        });
    }

    previousTab() {
        const tabs = ['product', 'actor', 'visual', 'hook', 'generate'];
        const currentIndex = tabs.indexOf(this.currentTab);
        if (currentIndex > 0) {
            this.switchTab(tabs[currentIndex - 1]);
        }
    }

    nextTab() {
        const tabs = ['product', 'actor', 'visual', 'hook', 'generate'];
        const currentIndex = tabs.indexOf(this.currentTab);
        if (currentIndex < tabs.length - 1) {
            this.switchTab(tabs[currentIndex + 1]);
        }
    }

    // Selection Management
    selectContentType(type) {
        this.selectedOptions.contentType = type;

        document.querySelectorAll('.content-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector(`[data-type="${type}"]`)?.classList.add('active');
    }

    selectAnalysisMethod(method) {
        this.selectedOptions.analysisMethod = method;

        document.querySelectorAll('.method-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector(`[data-method="${method}"]`)?.classList.add('active');

        // Show/hide upload zone and manual zone
        const uploadZone = document.getElementById('upload-zone');
        const manualZone = document.getElementById('manual-zone');

        if (method === 'upload') {
            uploadZone.style.display = 'block';
            manualZone.style.display = 'none';
        } else {
            uploadZone.style.display = 'none';
            manualZone.style.display = 'block';
        }
    }

    addCustomSceneButton(locationContainer) {
        const customSceneButton = document.createElement('button');
        customSceneButton.className = 'btn btn-secondary custom-scene-btn';
        customSceneButton.innerHTML = `
            <i class='bx bx-camera-plus'></i>
            Upload Custom Scene
        `;

        customSceneButton.addEventListener('click', () => {
            this.showSceneUploader();
        });

        // Insert after location cards
        const parentContainer = locationContainer.parentNode;
        parentContainer.appendChild(customSceneButton);
    }

    addCustomActorButton(actorContainer) {
        const customActorButton = document.createElement('button');
        customActorButton.className = 'btn btn-secondary custom-actor-btn';
        customActorButton.innerHTML = `
            <i class='bx bx-user-plus'></i>
            Upload Custom Actor
        `;

        customActorButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Custom actor button clicked');
            this.showActorUploader();
        });

        // Insert after actor cards
        const parentContainer = actorContainer.parentNode;
        parentContainer.appendChild(customActorButton);
    }

    selectOption(card) {
        const group = card.closest('.selection-group');
        if (!group) return;

        // Remove active from siblings
        group.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));

        // Add active to clicked card
        card.classList.add('active');

        // Store selection based on data attribute
        const value = card.dataset.value;
        const groupLabel = group.querySelector('label')?.textContent?.toLowerCase().replace(/\s+/g, '');

        // Map selections to our options object
        if (groupLabel?.includes('age')) this.selectedOptions.creatorAge = value;
        else if (groupLabel?.includes('creator') || groupLabel?.includes('style')) this.selectedOptions.creatorStyle = value;
        else if (groupLabel?.includes('character') || groupLabel?.includes('archetype')) this.selectedOptions.characterArchetype = value;
        else if (groupLabel?.includes('energy')) this.selectedOptions.energyLevel = value;
        else if (groupLabel?.includes('tone')) this.selectedOptions.tone = value;
        else if (groupLabel?.includes('platform')) this.selectedOptions.platform = value;
        else if (groupLabel?.includes('location')) this.selectedOptions.location = value;
        else if (groupLabel?.includes('lighting')) this.selectedOptions.lighting = value;
        else if (groupLabel?.includes('camera')) this.selectedOptions.cameraStyle = value;
        else if (groupLabel?.includes('hook')) this.selectedOptions.hookStrategy = value;
        else if (groupLabel?.includes('conversion')) this.selectedOptions.conversionFocus = value;
        else if (groupLabel?.includes('visual')) this.selectedOptions.visualStyle = value;
    }

    showSceneUploader() {
        const existingUploader = document.getElementById('scene-uploader');
        if (existingUploader) {
            existingUploader.remove();
        }

        const locationSection = document.querySelector('.location-showcase .card-content');
        if (!locationSection) return;

        const uploader = document.createElement('div');
        uploader.id = 'scene-uploader';
        uploader.className = 'scene-upload-zone';
        uploader.innerHTML = `
            <div class="scene-upload-content">
                <i class='bx bx-camera-plus'></i>
                <h4>Upload Scene Photo</h4>
                <p>Drop your room/location photo here or click to browse</p>
                <small>PNG, JPG, JPEG • Max 16MB</small>
                <input type="file" id="scene-input" accept="image/*" style="display: none;">
                <button class="btn btn-sm btn-secondary close-uploader">
                    <i class='bx bx-x'></i> Cancel
                </button>
            </div>
        `;

        locationSection.appendChild(uploader);

        const sceneInput = uploader.querySelector('#scene-input');
        const closeBtn = uploader.querySelector('.close-uploader');

        uploader.addEventListener('click', (e) => {
            if (e.target !== closeBtn && !closeBtn.contains(e.target)) {
                sceneInput.click();
            }
        });
        uploader.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploader.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploader.addEventListener('drop', (e) => this.handleSceneDrop(e));
        sceneInput.addEventListener('change', (e) => this.handleSceneSelect(e));
        closeBtn.addEventListener('click', () => uploader.remove());
    }

    handleSceneDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processSceneFile(files[0]);
        }
    }

    handleSceneSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processSceneFile(file);
        }
    }

    processSceneFile(file) {
        if (!file.type.startsWith('image/')) {
            this.showToast('Please select a valid image file', 'error');
            return;
        }

        if (file.size > 16 * 1024 * 1024) {
            this.showToast('File size must be less than 16MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.analyzeScene(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    analyzeScene(imageData) {
        this.showLoading('Analyzing your scene...');

        fetch('/analyze-scene', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: imageData
            })
        })
        .then(response => response.json())
        .then(data => {
            this.hideLoading();
            if (data.success) {
                this.sceneData = data.scene_analysis;
                this.displaySceneResults(data.scene_analysis);
                this.showToast('Scene analysis complete! 🎬', 'success');
            } else {
                this.showToast(data.error || 'Scene analysis failed', 'error');
            }
        })
        .catch(error => {
            this.hideLoading();
            this.showToast('Scene analysis failed: ' + error.message, 'error');
        });
    }

    displaySceneResults(sceneAnalysis) {
        const uploader = document.getElementById('scene-uploader');
        if (!uploader) return;

        uploader.innerHTML = `
            <div class="scene-results">
                <i class='bx bx-check-circle'></i>
                <h4>Scene Analyzed Successfully!</h4>
                <p class="scene-description">${sceneAnalysis.scene_description}</p>
                <div class="scene-actions">
                    <button class="btn btn-sm btn-secondary" onclick="this.closest('#scene-uploader').remove(); app.showSceneUploader()">
                        <i class='bx bx-refresh'></i> Upload Different Scene
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="this.closest('#scene-uploader').remove()">
                        <i class='bx bx-check'></i> Use This Scene
                    </button>
                </div>
            </div>
        `;

        // Set custom scene as selected location
        this.selectedOptions.location = 'custom_scene';
    }

    showActorUploader() {
        // Remove any existing uploader and input
        const existingUploader = document.getElementById('actor-uploader');
        if (existingUploader) {
            existingUploader.remove();
        }
        
        const existingInput = document.getElementById('actor-input');
        if (existingInput) {
            existingInput.remove();
        }

        const actorSection = document.querySelector('#actor-tab .card-content');
        if (!actorSection) {
            console.error('Actor section not found');
            return;
        }

        const uploader = document.createElement('div');
        uploader.id = 'actor-uploader';
        uploader.className = 'scene-upload-zone';
        
        // Create and configure file input separately
        const actorFileInput = document.createElement('input');
        actorFileInput.type = 'file';
        actorFileInput.id = 'actor-input';
        actorFileInput.accept = 'image/*';
        actorFileInput.style.display = 'none';
        
        uploader.innerHTML = `
            <div class="scene-upload-content">
                <i class='bx bx-user-plus'></i>
                <h4>Upload Actor Photo</h4>
                <p>Drop your actor photo here or click to browse</p>
                <small>PNG, JPG, JPEG • Max 16MB</small>
                <button class="btn btn-sm btn-secondary close-uploader">
                    <i class='bx bx-x'></i> Cancel
                </button>
            </div>
        `;
        
        // Append input to uploader first
        uploader.appendChild(actorFileInput);
        
        // Append to DOM
        actorSection.appendChild(uploader);

        const closeBtn = uploader.querySelector('.close-uploader');

        // Add event listeners
        uploader.addEventListener('click', (e) => {
            console.log('Actor uploader clicked');
            if (e.target !== closeBtn && !closeBtn.contains(e.target)) {
                console.log('Triggering file input click');
                actorFileInput.click();
            }
        });
        
        uploader.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploader.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploader.addEventListener('drop', (e) => this.handleActorDrop(e));
        
        // Add change event listener
        actorFileInput.addEventListener('change', (e) => {
            console.log('Actor input change triggered', e.target.files);
            this.handleActorSelect(e);
        });
        
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploader.remove();
        });
    }

    handleActorDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processActorFile(files[0]);
        }
    }

    handleActorSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processActorFile(file);
        }
    }

    processActorFile(file) {
        if (!file.type.startsWith('image/')) {
            this.showToast('Please select a valid image file', 'error');
            return;
        }

        if (file.size > 16 * 1024 * 1024) {
            this.showToast('File size must be less than 16MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.analyzeActor(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    analyzeActor(imageData) {
        this.showLoading('Analyzing actor image...');

        fetch('/analyze-actor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: imageData
            })
        })
        .then(response => response.json())
        .then(data => {
            this.hideLoading();
            if (data.success) {
                this.actorData = data.actor_analysis;
                this.displayActorResults(data.actor_analysis);
                this.showToast('Actor analysis complete! 🎭', 'success');
            } else {
                this.showToast(data.error || 'Actor analysis failed', 'error');
            }
        })
        .catch(error => {
            this.hideLoading();
            this.showToast('Actor analysis failed: ' + error.message, 'error');
        });
    }

    displayActorResults(actorAnalysis) {
        const uploader = document.getElementById('actor-uploader');
        if (!uploader) return;

        uploader.innerHTML = `
            <div class="scene-results">
                <i class='bx bx-check-circle'></i>
                <h4>Actor Analyzed Successfully!</h4>
                <p class="scene-description">${actorAnalysis.actor_description}</p>
                <div class="scene-actions">
                    <button class="btn btn-sm btn-secondary" onclick="this.closest('#actor-uploader').remove(); app.showActorUploader()">
                        <i class='bx bx-refresh'></i> Upload Different Actor
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="this.closest('#actor-uploader').remove()">
                        <i class='bx bx-check'></i> Use This Actor
                    </button>
                </div>
            </div>
        `;

        // Set custom actor as selected
        this.selectedOptions.characterArchetype = 'custom_actor';
        
        // Deselect other actor cards
        document.querySelectorAll('.character-cards .option-card').forEach(card => {
            card.classList.remove('active');
        });
    }

    // File Upload Management
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        if (!file.type.startsWith('image/')) {
            this.showToast('Please select a valid image file', 'error');
            return;
        }

        if (file.size > 16 * 1024 * 1024) {
            this.showToast('File size must be less than 16MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.analyzeImage(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    analyzeImage(imageData) {
        this.showLoading('Analyzing your product image...');

        fetch('/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: imageData
            })
        })
        .then(response => response.json())
        .then(data => {
            this.hideLoading();
            if (data.success) {
                this.analysisData = data.analysis;
                this.displayAnalysisResults(data.analysis);
                this.populateFormFromAnalysis(data.analysis);
                this.showToast('Product analysis complete! 🎉', 'success');
            } else {
                this.showToast(data.error || 'Analysis failed', 'error');
            }
        })
        .catch(error => {
            this.hideLoading();
            this.showToast('Analysis failed: ' + error.message, 'error');
        });
    }

    displayAnalysisResults(analysis) {
        const resultsContainer = document.getElementById('analysis-results');
        const previewContainer = document.getElementById('analysis-preview');

        if (!resultsContainer || !previewContainer) return;

        previewContainer.innerHTML = `
            <div class="analysis-item">
                <h4><i class='bx bx-tag'></i> Product Name</h4>
                <p>${analysis.product_name || 'Not detected'}</p>
            </div>
            <div class="analysis-item">
                <h4><i class='bx bx-category'></i> Product Type</h4>
                <p>${analysis.product_type || 'Not detected'}</p>
            </div>
            <div class="analysis-item">
                <h4><i class='bx bx-detail'></i> Description</h4>
                <p>${analysis.detailed_description || 'No description available'}</p>
            </div>
            <div class="analysis-item">
                <h4><i class='bx bx-star'></i> Key Features</h4>
                <p>${Array.isArray(analysis.key_features) ? analysis.key_features.join(', ') : 'None detected'}</p>
            </div>
        `;

        resultsContainer.style.display = 'block';

        // Auto-advance to next tab after a moment
        setTimeout(() => {
            this.switchTab('actor');
        }, 2000);
    }

    populateFormFromAnalysis(analysis) {
        // Populate product name
        const productNameInput = document.getElementById('product-name');
        if (productNameInput && analysis.product_name) {
            productNameInput.value = analysis.product_name;
        }

        // Set suggested content type based on product
        if (analysis.suggested_setting && analysis.suggested_setting.includes('unboxing')) {
            this.selectContentType('unboxing');
        }
    }

    // Manual Description
    useManualDescription() {
        const productName = document.getElementById('product-name')?.value;
        const description = document.getElementById('manual-description')?.value;

        if (!productName || !description) {
            this.showToast('Please provide both product name and description', 'error');
            return;
        }

        this.analysisData = {
            product_name: productName,
            product_type: 'Manual Entry',
            detailed_description: description,
            key_features: [],
            visual_style: 'User-provided description',
            suggested_setting: 'Based on description',
            emotional_appeal: 'User-defined'
        };

        this.displayAnalysisResults(this.analysisData);
        this.showToast('Manual description added successfully! 📝', 'success');
    }

    // Prompt Generation
    async generatePrompt() {
        if (!this.analysisData && this.selectedOptions.analysisMethod === 'upload') {
            this.showToast('Please upload and analyze a product image first', 'error');
            this.switchTab('product');
            return;
        }

        if (this.selectedOptions.analysisMethod === 'manual') {
            this.useManualDescription();
            if (!this.analysisData) return;
        }

        this.showLoading('Generating your UGC prompt...');

        // Generate prompt using pure template logic (no backend call)
        const promptData = await this.buildPromptFromTemplate();

        this.hideLoading();
        this.displayGeneratedPrompt(promptData);
        this.showToast('Prompt generated successfully! 🎬', 'success');
    }

    async buildPromptFromTemplate() {
        const productName = document.getElementById('product-name')?.value || this.analysisData?.product_name || 'Unknown';
        const productDescription = this.analysisData?.detailed_description || 'Product details not available';

        // Get actor description - check for custom actor first
        let actorDescription;
        if (this.selectedOptions.characterArchetype === 'custom_actor' && this.actorData?.actor_description) {
            actorDescription = this.actorData.actor_description;
        } else {
            // Get actor data directly from the selected name
            const actorData = await this.getActorData();
            const selectedActor = actorData.find(actor => actor.name === this.selectedOptions.characterArchetype);
            actorDescription = selectedActor ? selectedActor.description : actorData[0].description;
        }

        console.log('Selected Actor Name:', this.selectedOptions.characterArchetype);
        console.log('Actor Description:', actorDescription);
        console.log('Selected Options:', this.selectedOptions);

        // Build action based on content type and extract key features from product description
        let action = '';
        const keyFeatures = this.extractProductFeatures(productDescription);

        switch(this.selectedOptions.contentType) {
            case 'unboxing':
                action = `unboxing and revealing the ${productName} with genuine excitement and surprise reactions, highlighting ${keyFeatures}`;
                break;
            case 'review':
                action = `reviewing the ${productName} with detailed examination and authentic reactions, demonstrating key features and benefits`;
                break;
            case 'demo':
                action = `demonstrating the ${productName} in action, showing practical use cases and highlighting performance`;
                break;
            default:
                action = `showcasing the ${productName} with authentic enthusiasm and natural reactions`;
        }

        // Build hook based on strategy
        let dialogue = '';
        const customHook = document.getElementById('custom-message')?.value;
        if (customHook) {
            dialogue = customHook;
        } else {
            switch(this.selectedOptions.hookStrategy) {
                case 'problem_solution':
                    dialogue = `I found the solution everyone's been looking for`;
                    break;
                case 'trending':
                    dialogue = `Everyone's talking about this ${productName} - here's why`;
                    break;
                case 'review':
                    dialogue = `Here's my honest review of the ${productName}`;
                    break;
                default:
                    dialogue = `Everyone's talking about this ${productName} - here's why`;
            }
        }

        // Build the complete prompt
        const settingDesc = await this.getSettingDescription();
        const lightingDesc = await this.getLightingDescription();
        const cameraDesc = await this.getCameraDescription();

        const prompt = `PRODUCT (read this exactly; use as visual ground truth):
${productDescription}

DO NOT SUBSTITUTE ANOTHER PRODUCT. Keep exact branding/text/colors.

UGC advert. Duration 8 seconds. Aspect 9:16.
Setting: ${settingDesc}, ${lightingDesc}. Camera: ${cameraDesc}.
Actor: ${actorDescription}
Action: ${action}
Dialogue (to camera): ${dialogue}
No Subtitles. Audio: clear voice, faint room tone only.`;

        return { prompt: prompt };
    }

    async getSettingDescription() {
        // If custom scene is selected and we have scene data, use that
        if (this.selectedOptions.location === 'custom_scene' && this.sceneData?.scene_description) {
            return this.sceneData.scene_description;
        }

        const locationData = await this.getLocationDataList();
        const selectedLocation = locationData.find(loc => loc.id === this.selectedOptions.location);
        return selectedLocation ? (selectedLocation.prompt_description || selectedLocation.description) : 'comfortable indoor setting';
    }

    async getLightingDescription() {
        const lightingData = await this.getLightingData();
        const selectedLighting = lightingData.find(light => light.id === this.selectedOptions.lighting);
        return selectedLighting ? selectedLighting.description : 'natural lighting';
    }

    async getCameraDescription() {
        const cameraData = await this.getCameraData();
        const selectedCamera = cameraData.find(cam => cam.id === this.selectedOptions.cameraStyle);
        return selectedCamera ? selectedCamera.description : 'handheld camera work';
    }

    displayGeneratedPrompt(promptData) {
        const promptDisplay = document.getElementById('prompt-display');
        const promptResults = document.getElementById('prompt-results');

        if (!promptDisplay || !promptResults) return;

        promptDisplay.textContent = promptData.prompt || 'No prompt generated';
        promptResults.style.display = 'block';

        // Auto-scroll to results
        promptResults.scrollIntoView({ behavior: 'smooth' });
    }

    copyPrompt() {
        const promptText = document.getElementById('prompt-display')?.textContent;
        if (!promptText) return;

        navigator.clipboard.writeText(promptText).then(() => {
            this.showToast('Prompt copied to clipboard! 📋', 'success');
        }).catch(() => {
            this.showToast('Failed to copy prompt', 'error');
        });
    }

    // Utility Functions
    newProject() {
        if (confirm('Start a new project? This will clear all current data.')) {
            location.reload();
        }
    }

    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loading-overlay');
        const text = overlay?.querySelector('.loading-text');

        if (text) text.textContent = message;
        if (overlay) overlay.style.display = 'flex';
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.style.display = 'none';
    }

    async getLocationData() {
        if (!this.locationData) {
            try {
                const response = await fetch('/static/data/locations.json');
                const data = await response.json();
                this.locationData = data;
            } catch (error) {
                console.error('Error loading location data:', error);
                this.locationData = { platforms: [], locations: [], lighting: [], camera: [] };
            }
        }
        return this.locationData;
    }

    async getPlatformData() {
        const data = await this.getLocationData();
        return data.platforms;
    }

    async getLocationDataList() {
        const data = await this.getLocationData();
        return data.locations;
    }

    async getLightingData() {
        const data = await this.getLocationData();
        return data.lighting;
    }

    async getCameraData() {
        const data = await this.getLocationData();
        return data.camera;
    }

    async getActorData() {
        if (!this.actorData) {
            try {
                const response = await fetch('/static/data/actors.json');
                const data = await response.json();
                this.actorData = data.actors;
            } catch (error) {
                console.error('Error loading actor data:', error);
                this.actorData = [];
            }
        }
        return this.actorData;
    }

    extractProductFeatures(description) {
        if (!description) return 'the distinctive features';

        const descLower = description.toLowerCase();
        const features = [];

        // Look for colors
        const colors = ['white', 'black', 'beige', 'brown', 'blue', 'red', 'green', 'yellow', 'gray', 'silver', 'gold'];
        const foundColors = colors.filter(color => descLower.includes(color));
        if (foundColors.length > 0) {
            features.push(`the ${foundColors.join(' and ')} styling`);
        }

        // Look for materials
        const materials = ['leather', 'suede', 'fabric', 'metal', 'plastic', 'rubber'];
        const foundMaterials = materials.filter(material => descLower.includes(material));
        if (foundMaterials.length > 0) {
            features.push(`premium ${foundMaterials.join(' and ')} construction`);
        }

        // Look for brand name
        if (descLower.includes('nikki')) {
            features.push('the distinctive NIKKI branding');
        } else if (descLower.includes('nike')) {
            features.push('the iconic Nike branding');
        }

        // Look for specific product features
        if (descLower.includes('cushioned') || descLower.includes('comfort')) {
            features.push('the enhanced comfort features');
        }

        return features.length > 0 ? features.join(', ') : 'the distinctive design and quality craftsmanship';
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icon = type === 'success' ? 'bx-check-circle' :
                    type === 'error' ? 'bx-error-circle' : 'bx-info-circle';

        toast.innerHTML = `
            <i class='bx ${icon}'></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // Enhanced toast with better animations
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);

        // Remove on click
        toast.addEventListener('click', () => {
            toast.classList.add('removing');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        });
    }

    // Enhanced button states
    setButtonState(button, state) {
        if (!button) return;

        button.classList.remove('loading', 'success', 'error');
        
        switch (state) {
            case 'loading':
                button.classList.add('loading');
                button.disabled = true;
                break;
            case 'success':
                button.classList.add('success');
                button.disabled = false;
                setTimeout(() => {
                    button.classList.remove('success');
                }, 2000);
                break;
            case 'error':
                button.classList.add('error');
                button.disabled = false;
                setTimeout(() => {
                    button.classList.remove('error');
                }, 3000);
                break;
            default:
                button.disabled = false;
        }
    }

    // Enhanced tab switching with animations
    switchTab(tabName) {
        if (!tabName || this.currentTab === tabName) return;

        console.log('Switching to tab:', tabName);
        
        // Add exit animation to current tab
        const currentPanel = document.getElementById(`${this.currentTab}-tab`);
        if (currentPanel) {
            currentPanel.classList.add('exiting');
        }

        this.currentTab = tabName;

        // Use requestAnimationFrame to ensure smooth transitions
        requestAnimationFrame(() => {
            // Update tab buttons
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
                btn.setAttribute('tabindex', '-1');
            });
            
            const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
            if (targetBtn) {
                targetBtn.classList.add('active');
                targetBtn.setAttribute('aria-selected', 'true');
                targetBtn.setAttribute('tabindex', '0');
                targetBtn.focus();
            }

            // Update tab panels with smooth transition
            setTimeout(() => {
                document.querySelectorAll('.tab-panel').forEach(panel => {
                    panel.classList.remove('active', 'exiting');
                    panel.style.display = 'none';
                    panel.setAttribute('aria-hidden', 'true');
                });

                const targetPanel = document.getElementById(`${tabName}-tab`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                    targetPanel.style.display = 'block';
                    targetPanel.setAttribute('aria-hidden', 'false');
                }

                this.updateTabNavigation();
                this.updateStepCompletion();
            }, 200);
        });
    }

    // Load saved data on initialization
    loadSavedData() {
        try {
            const savedData = localStorage.getItem('ugc_studio_autosave');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                // Restore selected options
                if (data.selectedOptions) {
                    this.selectedOptions = { ...this.selectedOptions, ...data.selectedOptions };
                }
                
                // Restore analysis data
                if (data.analysisData) {
                    this.analysisData = data.analysisData;
                }
                
                // Restore other data
                if (data.actorData) this.actorData = data.actorData;
                if (data.sceneData) this.sceneData = data.sceneData;
                
                // Restore current tab
                if (data.currentTab) {
                    this.currentTab = data.currentTab;
                }
                
                this.showToast('Previous session restored! 🔄', 'info');
            }
        } catch (error) {
            console.error('Failed to load saved data:', error);
        }
    }

    // Enhanced file processing with progress
    processFile(file) {
        if (!file.type.startsWith('image/')) {
            this.showToast('Please select a valid image file', 'error');
            return;
        }

        if (file.size > 16 * 1024 * 1024) {
            this.showToast('File size must be less than 16MB', 'error');
            return;
        }

        // Add uploading state to upload zone
        const uploadZone = document.getElementById('upload-zone');
        if (uploadZone) {
            uploadZone.classList.add('uploading');
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.analyzeImage(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    // Enhanced image analysis with better feedback
    analyzeImage(imageData) {
        this.showLoading('Analyzing your product image...');
        
        const analyzeBtn = document.querySelector('.upload-zone');
        this.setButtonState(analyzeBtn, 'loading');

        fetch('/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: imageData
            })
        })
        .then(response => response.json())
        .then(data => {
            this.hideLoading();
            
            // Remove uploading state
            const uploadZone = document.getElementById('upload-zone');
            if (uploadZone) {
                uploadZone.classList.remove('uploading');
            }
            
            if (data.success) {
                this.analysisData = data.analysis;
                this.displayAnalysisResults(data.analysis);
                this.populateFormFromAnalysis(data.analysis);
                this.setButtonState(analyzeBtn, 'success');
                this.showToast('Product analysis complete! 🎉', 'success');
                
                // Auto-advance to next tab after a moment
                setTimeout(() => {
                    this.switchTab('actor');
                }, 2000);
            } else {
                this.setButtonState(analyzeBtn, 'error');
                this.showToast(data.error || 'Analysis failed', 'error');
            }
        })
        .catch(error => {
            this.hideLoading();
            const uploadZone = document.getElementById('upload-zone');
            if (uploadZone) {
                uploadZone.classList.remove('uploading');
            }
            this.setButtonState(analyzeBtn, 'error');
            this.showToast('Analysis failed: ' + error.message, 'error');
        });
    }

    // Enhanced prompt generation with better UX
    async generatePrompt() {
        if (!this.analysisData && this.selectedOptions.analysisMethod === 'upload') {
            this.showToast('Please upload and analyze a product image first', 'error');
            this.switchTab('product');
            return;
        }

        if (this.selectedOptions.analysisMethod === 'manual') {
            this.useManualDescription();
            if (!this.analysisData) return;
        }

        const generateBtn = document.getElementById('generate-prompt');
        this.setButtonState(generateBtn, 'loading');
        this.showLoading('Generating your UGC prompt...');

        try {
            // Generate prompt using pure template logic (no backend call)
            const promptData = await this.buildPromptFromTemplate();

            this.hideLoading();
            this.setButtonState(generateBtn, 'success');
            this.displayGeneratedPrompt(promptData);
            this.showToast('Prompt generated successfully! 🎬', 'success');
            
            // Update step completion
            this.updateStepCompletion();
        } catch (error) {
            this.hideLoading();
            this.setButtonState(generateBtn, 'error');
            this.showToast('Failed to generate prompt: ' + error.message, 'error');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new UGCStudio();
});
