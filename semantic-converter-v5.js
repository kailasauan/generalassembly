// semantic-converter-v4.js
// Converts semantic CSS classes to Tailwind CSS classes and injects dynamic UI components.
// Version 4: Added advanced image fallback mechanism with Google Drive support

document.addEventListener('DOMContentLoaded', function() {
    
    function init() {
        if (!window.SITE_THEME) {
            console.warn('SITE_THEME configuration object not found. UI will not be fully rendered.');
            return;
        }
        
        const theme = window.SITE_THEME;

        configureTailwind(theme);
        applySemanticStyles(theme); // Apply styles to body first
        injectNavigation(theme);
        if (theme.banner) {
            injectBanner(theme.banner.title, theme.banner.imageUrl);
        }
        injectFooter(theme);
        setupEventListeners();
        initializeImageFallbacks(); // New in v4
    }

    function configureTailwind(theme) {
        if (theme.colors) {
            tailwind.config = {
                theme: {
                    extend: {
                        colors: theme.colors,
                        fontFamily: {
                           serif: ['Georgia', 'Times New Roman', 'serif'],
                        }
                    }
                }
            };
        }
    }

    function applySemanticStyles(theme) {
        if (!theme.classes) {
            console.warn('SITE_THEME.classes not found. No semantic styles will be applied.');
            return;
        }
        
        Object.entries(theme.classes).forEach(([semanticClass, tailwindClasses]) => {
            const elements = document.querySelectorAll(`.${semanticClass}`);
            elements.forEach(element => {
                element.classList.remove(semanticClass);
                if (tailwindClasses && typeof tailwindClasses === 'string') {
                    element.classList.add(...tailwindClasses.split(' ').filter(Boolean));
                }
            });
        });
    }

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
                    <button class="mobile-menu-open md:hidden text-white hover:text-accent transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    <div class="hidden md:flex space-x-8 mx-auto">${navLinksHTML}</div>
                    <div class="md:hidden w-6"></div>
                </div>
            </div>
            <div class="mobile-menu fixed top-0 right-0 h-full w-64 bg-primary/95 backdrop-blur-sm md:hidden translate-x-full transition-transform duration-300 ease-in-out">
                <div class="flex justify-end p-4">
                    <button class="mobile-menu-close text-white hover:text-accent">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <nav class="px-4 space-y-6">${mobileLinksHTML}</nav>
            </div>`;
        document.body.prepend(nav);
    }

    /**
     * Injects the hero banner with enhanced visual styling
     * @param {string} title - The main heading for the banner.
     * @param {string} imageUrl - The URL for the background image.
     */
    function injectBanner(title, imageUrl) {
        const banner = document.createElement('section');
        banner.className = 'relative h-[500px] flex items-end justify-center text-center text-white';
        banner.innerHTML = `
            <img src="${imageUrl}" alt="Banner background" class="absolute top-0 left-0 w-full h-full object-cover z-10" 
                 onerror="handleImageErrorWithGdriveFallback(this)" 
                 fallbackbaseurl="${window.SITE_THEME.fallbackBaseUrl || ''}" 
                 gdrivefid="${window.SITE_THEME.bannerGdriveId || ''}">
            <div class="absolute top-0 left-0 w-full h-full banner-overlay-gradient z-20"></div>
            
            <div class="absolute top-20 left-5 md:top-24 md:left-8 z-30 flex flex-col items-center gap-2.5 p-4">
                <img src="${window.SITE_THEME.logoUrl || ''}" alt="UAN Logo" class="w-48 md:w-72 h-auto object-contain logo-glow"
                     onerror="handleImageErrorWithGdriveFallback(this)" 
                     fallbackbaseurl="${window.SITE_THEME.fallbackBaseUrl || ''}" 
                     gdrivefid="${window.SITE_THEME.logoGdriveId || ''}">
            </div>

            <div class="banner-content relative z-30 max-w-5xl px-5 pb-16">
                <p class="text-xl md:text-2xl mb-5 font-normal text-shadow-enhanced tracking-wide">
                    United Ancient Indigenous Enlightened Nations (UAN)
                </p>
                <h1 class="text-4xl md:text-6xl font-bold text-shadow-enhanced tracking-wider text-white">
                    ${title}
                </h1>
            </div>`;
        const navElement = document.querySelector('nav');
        navElement ? navElement.after(banner) : document.body.prepend(banner);
    }

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
                    <img src="${theme.logoUrl || ''}" alt="UAN Logo" class="w-[280px] h-auto object-contain"
                         onerror="handleImageErrorWithGdriveFallback(this)" 
                         fallbackbaseurl="${theme.fallbackBaseUrl || ''}" 
                         gdrivefid="${theme.logoGdriveId || ''}">
                </div>
                <div class="text-left md:text-right">
                    ${contact.phone ? `<div>${contact.phone}</div>` : ''}
                    ${contact.email ? `<div>${contact.email}</div>` : ''}
                </div>
            </div>
            <div class="border-t border-white/20 pt-4">
                <div class="text-base text-center md:text-left">${copyright}</div>
            </div>
        </div>`;
        document.body.appendChild(footer);
    }

    function setupEventListeners() {
        const mobileMenu = document.querySelector('.mobile-menu');
        const openButton = document.querySelector('.mobile-menu-open');
        const closeButton = document.querySelector('.mobile-menu-close');

        if (mobileMenu && openButton && closeButton) {
            const toggleMenu = (e) => {
                e.stopPropagation();
                mobileMenu.classList.toggle('translate-x-full');
            };
            openButton.addEventListener('click', toggleMenu);
            closeButton.addEventListener('click', toggleMenu);
        }
    }

    // NEW IN V4: Image fallback mechanism
    function initializeImageFallbacks() {
        // Add error handlers to all existing images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.onerror) {
                img.onerror = function() { handleImageErrorWithGdriveFallback(this); };
            }
        });
    }

    // NEW IN V4: Advanced image fallback handler
    window.handleImageErrorWithGdriveFallback = function(img) {
        // Prevent infinite loops
        if (img.dataset.fallbackAttempt) {
            const attempt = parseInt(img.dataset.fallbackAttempt);
            if (attempt >= 4) return; // Max 4 attempts
            img.dataset.fallbackAttempt = attempt + 1;
        } else {
            img.dataset.fallbackAttempt = '1';
        }

        const attempt = parseInt(img.dataset.fallbackAttempt);
        const originalSrc = img.dataset.originalSrc || img.src;
        
        // Store original src on first attempt
        if (attempt === 1) {
            img.dataset.originalSrc = originalSrc;
        }

        // Extract filename from path or use as-is
        function getFilename(src) {
            return src.split('/').pop().split('?')[0]; // Remove query params too
        }

        // Check if src is a path (contains /) or just filename
        function isPath(src) {
            return src.includes('/') && !src.startsWith('http') && !src.startsWith('data:');
        }

        const filename = getFilename(originalSrc);
        const fallbackBaseUrl = img.getAttribute('fallbackbaseurl') || '';
        const gdriveFileId = img.getAttribute('gdrivefid') || '';
        const altText = img.getAttribute('alt') || '';

        console.log(`Fallback attempt ${attempt} for: ${originalSrc}`);

        switch (attempt) {
            case 1:
                // First fallback: Try filename adjacent to HTML (only if original was a path)
                if (isPath(originalSrc)) {
                    console.log(`Trying adjacent file: ${filename}`);
                    img.src = filename;
                } else {
                    // If original was just filename, skip to next fallback
                    img.dataset.fallbackAttempt = '2';
                    handleImageErrorWithGdriveFallback(img);
                }
                break;

            case 2:
                // Second fallback: Try fallbackbaseurl + filename
                if (fallbackBaseUrl) {
                    const fallbackUrl = fallbackBaseUrl.endsWith('/') 
                        ? fallbackBaseUrl + filename 
                        : fallbackBaseUrl + '/' + filename;
                    console.log(`Trying fallback base URL: ${fallbackUrl}`);
                    img.src = fallbackUrl;
                } else {
                    // Skip to next fallback if no base URL provided
                    img.dataset.fallbackAttempt = '3';
                    handleImageErrorWithGdriveFallback(img);
                }
                break;

            case 3:
                // Third fallback: Try Google Drive URL
                if (gdriveFileId) {
                    const gdriveUrl = `https://drive.google.com/uc?id=${gdriveFileId}&export=view`;
                    console.log(`Trying Google Drive: ${gdriveUrl}`);
                    img.src = gdriveUrl;
                } else {
                    // Skip to final fallback if no Google Drive ID provided
                    img.dataset.fallbackAttempt = '4';
                    handleImageErrorWithGdriveFallback(img);
                }
                break;

            case 4:
                // Final fallback: Generate SVG placeholder
                console.log('Generating SVG placeholder');
                const svgPlaceholder = generateSVGPlaceholder(filename, altText);
                img.src = svgPlaceholder;
                break;
        }
    };

    // NEW IN V4: SVG placeholder generator
    function generateSVGPlaceholder(filename, altText) {
        // Encode text for SVG
        function escapeXml(unsafe) {
            return unsafe.replace(/[<>&'"]/g, function (c) {
                switch (c) {
                    case '<': return '&lt;';
                    case '>': return '&gt;';
                    case '&': return '&amp;';
                    case '\'': return '&apos;';
                    case '"': return '&quot;';
                }
            });
        }

        const safeFilename = escapeXml(filename);
        const safeAltText = escapeXml(altText);
        
        // Create SVG with filename and alt text
        const svgContent = `
            <svg width="300" height="150" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#5E2121"/>
                <rect x="10" y="10" width="280" height="130" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="5,5"/>
                
                <!-- File icon -->
                <g transform="translate(130, 30)">
                    <rect x="0" y="0" width="24" height="30" fill="none" stroke="#FFFFFF" stroke-width="2"/>
                    <rect x="0" y="0" width="18" height="6" fill="#FFFFFF"/>
                    <line x1="6" y1="12" x2="18" y2="12" stroke="#FFFFFF" stroke-width="1"/>
                    <line x1="6" y1="18" x2="18" y2="18" stroke="#FFFFFF" stroke-width="1"/>
                    <line x1="6" y1="24" x2="15" y2="24" stroke="#FFFFFF" stroke-width="1"/>
                </g>
                
                <!-- Main text -->
                <text x="150" y="80" font-family="Arial, sans-serif" font-size="12" fill="#FFFFFF" text-anchor="middle" font-weight="bold">
                    IMAGE NOT FOUND
                </text>
                
                <!-- Filename -->
                <text x="150" y="100" font-family="Arial, sans-serif" font-size="10" fill="#FFFFFF" text-anchor="middle">
                    ${safeFilename}
                </text>
                
                <!-- Alt text if available -->
                ${altText ? `<text x="150" y="120" font-family="Arial, sans-serif" font-size="8" fill="#CCCCCC" text-anchor="middle">${safeAltText}</text>` : ''}
            </svg>
        `;

        // Convert SVG to data URL
        return 'data:image/svg+xml;base64,' + btoa(svgContent);
    }

    // NEW IN V4: Optional function to reset an image to try loading again
    window.resetImageFallback = function(img) {
        delete img.dataset.fallbackAttempt;
        delete img.dataset.originalSrc;
        img.src = img.dataset.originalSrc || img.src;
    };

    init();
});