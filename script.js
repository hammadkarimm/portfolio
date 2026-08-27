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

    typeRole();

    // ===== THEME SWITCHER =====
    const themeBtns = document.querySelectorAll('.theme-btn');
const body = document.body;
const themeSwitcher = document.getElementById('themeSwitcher');
const themeToggleArrow = document.getElementById('themeToggleArrow');
const themeOrder = ['creamy', 'light', 'dark', 'blue', 'gradient'];

function applyTheme(theme) {
    body.setAttribute('data-theme', theme);
    themeBtns.forEach(b => b.classList.toggle('active', b.dataset.theme === theme));
    localStorage.setItem('theme', theme);
}

themeToggleArrow.addEventListener('click', () => {
    themeSwitcher.classList.toggle('expanded');
});

themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (!themeSwitcher.classList.contains('expanded') && btn.classList.contains('active')) {
            const currentIndex = themeOrder.indexOf(body.getAttribute('data-theme'));
            applyTheme(themeOrder[(currentIndex + 1) % themeOrder.length]);
            return;
        }
        applyTheme(btn.dataset.theme);
        themeSwitcher.classList.remove('expanded');
    });
});

const savedTheme = localStorage.getItem('theme') || 'gradient';
applyTheme(savedTheme);

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
    const sections = document.querySelectorAll('section[id]');
    const navLinksAll = document.querySelectorAll('.nav-link');

    function highlightNav() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        navLinksAll.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    window.addEventListener('scroll', highlightNav);
    highlightNav();

    // ===== BACK TO TOP =====
    const backBtn = document.getElementById('backToTop');
    backBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

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

    // ===== CONTACT FORM VALIDATION =====
const contactForm = document.getElementById('contactForm');
const formFeedback = document.getElementById('formFeedback');

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
// ===== DOWNLOAD CV =====
const downloadCvBtn = document.getElementById('downloadCvBtn');
downloadCvBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = 'CV.pdf';
    link.download = 'Hammad_Karim_CV.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
