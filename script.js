console.log('SCRIPT VERSION 5 LOADED');
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);


// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', () => {

    // --- dynamic year ---
    document.getElementById('year').textContent = new Date().getFullYear();

    // ===== TYPING EFFECT =====
    const typingText = document.getElementById('typingText');
    const roles = [
        'Growth E-Commerce Expert',
        'High-ROAS Ad Strategist', 
        'Lead Generation Expert'
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let speed = 100;

    function typeRole() {
        const current = roles[roleIndex];
        
        if (isDeleting) {
            typingText.textContent = current.substring(0, charIndex - 1);
            charIndex--;
            speed = 50;
        } else {
            typingText.textContent = current.substring(0, charIndex + 1);
            charIndex++;
            speed = 100;
        }

        if (!isDeleting && charIndex === current.length) {
            speed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            speed = 500;
        }

        setTimeout(typeRole, speed);
    }

        if (typingText) typeRole();

    

    // ===== MOBILE HAMBURGER =====
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        const icon = hamburger.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            const icon = hamburger.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        });
    });

    // ===== ACTIVE LINK HIGHLIGHT =====
       const sections = [...document.querySelectorAll('section[id]')];
    const navLinksAll = document.querySelectorAll('.nav-link');
    let tops = [], ticking = false, activeId = '';
    const cacheTops = () => { tops = sections.map(s => s.offsetTop - 120); };
    function highlightNav() {
        ticking = false;
        let current = '';
        for (let i = 0; i < tops.length; i++) if (window.scrollY >= tops[i]) current = sections[i].id;
        if (current === activeId) return;
        activeId = current;
        navLinksAll.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
    }
    cacheTops(); highlightNav();
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(highlightNav); } }, { passive: true });
    window.addEventListener('resize', cacheTops);
    window.addEventListener('load', cacheTops);
    document.addEventListener('click', () => setTimeout(cacheTops, 80));   // tabs change page height

   

    // ===== SCROLL REVEAL ANIMATIONS =====
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger');

let lastScrollY = window.scrollY;
let scrollDir = 'down';
window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    scrollDir = currentY > lastScrollY ? 'down' : 'up';
    lastScrollY = currentY;
}, { passive: true });

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.toggle('from-top', scrollDir === 'up');
            entry.target.classList.add('visible');
        } else {
            entry.target.classList.remove('visible');
        }
    });
}, {
    threshold: 0.15,
    rootMargin: '0px 0px -30px 0px'
});

    revealElements.forEach(el => revealObserver.observe(el));

    // ===== MESSAGE MODAL =====
const openMessageModalBtn = document.getElementById('openMessageModal');
const closeMessageModalBtn = document.getElementById('closeMessageModal');
const messageModalOverlay = document.getElementById('messageModalOverlay');
const contactForm = document.getElementById('contactForm');
const messageTextarea = document.getElementById('message');
const formFeedback = document.getElementById('formFeedback');

let formHasInput = false;

function checkFormHasInput() {
    const fields = contactForm.querySelectorAll('input, textarea');
    formHasInput = Array.from(fields).some(f => f.value.trim().length > 0);
}

contactForm.addEventListener('input', checkFormHasInput);

function openMessageModal() {
    if (!messageModalOverlay) return;
    messageModalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMessageModal(force) {
    if (!messageModalOverlay) return;
    if (!force) {
        checkFormHasInput();
        if (formHasInput) return;
    }
    messageModalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    if (messageTextarea) messageTextarea.style.height = '';
}

if (openMessageModalBtn) openMessageModalBtn.addEventListener('click', openMessageModal);
if (closeMessageModalBtn) closeMessageModalBtn.addEventListener('click', () => closeMessageModal(true));
if (messageModalOverlay) {
    messageModalOverlay.addEventListener('click', (e) => {
        if (e.target === messageModalOverlay) closeMessageModal(false);
    });
}
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMessageModal(false);
});

    // ===== CONTACT FORM VALIDATION =====

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
        formFeedback.textContent = '⚠️ All fields are required.';
        formFeedback.style.color = '#b8865a';
        return;
    }
    if (!email.includes('@') || !email.includes('.')) {
        formFeedback.textContent = '⚠️ Please enter a valid email address.';
        formFeedback.style.color = '#b8865a';
        return;
    }

    fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
          }).then(response => {
        if (response.ok) {
            formFeedback.textContent = '✅ Message sent successfully!';
            formFeedback.style.color = '#6b8c6b';
            contactForm.reset();
            formHasInput = false;
            setTimeout(() => closeMessageModal(true), 1500);
        } else {
            formFeedback.textContent = '⚠️ Something went wrong. Please try again.';
            formFeedback.style.color = '#b8865a';
        }
    }).catch(() => {
        formFeedback.textContent = '⚠️ Something went wrong. Please try again.';
        formFeedback.style.color = '#b8865a';
    });

    setTimeout(() => {
        formFeedback.textContent = '';
    }, 4000);
});
    // ===== SMOOTH SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    // ===== PORTFOLIO TABS =====
const portfolioTabs = document.querySelectorAll('.portfolio-tab');
const portfolioContents = document.querySelectorAll('.portfolio-content');

portfolioTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.tab;

        portfolioTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        portfolioContents.forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`tab-${target}`).classList.add('active');
    });
});

// ===== SERVICES TOGGLE =====
const serviceToggleBtns = document.querySelectorAll('.service-toggle-btn');
const pricingContents = document.querySelectorAll('.pricing-content');

serviceToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.service;

        serviceToggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        pricingContents.forEach(content => content.classList.remove('active'));
        document.getElementById(`service-${target}`).classList.add('active');
    });
});
// ===== CERTIFICATE LIGHTBOX =====
const certCards = document.querySelectorAll('.certificate-card');
const certLightbox = document.getElementById('certLightbox');
const certLightboxImg = document.getElementById('certLightboxImg');


certCards.forEach(card => {
    card.addEventListener('click', () => {
        certLightboxImg.src = card.dataset.img;
        certLightboxImg.classList.remove('zoomed');
        
        certLightbox.classList.add('active');
    });
});

certLightboxImg.addEventListener('click', (e) => {
    e.stopPropagation();
    certLightboxImg.classList.toggle('zoomed');
});

certLightbox.addEventListener('click', () => {
    certLightbox.classList.remove('active');
});
});

// ===== ADS WORK SWIPE GALLERY =====
const adsCards = document.querySelectorAll('.ads-work-card');
const adsLightbox = document.getElementById('adsLightbox');
const adsLightboxScroll = document.getElementById('adsLightboxScroll');

adsCards.forEach(card => {
    card.addEventListener('click', () => {
        const pdfSrc = card.dataset.pdf;
        adsLightboxScroll.innerHTML = `<iframe src="${pdfSrc}" class="ads-pdf-frame" title="${card.dataset.title}"></iframe>`;
        adsLightbox.classList.add('active');
    });
});

function closeAdsLightbox() {
    adsLightbox.classList.remove('active');
    adsLightboxScroll.innerHTML = '';
}

adsLightboxScroll.addEventListener('click', (e) => {
    if (e.target === adsLightboxScroll) {
        closeAdsLightbox();
    }
});
// ===== HERO AD SLIDESHOW =====
const heroSlides = document.querySelectorAll('#heroSlideshow .ad-slide');
let heroSlideIndex = 0;

if (heroSlides.length > 0) {
    setInterval(() => {
        heroSlides[heroSlideIndex].classList.remove('active');
        heroSlideIndex = (heroSlideIndex + 1) % heroSlides.length;
        heroSlides[heroSlideIndex].classList.add('active');
    }, 3000);
}
 