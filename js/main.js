(function() {
    'use strict';

    const App = {
        state: {
            currentPage: 'home'
        },

        // Search Data for predictive text
        searchData: [
            { name: "CiTiApp", page: "prod-citiapp" },
            { name: "NexGen Cast", page: "prod-nexgen" },
            { name: "Cogito", page: "prod-cogito" },
            {name: "Lumen", page: "prod-lumen" },
            { name: "Cloud Architecture", page: "sol-cloud" },
            { name: "AI & Automation", page: "sol-ai" },
            { name: "Cloud Security", page: "sol-security" },
            { name: "About Us", page: "about" },
            { name: "Careers", page: "careers" },
            { name: "Contact Us", page: "contact" }
        ],

        init: function() {
            this.cacheDOM();
            this.bindEvents();
        },

        cacheDOM: function() {
            this.dom = {
                navLinks: document.querySelectorAll('.nav-link'),
                sections: document.querySelectorAll('.page-section'),
                searchOverlay: document.getElementById('searchOverlay'),
                searchInput: document.getElementById('searchInput'),
                searchForm: document.getElementById('searchForm'),
                charCount: document.getElementById('charCount'),
                suggestions: document.getElementById('searchSuggestions'),
                contactForm: document.getElementById('contactForm'),
                toast: document.getElementById('toast'),
                toastMsg: document.getElementById('toastMsg'),
                cards: document.querySelectorAll('[data-tilt] .card-3d')
            };
        },

        bindEvents: function() {
            // Navigation
            this.dom.navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const pageId = link.getAttribute('href').substring(1);
                    this.router(pageId);
                });
            });

            // 3D Tilt Cards
            this.dom.cards.forEach(card => {
                card.addEventListener('mousemove', (e) => this.handleTilt(e, card));
                card.addEventListener('mouseleave', () => this.resetTilt(card));
            });

            // Search
            this.dom.searchInput.addEventListener('input', (e) => this.handleSearchInput(e));
            this.dom.searchForm.addEventListener('submit', (e) => this.handleSearch(e));

            // Contact Form
            if(this.dom.contactForm) {
                this.dom.contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
            }

            // Global Keydown
            document.addEventListener('keydown', (e) => {
                if(e.key === 'Escape') {
                    this.toggleSearch(false);
                }
            });
        },

        // --- Routing Logic ---
        router: function(pageId) {
            const target = document.getElementById(pageId);
            if (!target) return;

            // 1. Hide all sections
            this.dom.sections.forEach(el => {
                el.classList.remove('active');
                el.classList.remove('anim-fade-up', 'anim-fade-scale', 'anim-slide-left');
            });

            // 2. Trigger reflow
            void target.offsetWidth;

            // 3. Set animation class
            if(pageId.startsWith('sol-')) {
                target.classList.add('anim-slide-left');
            } else if (pageId.startsWith('prod-')) {
                target.classList.add('anim-fade-scale');
            } else {
                target.classList.add('anim-fade-up');
            }
            
            target.classList.add('active');
            window.scrollTo(0, 0);
            this.state.currentPage = pageId;

            // 4. Update Nav State
            this.dom.navLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href === '#' + pageId) || (pageId.startsWith('sol-') && href === '#solutions')) {
                    link.classList.add('active');
                }
            });
        },

        // --- 3D Tilt Effect ---
        handleTilt: function(e, card) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        },

        resetTilt: function(card) {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        },

        // --- Magnetic Navigation ---
        setupMagneticNav: function() {
            // Implemented via CSS for better performance, but JS could enhance it if needed.
            // For now, CSS hover effects handle the interaction efficiently.
        },

        // --- Search Functionality ---
        toggleSearch: function(forceState) {
            const isActive = typeof forceState === 'boolean' ? forceState : !this.dom.searchOverlay.classList.contains('active');
            
            if (isActive) {
                this.dom.searchOverlay.classList.add('active');
                setTimeout(() => this.dom.searchInput.focus(), 100);
            } else {
                this.dom.searchOverlay.classList.remove('active');
            }
        },

        handleSearchInput: function(e) {
            const val = e.target.value;
            const len = val.length;
            
            // Update Counter
            if (this.dom.charCount) {
                this.dom.charCount.innerText = `${len} / 27`;
            }
            
            // Predictive Logic
            if (len > 2) {
                const matches = this.searchData.filter(item => 
                    item.name.toLowerCase().includes(val.toLowerCase())
                );

                // Render suggestions
                if (this.dom.suggestions) {
                    this.dom.suggestions.innerHTML = '';
                    
                    if (matches.length > 0) {
                        matches.forEach(item => {
                            const div = document.createElement('div');
                            div.className = 'suggestion-item';
                            div.innerText = item.name;
                            div.onclick = () => {
                                this.goToSearchResult(item.page);
                            };
                            this.dom.suggestions.appendChild(div);
                        });
                        this.dom.suggestions.classList.add('active');
                    } else {
                        this.dom.suggestions.classList.remove('active');
                    }
                }
            } else {
                if (this.dom.suggestions) this.dom.suggestions.classList.remove('active');
            }
        },

        goToSearchResult: function(pageId) {
            this.toggleSearch(false);
            this.router(pageId);
            this.showToast('Navigating to page...', 'success');
            this.dom.searchInput.value = '';
            if (this.dom.charCount) this.dom.charCount.innerText = '0 / 27';
            if (this.dom.suggestions) this.dom.suggestions.classList.remove('active');
        },

        handleSearch: function(e) {
            e.preventDefault();
            const val = this.dom.searchInput.value;

            if(val.length === 0) {
                this.showToast('Please enter a search term.', 'error');
                return;
            }
            
            if(val.length > 27) {
                 this.showToast('Maximum 27 characters exceeded.', 'error');
                 return;
            }

            this.toggleSearch(false);
            this.showToast('Searching...', 'success');
            this.dom.searchInput.value = '';
            if (this.dom.charCount) this.dom.charCount.innerText = '0 / 27';
            if (this.dom.suggestions) this.dom.suggestions.classList.remove('active');
        },

        // --- Contact Form Handler ---
        handleContactSubmit: function(e) {
            e.preventDefault(); // Prevent actual submission
            
            // Show success message
            this.showToast('Message sent successfully!', 'success');
            
            // Reset form
            if (this.dom.contactForm) {
                this.dom.contactForm.reset();
            }
        },

        // --- Notifications ---
        showToast: function(msg, type) {
            if (!this.dom.toast || !this.dom.toastMsg) return;

            this.dom.toast.className = `toast ${type} show`;
            this.dom.toastMsg.innerText = msg;

            // Auto hide after 3 seconds
            setTimeout(() => {
                if(this.dom.toast) this.dom.toast.classList.remove('show');
            }, 3000);
        }
    };

    // Initialize App
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
    });

})();
