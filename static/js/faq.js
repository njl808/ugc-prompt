class FAQPage {
    constructor() {
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.init();
    }

    init() {
        this.bindEvents();
        this.setTheme(localStorage.getItem('theme') || 'dark');
        this.initSearch();
        this.initCategories();
        this.initFAQItems();
    }

    bindEvents() {
        // Theme toggle
        document.getElementById('theme-toggle')?.addEventListener('click', () => this.toggleTheme());

        // Search functionality
        const searchInput = document.getElementById('faq-search-input');
        const searchClear = document.getElementById('search-clear');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.clearSearch();
                }
            });
        }

        if (searchClear) {
            searchClear.addEventListener('click', () => this.clearSearch());
        }

        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.filterByCategory(category);
            });
        });

        // FAQ items
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', (e) => {
                const faqItem = e.currentTarget.closest('.faq-item');
                this.toggleFAQItem(faqItem);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + ? for help
            if ((e.ctrlKey || e.metaKey) && e.key === '?') {
                e.preventDefault();
                this.toggleKeyboardShortcuts();
            }
            
            // Escape to close modals and clear search
            if (e.key === 'Escape') {
                this.hideKeyboardShortcuts();
                if (this.searchQuery) {
                    this.clearSearch();
                }
            }
            
            // Ctrl/Cmd + F to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.getElementById('faq-search-input');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
        });

        // URL hash handling for direct links
        window.addEventListener('hashchange', () => this.handleHashChange());
        this.handleHashChange(); // Handle initial hash
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

    // Search Functionality
    initSearch() {
        this.searchIndex = this.buildSearchIndex();
    }

    buildSearchIndex() {
        const index = [];
        document.querySelectorAll('.faq-item').forEach(item => {
            const question = item.querySelector('.faq-question h3').textContent;
            const answer = item.querySelector('.faq-answer').textContent;
            const category = item.closest('.faq-section').dataset.category;
            
            index.push({
                element: item,
                question: question.toLowerCase(),
                answer: answer.toLowerCase(),
                category: category,
                searchText: (question + ' ' + answer).toLowerCase()
            });
        });
        return index;
    }

    handleSearch(query) {
        this.searchQuery = query.toLowerCase().trim();
        
        // Show/hide clear button
        const clearBtn = document.getElementById('search-clear');
        if (clearBtn) {
            clearBtn.style.display = this.searchQuery ? 'block' : 'none';
        }

        this.performSearch();
    }

    performSearch() {
        if (!this.searchQuery) {
            this.showAllItems();
            this.hideNoResults();
            return;
        }

        let hasResults = false;
        const matchedItems = [];

        this.searchIndex.forEach(item => {
            const isMatch = item.searchText.includes(this.searchQuery);
            const categoryMatch = this.currentCategory === 'all' || item.category === this.currentCategory;
            
            if (isMatch && categoryMatch) {
                matchedItems.push(item);
                hasResults = true;
            }
        });

        // Hide all items first
        document.querySelectorAll('.faq-item').forEach(item => {
            item.style.display = 'none';
        });

        // Show matched items with highlighting
        matchedItems.forEach(item => {
            item.element.style.display = 'block';
            this.highlightSearchTerms(item.element);
        });

        // Show/hide sections based on visible items
        this.updateSectionVisibility();
        
        // Show no results if needed
        if (!hasResults) {
            this.showNoResults();
        } else {
            this.hideNoResults();
        }
    }

    highlightSearchTerms(element) {
        if (!this.searchQuery) return;

        const question = element.querySelector('.faq-question h3');
        const answer = element.querySelector('.faq-answer');

        [question, answer].forEach(container => {
            if (!container) return;
            
            const walker = document.createTreeWalker(
                container,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            const textNodes = [];
            let node;
            while (node = walker.nextNode()) {
                textNodes.push(node);
            }

            textNodes.forEach(textNode => {
                const text = textNode.textContent;
                const regex = new RegExp(`(${this.escapeRegex(this.searchQuery)})`, 'gi');
                
                if (regex.test(text)) {
                    const highlightedText = text.replace(regex, '<span class="search-highlight">$1</span>');
                    const wrapper = document.createElement('span');
                    wrapper.innerHTML = highlightedText;
                    textNode.parentNode.replaceChild(wrapper, textNode);
                }
            });
        });
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    clearSearch() {
        const searchInput = document.getElementById('faq-search-input');
        if (searchInput) {
            searchInput.value = '';
            this.searchQuery = '';
        }

        const clearBtn = document.getElementById('search-clear');
        if (clearBtn) {
            clearBtn.style.display = 'none';
        }

        this.removeHighlights();
        this.showAllItems();
        this.hideNoResults();
    }

    removeHighlights() {
        document.querySelectorAll('.search-highlight').forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
    }

    // Category Management
    initCategories() {
        this.updateCategoryButtons();
    }

    filterByCategory(category) {
        this.currentCategory = category;
        this.updateCategoryButtons();
        
        if (this.searchQuery) {
            this.performSearch();
        } else {
            this.showItemsByCategory();
        }
    }

    updateCategoryButtons() {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === this.currentCategory) {
                btn.classList.add('active');
            }
        });
    }

    showItemsByCategory() {
        document.querySelectorAll('.faq-section').forEach(section => {
            const sectionCategory = section.dataset.category;
            const shouldShow = this.currentCategory === 'all' || sectionCategory === this.currentCategory;
            section.classList.toggle('hidden', !shouldShow);
        });

        this.updateSectionVisibility();
        this.hideNoResults();
    }

    showAllItems() {
        document.querySelectorAll('.faq-item').forEach(item => {
            item.style.display = 'block';
        });
        
        document.querySelectorAll('.faq-section').forEach(section => {
            const sectionCategory = section.dataset.category;
            const shouldShow = this.currentCategory === 'all' || sectionCategory === this.currentCategory;
            section.classList.toggle('hidden', !shouldShow);
        });
    }

    updateSectionVisibility() {
        document.querySelectorAll('.faq-section').forEach(section => {
            const visibleItems = section.querySelectorAll('.faq-item[style*="block"], .faq-item:not([style*="none"])');
            const hasVisibleItems = visibleItems.length > 0;
            const categoryMatch = this.currentCategory === 'all' || section.dataset.category === this.currentCategory;
            
            section.classList.toggle('hidden', !hasVisibleItems || !categoryMatch);
        });
    }

    // FAQ Item Management
    initFAQItems() {
        // Close all items initially
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
    }

    toggleFAQItem(faqItem) {
        const isActive = faqItem.classList.contains('active');
        
        // Optional: Close other items (accordion behavior)
        // document.querySelectorAll('.faq-item').forEach(item => {
        //     if (item !== faqItem) {
        //         item.classList.remove('active');
        //     }
        // });
        
        faqItem.classList.toggle('active', !isActive);
        
        // Update URL hash for direct linking
        if (!isActive) {
            const questionText = faqItem.querySelector('.faq-question h3').textContent;
            const hash = this.createHashFromText(questionText);
            history.replaceState(null, null, `#${hash}`);
        } else {
            history.replaceState(null, null, window.location.pathname);
        }

        // Analytics tracking (if needed)
        this.trackFAQInteraction(faqItem, !isActive);
    }

    createHashFromText(text) {
        return text.toLowerCase()
                  .replace(/[^\w\s-]/g, '')
                  .replace(/\s+/g, '-')
                  .substring(0, 50);
    }

    // URL Hash Handling
    handleHashChange() {
        const hash = window.location.hash.substring(1);
        if (!hash) return;

        // Find FAQ item by hash
        const faqItem = this.findFAQItemByHash(hash);
        if (faqItem) {
            // Open the item
            faqItem.classList.add('active');
            
            // Scroll to it
            setTimeout(() => {
                faqItem.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 100);
        }
    }

    findFAQItemByHash(hash) {
        const faqItems = document.querySelectorAll('.faq-item');
        for (const item of faqItems) {
            const questionText = item.querySelector('.faq-question h3').textContent;
            const itemHash = this.createHashFromText(questionText);
            if (itemHash === hash) {
                return item;
            }
        }
        return null;
    }

    // No Results Management
    showNoResults() {
        const noResults = document.getElementById('no-results');
        if (noResults) {
            noResults.style.display = 'block';
        }
    }

    hideNoResults() {
        const noResults = document.getElementById('no-results');
        if (noResults) {
            noResults.style.display = 'none';
        }
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

    // Analytics and Tracking
    trackFAQInteraction(faqItem, opened) {
        const questionText = faqItem.querySelector('.faq-question h3').textContent;
        const category = faqItem.closest('.faq-section').dataset.category;
        
        // Example analytics call (replace with your analytics service)
        if (typeof gtag !== 'undefined') {
            gtag('event', opened ? 'faq_open' : 'faq_close', {
                'event_category': 'FAQ',
                'event_label': questionText,
                'custom_parameter_1': category
            });
        }
        
        console.log(`FAQ ${opened ? 'opened' : 'closed'}:`, questionText, `(${category})`);
    }

    trackSearch(query, resultsCount) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'search', {
                'event_category': 'FAQ',
                'search_term': query,
                'custom_parameter_1': resultsCount
            });
        }
        
        console.log(`FAQ search: "${query}" (${resultsCount} results)`);
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

    // Export FAQ data (for support or analytics)
    exportFAQData() {
        const faqData = [];
        document.querySelectorAll('.faq-item').forEach(item => {
            const question = item.querySelector('.faq-question h3').textContent;
            const answer = item.querySelector('.faq-answer').textContent;
            const category = item.closest('.faq-section').dataset.category;
            
            faqData.push({
                question,
                answer,
                category
            });
        });
        
        return faqData;
    }

    // Print functionality
    printFAQ() {
        // Open all FAQ items for printing
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.add('active');
        });
        
        setTimeout(() => {
            window.print();
        }, 100);
    }
}

// Initialize FAQ page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.faqPage = new FAQPage();
});

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FAQPage;
}
