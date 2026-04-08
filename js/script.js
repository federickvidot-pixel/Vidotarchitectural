/**
 * Vidot Architectural Furniture – Main Script
 * Scroll (header, hero width), in-view animations, mobile nav, contact modal + FormSubmit.
 */
(function () {
    'use strict';

    const FORM_SUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/vidotarchitectural@bellnet.ca';

    const header = document.querySelector('.header');
    const heroWrapper = document.querySelector('.hero-image-wrapper');
    const textBelow = document.querySelector('.projects-title');
    let ticking = false;

    /** Mobile: blur hero video/image progressively while scrolling (depth cue). */
    function updateHeroScrollBlur() {
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!isMobile || reduceMotion) {
            document.documentElement.style.removeProperty('--hero-scroll-blur');
            return;
        }
        const heroHeight = window.innerHeight;
        const scrollY = window.scrollY;
        const maxBlurPx = 12;
        const progress = Math.min(scrollY / Math.max(heroHeight * 0.45, 1), 1);
        const blur = progress * maxBlurPx;
        document.documentElement.style.setProperty('--hero-scroll-blur', blur.toFixed(2) + 'px');
    }

    function getTextWidth() {
        return textBelow ? textBelow.getBoundingClientRect().width : window.innerWidth;
    }

    function toggleHeaderScrolled() {
        if (!header) return;
        const heroHeight = window.innerHeight;
        const scrollY = window.scrollY;
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        header.classList.toggle('scrolled', scrollY > 50);
        document.body.classList.toggle('scrolled-past-hero', scrollY > heroHeight * 0.5);
        if (heroWrapper && !isMobile) {
            heroWrapper.classList.toggle('scrolled', scrollY > 80);
            const textWidth = getTextWidth();
            const fullWidth = window.innerWidth;
            const progress = Math.min(scrollY / heroHeight, 1);
            const width = fullWidth - (fullWidth - textWidth) * progress;
            heroWrapper.style.width = width + 'px';
            heroWrapper.style.marginLeft = 'auto';
            heroWrapper.style.marginRight = 'auto';
        } else if (heroWrapper && isMobile) {
            heroWrapper.classList.remove('scrolled');
            heroWrapper.style.width = '';
            heroWrapper.style.marginLeft = '';
            heroWrapper.style.marginRight = '';
        }
        updateHeroScrollBlur();
        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(toggleHeaderScrolled);
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
        ticking = false;
        toggleHeaderScrolled();
    });
    toggleHeaderScrolled();

    const heroVideo = document.querySelector('.hero-image .hero-video');
    const heroFallbackImg = document.querySelector('.hero-fallback-img');
    function showHeroFallback() {
        if (heroVideo) {
            heroVideo.setAttribute('hidden', '');
            heroVideo.pause();
        }
        if (heroFallbackImg) heroFallbackImg.removeAttribute('hidden');
    }
    if (heroVideo && heroFallbackImg) {
        heroVideo.addEventListener('error', showHeroFallback);
        if (heroVideo.error) showHeroFallback();
    }

    // Scroll animations
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    const observerOptions = { root: null, rootMargin: '0px 0px -80px 0px', threshold: 0 };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, observerOptions);

    animateElements.forEach((el) => observer.observe(el));

    // Mobile navigation
    const navToggle = document.querySelector('.nav-toggle');
    const navList = document.querySelector('.nav-list');
    const navLinks = document.querySelectorAll('.nav-list a');

    if (navToggle && navList) {
        navToggle.addEventListener('click', () => {
            const expanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
            navList.classList.toggle('active');
            document.body.style.overflow = expanded ? '' : 'hidden';
        });

        navLinks.forEach((link) => {
            link.addEventListener('click', () => {
                navToggle.setAttribute('aria-expanded', 'false');
                navList.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Contact modal
    const contactModalHtml = `
        <div id="contact-modal" class="contact-modal" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title" aria-hidden="true">
            <div class="contact-modal-backdrop" aria-hidden="true"></div>
            <div class="contact-modal-content">
                <button type="button" class="contact-modal-close" aria-label="Close contact form">&times;</button>
                <h2 id="contact-modal-title" class="contact-modal-title">Get in Touch</h2>
                <p class="contact-modal-intro">We'd love to hear about your project. Send us a message and we'll get back to you shortly.</p>
                <form class="contact-form" aria-label="Contact form">
                    <div class="contact-form-row">
                        <label for="contact-name">Name</label>
                        <input type="text" id="contact-name" name="name" required placeholder="Your name">
                    </div>
                    <div class="contact-form-row">
                        <label for="contact-email">Email</label>
                        <input type="email" id="contact-email" name="email" required placeholder="your@email.com">
                    </div>
                    <div class="contact-form-row">
                        <label for="contact-phone">Phone</label>
                        <input type="tel" id="contact-phone" name="phone" placeholder="(514) 555-1234">
                    </div>
                    <div class="contact-form-row">
                        <label for="contact-message">Message</label>
                        <textarea id="contact-message" name="message" rows="4" required placeholder="Tell us about your project..."></textarea>
                    </div>
                    <p class="contact-form-message contact-form-success" role="status" aria-live="polite" hidden>Thank you. We'll be in touch soon.</p>
                    <p class="contact-form-message contact-form-error" role="alert" aria-live="assertive" hidden>Something went wrong. Please try again or email us directly.</p>
                    <button type="submit" class="btn btn-primary">Send Message</button>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', contactModalHtml);

    const contactModal = document.getElementById('contact-modal');
    const contactModalBackdrop = contactModal?.querySelector('.contact-modal-backdrop');
    const contactModalClose = contactModal?.querySelector('.contact-modal-close');
    const contactForm = document.querySelector('.contact-form');

    function openContactModal() {
        if (!contactModal) return;
        contactModal.setAttribute('aria-hidden', 'false');
        contactModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        contactModal.querySelector('#contact-name')?.focus();
    }

    function closeContactModal() {
        if (!contactModal) return;
        contactModal.setAttribute('aria-hidden', 'true');
        contactModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('a.contact-trigger').forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openContactModal();
        });
    });

    if (contactModalBackdrop) contactModalBackdrop.addEventListener('click', closeContactModal);
    if (contactModalClose) contactModalClose.addEventListener('click', closeContactModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && contactModal?.classList.contains('active')) closeContactModal();
    });

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const successEl = contactForm.querySelector('.contact-form-success');
            const errorEl = contactForm.querySelector('.contact-form-error');
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            if (successEl) successEl.hidden = true;
            if (errorEl) errorEl.hidden = true;

            const name = contactForm.querySelector('#contact-name')?.value?.trim() || '';
            const email = contactForm.querySelector('#contact-email')?.value?.trim() || '';
            const phone = contactForm.querySelector('#contact-phone')?.value?.trim() || '';
            const message = contactForm.querySelector('#contact-message')?.value?.trim() || '';
            const valid = name && email && email.includes('@');

            if (!valid) {
                if (errorEl) errorEl.hidden = false;
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending…';
            }

            try {
                const res = await fetch(FORM_SUBMIT_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        _subject: 'Contact Form — ' + name,
                        name: name,
                        email: email,
                        phone: phone || '(not provided)',
                        message: message
                    })
                });

                const data = await res.json();
                if (data.success) {
                    if (successEl) successEl.hidden = false;
                    contactForm.reset();
                } else {
                    throw new Error('Submission failed');
                }
            } catch (err) {
                if (errorEl) errorEl.hidden = false;
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Message';
                }
            }
        });
    }

})();
