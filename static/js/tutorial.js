class TutorialPage {
    constructor() {
        this.currentSection = 'getting-started';
        this.init();
    }

    init() {
        this.bindEvents();
        this.setTheme(localStorage.getItem('theme') || 'dark');
        this.updateNavigation();
        this.initScrollSpy();
    }

    bindEvents() {
        // Theme toggle
        document.getElementById('theme-toggle')?.addEventListener('click', () => this.toggleTheme());

        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('href').substring(1);
                this.showSection(section);
                this.scrollToSection(section);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + ? for help
            if ((e.ctrlKey || e.metaKey) && e.key === '?') {
                e.preventDefault();
                this.toggleKeyboardShortcuts();
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                this.hideKeyboardShortcuts();
            }
            
            // Home/End for navigation
            if (e.key === 'Home') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            
            if (e.key === 'End') {
                e.preventDefault();
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
        });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
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

    // Section Management
    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.tutorial-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
            this.updateNavigation();
        }
    }

    updateNavigation() {
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[href="#${this.currentSection}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const headerHeight = document.querySelector('.tutorial-header').offsetHeight;
            const targetPosition = section.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    // Scroll Spy
    initScrollSpy() {
        const sections = document.querySelectorAll('.tutorial-section');
        const navLinks = document.querySelectorAll('.nav-link');
        
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    this.currentSection = sectionId;
                    this.updateNavigation();
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // Keyboard Shortcuts Modal
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

    // Utility Methods
    showToast(message, type = 'info') {
        // Create toast container if it doesn't exist
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icon = type === 'success' ? 'bx-check-circle' :
                    type === 'error' ? 'bx-error-circle' : 'bx-info-circle';

        toast.innerHTML = `
            <i class='bx ${icon}'></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('removing');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }
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

    // Search functionality (if needed)
    initSearch() {
        const searchInput = document.getElementById('tutorial-search');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            this.performSearch(query);
        });
    }

    performSearch(query) {
        const sections = document.querySelectorAll('.tutorial-section');
        const cards = document.querySelectorAll('.tutorial-card');
        
        if (!query) {
            // Show all content
            sections.forEach(section => section.style.display = 'block');
            cards.forEach(card => card.style.display = 'block');
            return;
        }

        let hasResults = false;

        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            const isMatch = text.includes(query);
            
            card.style.display = isMatch ? 'block' : 'none';
            if (isMatch) hasResults = true;
        });

        // Show/hide sections based on whether they have visible cards
        sections.forEach(section => {
            const visibleCards = section.querySelectorAll('.tutorial-card[style*="block"], .tutorial-card:not([style*="none"])');
            section.style.display = visibleCards.length > 0 ? 'block' : 'none';
        });

        // Show no results message if needed
        this.toggleNoResults(!hasResults);
    }

    toggleNoResults(show) {
        let noResults = document.getElementById('no-results');
        
        if (show && !noResults) {
            noResults = document.createElement('div');
            noResults.id = 'no-results';
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <div class="no-results-content">
                    <i class='bx bx-search-alt-2'></i>
                    <h3>No results found</h3>
                    <p>Try different keywords or browse our sections above.</p>
                </div>
            `;
            document.querySelector('.tutorial-content').appendChild(noResults);
        } else if (!show && noResults) {
            noResults.remove();
        }
    }

    // Progress tracking
    trackProgress() {
        const sections = document.querySelectorAll('.tutorial-section');
        const completedSections = new Set();
        
        // Mark sections as read when user spends time on them
        sections.forEach(section => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            if (entry.isIntersecting) {
                                completedSections.add(section.id);
                                this.updateProgressIndicator();
                            }
                        }, 3000); // Mark as read after 3 seconds
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(section);
        });
    }

    updateProgressIndicator() {
        // Could add a progress bar or completion indicator
        const totalSections = document.querySelectorAll('.tutorial-section').length;
        const completedSections = document.querySelectorAll('.nav-link.completed').length;
        const progress = (completedSections / totalSections) * 100;
        
        // Update progress indicator if it exists
        const progressBar = document.getElementById('tutorial-progress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    // Print functionality
    initPrint() {
        const printBtn = document.getElementById('print-tutorial');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print();
            });
        }
    }

    // Copy code snippets
    initCodeCopy() {
        document.querySelectorAll('pre code').forEach(codeBlock => {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-code-btn';
            copyBtn.innerHTML = '<i class="bx bx-copy"></i>';
            copyBtn.title = 'Copy code';
            
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                    copyBtn.innerHTML = '<i class="bx bx-check"></i>';
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="bx bx-copy"></i>';
                    }, 2000);
                });
            });
            
            codeBlock.parentNode.style.position = 'relative';
            codeBlock.parentNode.appendChild(copyBtn);
        });
    }
}

// Initialize tutorial page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tutorialPage = new TutorialPage();
});

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TutorialPage;
}
