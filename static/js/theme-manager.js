/**
 * Theme Management System
 * Handles theme switching and persistence across the application
 */

class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('ugc_theme') || 'light';
        this.init();
    }
    
    init() {
        // Apply saved theme immediately
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateActiveTheme();
        
        // Wait for DOM to be ready before binding events
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bindEvents());
        } else {
            this.bindEvents();
        }
    }
    
    bindEvents() {
        // Theme toggle button
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });
        }
        
        // Theme option clicks
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.getAttribute('data-theme');
                this.setTheme(theme);
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.theme-selector')) {
                this.closeDropdown();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + T for theme toggle
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggleDropdown();
            }
        });
    }
    
    toggleDropdown() {
        const dropdown = document.getElementById('theme-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }
    
    closeDropdown() {
        const dropdown = document.getElementById('theme-dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    }
    
    setTheme(theme) {
        if (this.currentTheme === theme) return;
        
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('ugc_theme', theme);
        this.updateActiveTheme();
        this.closeDropdown();
        
        // Show feedback if toast system is available
        if (window.app && window.app.showToast) {
            const themeName = theme.charAt(0).toUpperCase() + theme.slice(1);
            window.app.showToast(`Theme changed to ${themeName}`, 'success');
        }
        
        // Dispatch custom event for other components
        document.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: theme } 
        }));
    }
    
    updateActiveTheme() {
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
            if (option.getAttribute('data-theme') === this.currentTheme) {
                option.classList.add('active');
            }
        });
    }
    
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    // Cycle through themes (for keyboard shortcuts)
    cycleTheme() {
        const themes = ['light', 'dark', 'cyberpunk', 'sunset', 'ocean', 'forest', 'royal', 'rose'];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.setTheme(themes[nextIndex]);
    }
    
    // Get theme info
    getThemeInfo(themeName = this.currentTheme) {
        const themeDescriptions = {
            light: { name: 'Light', description: 'Clean and bright' },
            dark: { name: 'Dark', description: 'Easy on the eyes' },
            cyberpunk: { name: 'Cyberpunk', description: 'Neon and futuristic' },
            sunset: { name: 'Sunset', description: 'Warm and cozy' },
            ocean: { name: 'Ocean', description: 'Cool and refreshing' },
            forest: { name: 'Forest', description: 'Natural and calming' },
            royal: { name: 'Royal', description: 'Elegant and luxurious' },
            rose: { name: 'Rose', description: 'Romantic and soft' }
        };
        
        return themeDescriptions[themeName] || themeDescriptions.light;
    }
}

// Initialize theme manager
window.themeManager = new ThemeManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
