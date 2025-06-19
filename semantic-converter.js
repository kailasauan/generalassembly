// semantic-converter.js
// Converts semantic CSS classes to Tailwind CSS classes and injects dynamic UI components.

document.addEventListener('DOMContentLoaded', function() {
    
    /**
     * Main initialization function. Orchestrates all setup tasks.
     */
    function init() {
        if (!window.SITE_THEME) {
            console.warn('SITE_THEME configuration object not found. UI will not be fully rendered.');
            return;
        }
        
        const theme = window.SITE_THEME;

        configureTailwind(theme);
        injectNavigation(theme);
        // Pass banner configuration directly
        if (theme.banner) {
            injectBanner(theme.banner.title, theme.banner.imageUrl);
        }
        injectFooter(theme);
        applySemanticStyles(theme);
        setupEventListeners();
    }

    /**
     * Configures Tailwind with custom colors from the theme object.
     * @param {object} theme - The SITE_THEME object.
     */
    function configureTailwind(theme) {
        if (theme.colors) {
            tailwind.config = {
                theme: {
                    extend: {
                        colors: theme.colors
                    }
                }
            };
        }
    }

    /**
     * Applies semantic class transformations to elements on the page.
     * @param {object} theme - The SITE_THEME object.
     */
    function applySemanticStyles(theme) {
        if (!theme.classes) {
            console.warn('SITE_THEME.classes not found. No semantic styles will be applied.');
            return;
        }
        
        Object.entries(theme.classes).forEach(([semanticClass, tailwindClasses]) => {
            const elements = document.querySelectorAll(`.${semanticClass}`);
            elements.forEach(element => {
                element.classList.remove(semanticClass);
                // Ensure tailwindClasses is a non-empty string before splitting
                if (tailwindClasses && typeof tailwindClasses === 'string') {
                    element.classList.add(...tailwindClasses.split(' ').filter(Boolean));
                }
            });
        });
    }

    /**
     * Injects the main navigation menu, built dynamically from the theme object.
     * @param {object} theme - The SITE_THEME object.
     */
    function injectNavigation(theme) {
        const navLinksHTML = (theme.navigation || [])
            .map(link => `<a href="${link.href}" class="nav-link text-white hover:text-accent font-medium text-lg tracking-wide">${link.name}</a>`)
            .join('');

        const mobileLinksHTML = (theme.navigation || [])
            .map((link, index, arr) => {
                const borderClass = index < arr.length - 1 ? 'border-b border-white/20' : '';
                return `<a href="${link.href}" class="block text-white hover:text-accent font-medium text-lg py-2 ${borderClass}">${link.name}</a>`;
            })
            .join('');

        const nav = document.createElement('nav');
        nav.className = 'absolute top-0 left-0 right-0 z-50 bg-gradient-to-r from-black/20 to-black/10 backdrop-blur-sm';
        nav.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <!-- Mobile menu button -->
                    <button class="mobile-menu-open md:hidden text-white hover:text-accent transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    
                    <!-- Desktop Navigation -->
                    <div class="hidden md:flex space-x-8 mx-auto">
                        ${navLinksHTML}
                    </div>
                    
                    <!-- Empty div for flex spacing on mobile -->
                    <div class="md:hidden w-6"></div>
                </div>
            </div>
            
            <!-- Mobile Menu -->
            <div class="mobile-menu fixed top-0 right-0 h-full w-64 bg-primary/95 backdrop-blur-sm md:hidden translate-x-full transition-transform duration-300 ease-in-out">
                <div class="flex justify-end p-4">
                    <button class="mobile-menu-close text-white hover:text-accent">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <nav class="px-4 space-y-6">
                    ${mobileLinksHTML}
                </nav>
            </div>
        `;
        document.body.prepend(nav);
    }

    /**
     * Injects the hero banner with a dynamic title and background image.
     * @param {string} title - The main heading for the banner.
     * @param {string} imageUrl - The URL for the background image.
     */
    function injectBanner(title, imageUrl) {
        const banner = document.createElement('section');
        banner.className = 'relative h-[500px] flex items-end justify-center text-center text-white';
        banner.innerHTML = `
            <img src="${imageUrl}" alt="Banner background" class="absolute top-0 left-0 w-full h-full object-cover z-10">
            <div class="absolute top-0 left-0 w-full h-full banner-overlay-gradient z-20"></div>
            
            <div class="absolute top-20 left-5 md:top-24 md:left-8 z-30 flex flex-col items-center gap-2.5 p-4">
                <img src="${window.SITE_THEME.logoUrl || ''}" alt="UAN Logo" class="w-48 md:w-72 h-auto object-contain logo-glow">
            </div>

            <div class="banner-content relative z-30 max-w-5xl px-5 pb-16">
                <p class="text-xl md:text-2xl mb-5 font-normal text-shadow-enhanced tracking-wide">
                    United Ancient Indigenous Enlightened Nations (UAN)
                </p>
                <h1 class="text-4xl md:text-6xl font-bold text-shadow-enhanced tracking-wider text-white">
                    ${title}
                </h1>
            </div>
        `;
        // Insert banner after the navigation
        const navElement = document.querySelector('nav');
        if (navElement) {
            navElement.after(banner);
        } else {
            document.body.prepend(banner);
        }
    }

    /**
     * Injects the footer, built dynamically from the theme object.
     * @param {object} theme - The SITE_THEME object.
     */
    function injectFooter(theme) {
        const footerConfig = theme.footer || {};
        const contact = footerConfig.contact || {};
        const copyright = footerConfig.copyright || `© ${new Date().getFullYear()} Your Organization`;
        
        const footer = document.createElement('footer');
        footer.className = 'bg-primary text-white py-8 w-full';
        footer.innerHTML = `
        <div class="w-full px-5 md:px-8 lg:px-12">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-6">
                <div class="flex items-center gap-4">
                    <img src="${theme.logoUrl || ''}" alt="UAN Logo" class="w-[280px] h-auto object-contain">
                </div>
                
                <div class="text-left md:text-right">
                    ${contact.phone ? `<div class="text-base mb-1">${contact.phone}</div>` : ''}
                    ${contact.email ? `<div class="text-base">${contact.email}</div>` : ''}
                </div>
            </div>
            
            <div class="border-t border-white/20 pt-4">
                <div class="text-base text-center md:text-left">
                    ${copyright}
                </div>
            </div>
        </div>
        `;
        document.body.appendChild(footer);
    }

    /**
     * Sets up event listeners for interactive elements like the mobile menu.
     */
    function setupEventListeners() {
        const mobileMenu = document.querySelector('.mobile-menu');
        const openButton = document.querySelector('.mobile-menu-open');
        const closeButton = document.querySelector('.mobile-menu-close');

        if (mobileMenu && openButton && closeButton) {
            const toggleMenu = () => mobileMenu.classList.toggle('translate-x-full');
            openButton.addEventListener('click', toggleMenu);
            closeButton.addEventListener('click', toggleMenu);
        }
    }

    // Run the initialization function
    init();
});