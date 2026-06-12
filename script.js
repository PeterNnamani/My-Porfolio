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
    initChatWidget();
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

/* Chat Widget */
const CHAT_EMAIL = 'nexushub.officiel@yahoo.com';

function initChatWidget() {
    const widget = document.getElementById('chat-widget');
    const panel = document.getElementById('chat-panel');
    const launcher = document.getElementById('chat-launcher');
    const closeBtn = document.getElementById('chat-close');
    const messagesEl = document.getElementById('chat-messages');
    const quickRepliesEl = document.getElementById('chat-quick-replies');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');

    const state = {
        step: 'topic',
        name: '',
        email: '',
        topic: '',
        message: '',
        initialized: false,
        emailjsReady: false
    };

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js';
    script.onload = () => {
        emailjs.init('N3kN7OWGID6l2hxsI');
        state.emailjsReady = true;
    };
    document.body.appendChild(script);

    function openChat() {
        widget.classList.add('open', 'seen');
        panel.setAttribute('aria-hidden', 'false');
        if (!state.initialized) {
            state.initialized = true;
            startConversation();
        }
        setTimeout(() => input.focus(), 350);
    }

    function closeChat() {
        widget.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
    }

    function toggleChat() {
        widget.classList.contains('open') ? closeChat() : openChat();
    }

    launcher.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', closeChat);

    document.querySelectorAll('.open-chat').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            openChat();
        });
    });

    function getTime() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function scrollToBottom() {
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function addMessage(type, text, options = {}) {
        const msg = document.createElement('div');
        msg.className = `chat-msg ${type}`;

        if (options.successCard) {
            msg.classList.add('success-card');
            msg.innerHTML = options.successCard;
        } else if (type === 'system') {
            msg.innerHTML = `<div class="chat-msg-bubble">${text}</div>`;
        } else {
            const avatar = type === 'bot'
                ? '<i class="ri-code-s-slash-line"></i>'
                : '<i class="ri-user-3-line"></i>';
            msg.innerHTML = `
                <div class="chat-msg-avatar">${avatar}</div>
                <div class="chat-msg-bubble">
                    ${text}
                    <span class="chat-msg-time">${getTime()}</span>
                </div>
            `;
        }

        messagesEl.appendChild(msg);
        scrollToBottom();
    }

    function showTyping(duration = 900) {
        return new Promise(resolve => {
            const typing = document.createElement('div');
            typing.className = 'chat-typing';
            typing.innerHTML = `
                <div class="chat-msg-avatar" style="background:linear-gradient(135deg,var(--primary),var(--accent));color:white;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:0.85rem;">
                    <i class="ri-code-s-slash-line"></i>
                </div>
                <div class="chat-typing-dots"><span></span><span></span><span></span></div>
            `;
            messagesEl.appendChild(typing);
            scrollToBottom();
            setTimeout(() => {
                typing.remove();
                resolve();
            }, duration);
        });
    }

    function setQuickReplies(replies) {
        quickRepliesEl.innerHTML = '';
        replies.forEach(label => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'chat-quick-btn';
            btn.textContent = label;
            btn.addEventListener('click', () => {
                quickRepliesEl.innerHTML = '';
                handleUserInput(label);
            });
            quickRepliesEl.appendChild(btn);
        });
    }

    function setPlaceholder(text) {
        input.placeholder = text;
    }

    async function botSay(text, delay = 700) {
        await showTyping(delay);
        addMessage('bot', text);
    }

    async function handleTopicStep(value) {
        state.topic = value;
        state.step = 'name';
        await botSay('Great choice! May I have your <strong>full name</strong>?');
        setPlaceholder('Enter your full name...');
    }

    async function startConversation() {
        await botSay('👋 Welcome to <strong>Nexus Hub Limited</strong>! I\'m here to connect you with our team.');
        await botSay('What can we help you with today?');
        setQuickReplies(['Web Development', 'Mobile App', 'Get a Quote', 'General Inquiry']);
        setPlaceholder('Or type your inquiry...');
        state.step = 'topic';
    }

    async function resetConversation() {
        messagesEl.innerHTML = '';
        quickRepliesEl.innerHTML = '';
        state.name = '';
        state.email = '';
        state.topic = '';
        state.message = '';
        state.step = 'topic';
        input.disabled = false;
        sendBtn.disabled = false;
        setPlaceholder('Type your message...');
        await startConversation();
    }

    async function handleUserInput(text) {
        const value = text.trim();
        if (!value) return;

        if (state.step === 'done') {
            await resetConversation();
            if (value !== 'Start New Inquiry') {
                addMessage('user', value);
                input.value = '';
                await handleTopicStep(value);
            }
            return;
        }

        addMessage('user', value);
        input.value = '';

        switch (state.step) {
            case 'topic':
                await handleTopicStep(value);
                break;
            case 'name':
                state.name = value;
                state.step = 'email';
                await botSay(`Nice to meet you, <strong>${state.name}</strong>! What\'s your <strong>email address</strong>?`);
                setPlaceholder('your@email.com');
                break;

            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    await botSay('Please enter a valid email address so our team can reach you.');
                    return;
                }
                state.email = value;
                state.step = 'message';
                await botSay('Perfect! Please share the <strong>details of your project or inquiry</strong>.');
                setPlaceholder('Describe your project...');
                break;

            case 'message':
                state.message = value;
                state.step = 'sending';
                input.disabled = true;
                sendBtn.disabled = true;
                quickRepliesEl.innerHTML = '';
                await botSay('Thank you! Sending your message to our team now...');
                await sendChatEmail();
                break;
        }
    }

    function buildEmailContent() {
        const now = new Date().toLocaleString('en-NG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const plainText = `
╔══════════════════════════════════════════════════╗
║         NEXUS HUB LIMITED — NEW INQUIRY            ║
╚══════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CLIENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Name       : ${state.name}
  Email      : ${state.email}
  Topic      : ${state.topic}
  Received   : ${now}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${state.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Sent via Nexus Hub Website Live Chat
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`.trim();

        const htmlContent = `
<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:20px;">
  <div style="background:linear-gradient(135deg,#1e3a5f,#0f172a);border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
    <div style="width:48px;height:48px;background:linear-gradient(135deg,#3b82f6,#06b6d4);border-radius:12px;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;">
      <span style="color:white;font-size:22px;font-weight:bold;">&#60;/&#62;</span>
    </div>
    <h1 style="color:white;margin:0;font-size:20px;font-weight:700;letter-spacing:0.5px;">NEXUS HUB LIMITED</h1>
    <p style="color:#94a3b8;margin:6px 0 0;font-size:13px;">New Client Inquiry via Live Chat</p>
  </div>
  <div style="background:white;border-radius:0 0 12px 12px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    <div style="background:#f1f5f9;border-radius:8px;padding:20px;margin-bottom:24px;">
      <h2 style="color:#0f172a;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;border-bottom:2px solid #3b82f6;padding-bottom:8px;display:inline-block;">Client Details</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#64748b;font-size:13px;width:100px;">Name</td><td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:600;">${state.name}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Email</td><td style="padding:8px 0;"><a href="mailto:${state.email}" style="color:#3b82f6;font-size:14px;text-decoration:none;">${state.email}</a></td></tr>
        <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Topic</td><td style="padding:8px 0;"><span style="background:#dbeafe;color:#1d4ed8;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">${state.topic}</span></td></tr>
        <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Received</td><td style="padding:8px 0;color:#475569;font-size:13px;">${now}</td></tr>
      </table>
    </div>
    <h2 style="color:#0f172a;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Message</h2>
    <div style="background:#f8fafc;border-left:4px solid #3b82f6;padding:16px 20px;border-radius:0 8px 8px 0;color:#334155;font-size:14px;line-height:1.7;white-space:pre-wrap;">${state.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">Sent via Nexus Hub Limited Website Live Chat</p>
    </div>
  </div>
</div>`.trim();

        return { plainText, htmlContent, now };
    }

    async function sendChatEmail() {
        const { plainText, htmlContent, now } = buildEmailContent();

        try {
            if (!state.emailjsReady) {
                await new Promise((resolve, reject) => {
                    const check = setInterval(() => {
                        if (state.emailjsReady) { clearInterval(check); resolve(); }
                    }, 100);
                    setTimeout(() => { clearInterval(check); reject(new Error('timeout')); }, 5000);
                });
            }

            await emailjs.send('service_5c7dbcf', 'template_pi624hk', {
                to_email: CHAT_EMAIL,
                from_name: state.name,
                from_email: state.email,
                reply_to: state.email,
                subject: `[Nexus Hub] ${state.topic} — ${state.name}`,
                message: plainText,
                html_message: htmlContent,
                topic: state.topic,
                client_name: state.name,
                client_email: state.email,
                inquiry_date: now
            });

            addMessage('bot', '', {
                successCard: `
                    <div class="chat-success-card">
                        <div class="chat-success-icon"><i class="ri-check-line"></i></div>
                        <h5>Message Delivered!</h5>
                        <p>Your inquiry has been sent to our team at <strong>${CHAT_EMAIL}</strong>. We'll respond within 24 hours.</p>
                    </div>
                `
            });

            state.step = 'done';
            setPlaceholder('Type to start a new inquiry...');
            input.disabled = false;
            sendBtn.disabled = false;
            setQuickReplies(['Start New Inquiry']);
        } catch {
            await botSay('Sorry, we couldn\'t send your message. Please email us directly at <strong>nexushub.officiel@yahoo.com</strong>.');
            state.step = 'message';
            input.disabled = false;
            sendBtn.disabled = false;
        }
    }

    function sendMessage() {
        if (state.step === 'done' || state.step === 'sending') return;
        handleUserInput(input.value);
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    window.openChat = openChat;
}
