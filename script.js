document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initHeader();
    initTheme();
    initMobileMenu();
    initScrollReveal();
    initCounters();
    initProductFilters();
    initSmoothScroll();
    initBackToTop();
    initActiveNav();
});

/* Page Loader */
function initLoader() {
    const loader = document.getElementById('page-loader');
    document.body.classList.add('loading');

    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('hidden');
            document.body.classList.remove('loading');
            document.querySelectorAll('.hero .reveal').forEach((el, i) => {
                setTimeout(() => el.classList.add('visible'), i * 150);
            });
        }, 1800);
    });
}

/* Header scroll effect */
function initHeader() {
    const header = document.getElementById('site-header');

    const onScroll = () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

/* Theme toggle */
function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    const saved = localStorage.getItem('theme');

    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });
}

/* Mobile menu */
function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');

    btn.addEventListener('click', () => {
        menu.classList.toggle('open');
        const icon = btn.querySelector('i');
        icon.className = menu.classList.contains('open') ? 'ri-close-line' : 'ri-menu-line';
    });

    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('open');
            btn.querySelector('i').className = 'ri-menu-line';
        });
    });
}

/* Scroll reveal */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal:not(.hero .reveal)');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    reveals.forEach(el => observer.observe(el));
}

/* Counter animation */
function initCounters() {
    const counters = document.querySelectorAll('.counter-value[data-target]');
    let animated = false;

    const animate = () => {
        if (animated) return;
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            let current = 0;
            const step = Math.max(1, Math.ceil(target / 60));

            const tick = () => {
                current += step;
                if (current >= target) {
                    counter.textContent = target;
                } else {
                    counter.textContent = current;
                    requestAnimationFrame(tick);
                }
            };
            tick();
        });
        animated = true;
    };

    const heroStats = document.querySelector('.hero-stats');
    if (!heroStats) return;

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            animate();
            observer.disconnect();
        }
    }, { threshold: 0.5 });

    observer.observe(heroStats);
}

/* Product filters */
function initProductFilters() {
    const filters = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.product-card');

    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            filters.forEach(f => f.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            cards.forEach(card => {
                const cat = card.getAttribute('data-category');
                card.classList.toggle('hidden-filter', filter !== 'all' && cat !== filter);
            });
        });
    });
}

/* Smooth scroll */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* Back to top */
function initBackToTop() {
    const btn = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* Active nav on scroll */
function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 120) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    }, { passive: true });
}

/* Project modals */
const projects = {
    edupulse: {
        title: 'EduPulse',
        status: 'Live',
        statusClass: 'status-live',
        description: 'EduPulse is a full-featured online education platform built to deliver courses, manage student enrollment, and provide interactive learning experiences for institutions and individual learners.',
        features: [
            'Course creation and management',
            'Student enrollment and progress tracking',
            'Interactive learning modules',
            'Responsive web design for all devices',
            'Secure user authentication',
            'Admin dashboard for educators'
        ],
        tags: ['React', 'E-Learning', 'LMS', 'Education'],
        link: 'https://edupulseonline.com/',
        linkText: 'Visit EduPulse'
    },
    linkskool: {
        title: 'Linkskool',
        status: 'Live',
        statusClass: 'status-live',
        description: 'Linkskool is your gateway to learning and skill development — a platform that connects learners with quality courses, resources, and tools to build career-ready skills in technology and beyond.',
        features: [
            'Course catalog and skill pathways',
            'User profiles and learning progress',
            'Resource library and materials',
            'Modern, accessible interface',
            'Scalable architecture for growth',
            'Mobile-responsive design'
        ],
        tags: ['React', 'Education', 'Skills', 'Web Platform'],
        link: 'https://linkskool.com/',
        linkText: 'Visit Linkskool'
    },
    ahialink: {
        title: 'AhiaLink',
        status: 'In Development',
        statusClass: 'status-dev',
        description: 'AhiaLink is a mobile connectivity platform currently in active development. Built with React Native, it is designed to bridge communities through smart, accessible mobile technology.',
        features: [
            'Cross-platform iOS and Android support',
            'Modern, intuitive mobile UI',
            'Real-time connectivity features',
            'Secure authentication and data handling',
            'Offline-capable architecture',
            'Push notifications'
        ],
        tags: ['React Native', 'iOS', 'Android', 'Mobile'],
        link: null,
        linkText: null
    },
    shopping: {
        title: 'Shopping Mobile App',
        status: 'In Development',
        statusClass: 'status-dev',
        description: 'A full-featured e-commerce mobile application with product browsing, shopping cart, secure checkout, and order tracking — built to deliver a seamless shopping experience on iOS and Android.',
        features: [
            'Product catalog with search and filters',
            'Shopping cart and wishlist',
            'Secure payment integration',
            'Order tracking and history',
            'User accounts and profiles',
            'Push notifications for orders'
        ],
        tags: ['React Native', 'E-Commerce', 'Payments', 'Mobile'],
        link: null,
        linkText: null
    }
};

window.openModal = function (projectId) {
    const project = projects[projectId];
    if (!project) return;

    const modal = document.getElementById('projectModal');
    const content = document.getElementById('modalContent');

    content.innerHTML = `
        <div class="modal-header">
            <h3>${project.title}</h3>
            <span class="modal-status ${project.statusClass}">${project.status}</span>
        </div>
        <div class="modal-body">
            <p>${project.description}</p>
            <div class="modal-features">
                <h4>Key Features</h4>
                <ul>
                    ${project.features.map(f => `<li><i class="ri-check-line"></i> ${f}</li>`).join('')}
                </ul>
            </div>
            <div class="modal-tags">
                ${project.tags.map(t => `<span>${t}</span>`).join('')}
            </div>
            ${project.link ? `<a href="${project.link}" target="_blank" rel="noopener" class="btn btn-primary modal-link">${project.linkText} <i class="ri-external-link-line"></i></a>` : ''}
        </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

window.closeModal = function () {
    document.getElementById('projectModal').classList.add('hidden');
    document.body.style.overflow = '';
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

