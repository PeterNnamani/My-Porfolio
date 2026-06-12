/* Shared EmailJS mailer for Nexus Hub chat */
window.NexusMailer = (function () {
    const cfg = () => window.NEXUS_CONFIG || {};
    const emailjsCfg = () => cfg().emailjs || {};

    let readyPromise = null;

    function init() {
        if (readyPromise) return readyPromise;

        readyPromise = new Promise((resolve, reject) => {
            const ej = emailjsCfg();
            if (!ej.publicKey) {
                reject(new Error('EmailJS public key missing in config.js'));
                return;
            }

            const start = () => {
                try {
                    emailjs.init(ej.publicKey);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            };

            if (window.emailjs) {
                start();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js';
            script.onload = start;
            script.onerror = () => reject(new Error('Failed to load EmailJS script'));
            document.head.appendChild(script);
        });

        return readyPromise;
    }

    function convRef(id) {
        return `NXH:${String(id).slice(0, 8)}`;
    }

    function siteBase() {
        const url = cfg().siteUrl;
        if (url && url !== 'null' && !url.startsWith('file:')) return url.replace(/\/$/, '');
        if (typeof window !== 'undefined' && window.location?.origin && !window.location.origin.startsWith('file:'))
            return window.location.origin;
        return '';
    }

    function adminReplyUrl(conv) {
        const base = siteBase();
        const token = conv.admin_token ? `&t=${conv.admin_token}` : '';
        return `${base}/admin.html?c=${conv.id}${token}`;
    }

    function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

    function normalizeEmail(email) {
        return String(email || '').trim().toLowerCase();
    }

    function isValidEmail(email) {
        const e = normalizeEmail(email);
        if (!e || e.length > 254) return false;
        const re = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
        if (!re.test(e)) return false;
        const [local, domain] = e.split('@');
        if (!local || local.length > 64 || !domain || domain.length > 253) return false;
        if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
        return true;
    }

    async function send(params) {
        await init();
        const ej = emailjsCfg();
        const response = await emailjs.send(ej.serviceId, ej.templateId, params);
        return response;
    }

    async function notifyAdmin(conv, messageText) {
        const ej = emailjsCfg();
        const ref = convRef(conv.id);
        const adminUrl = adminReplyUrl(conv);
        const now = new Date().toLocaleString('en-NG', { dateStyle: 'full', timeStyle: 'short' });

        const plainText = `NEXUS HUB — NEW CHAT MESSAGE
Ref: ${ref}
From: ${conv.visitor_name} <${conv.visitor_email}>
Topic: ${conv.topic}

Message:
${messageText}

REPLY IN WEBSITE CHAT (click link):
${adminUrl}

Do NOT use Yahoo/Gmail Reply — use the link above so your reply shows in the chat.`;

        const htmlContent = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:16px;">
  <div style="background:#0f172a;color:#fff;padding:20px;border-radius:12px 12px 0 0;text-align:center;">
    <h2 style="margin:0;font-size:18px;">New Chat Message</h2>
    <p style="margin:8px 0 0;color:#94a3b8;font-size:13px;">${ref}</p>
  </div>
  <div style="background:#fff;border:1px solid #e2e8f0;border-top:0;padding:24px;border-radius:0 0 12px 12px;">
    <p><b>From:</b> ${escapeHtml(conv.visitor_name)} &lt;${escapeHtml(conv.visitor_email)}&gt;</p>
    <p><b>Topic:</b> ${escapeHtml(conv.topic)}</p>
    <p style="background:#f8fafc;border-left:4px solid #3b82f6;padding:12px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(messageText)}</p>
    <p style="background:#fef3c7;padding:12px;border-radius:8px;font-size:13px;color:#92400e;">
      Use the button below to reply — your message will appear in the visitor&apos;s chat box.
    </p>
    <a href="${adminUrl}" style="display:inline-block;background:#3b82f6;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Reply in Website Chat</a>
  </div>
</div>`;

        const visitorEmail = normalizeEmail(conv.visitor_email);

        return send({
            to_email: ej.toEmail,
            to_name: 'Nexus Hub Team',
            from_name: 'Nexus Hub Website',
            from_email: ej.toEmail,
            reply_to: ej.toEmail,
            name: conv.visitor_name,
            // Use admin inbox for "email" so templates with {{email}} as To still deliver here
            email: ej.toEmail,
            visitor_name: conv.visitor_name,
            visitor_email: visitorEmail,
            subject: `[${ref}] ${conv.topic} — ${conv.visitor_name}`,
            topic: conv.topic,
            message: plainText,
            html_message: htmlContent,
            admin_reply_url: adminUrl,
            conversation_id: conv.id,
            inquiry_date: now
        });
    }

    async function notifyVisitor(conv, replyText) {
        const visitorEmail = normalizeEmail(conv.visitor_email);
        if (!isValidEmail(visitorEmail)) {
            return { sent: false, reason: 'invalid_visitor_email', email: visitorEmail };
        }

        const ej = emailjsCfg();
        const ref = convRef(conv.id);
        const now = new Date().toLocaleString('en-NG', { dateStyle: 'full', timeStyle: 'short' });

        const plainText = `Hello ${conv.visitor_name},

You have a new reply from Nexus Hub Limited regarding "${conv.topic}":

${replyText}

---
You can also continue the conversation on our website chat widget.
Reference: ${ref}`;

        const htmlContent = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:16px;">
  <div style="background:linear-gradient(135deg,#1e3a5f,#0f172a);color:#fff;padding:20px;border-radius:12px 12px 0 0;text-align:center;">
    <h2 style="margin:0;font-size:18px;">Nexus Hub Limited</h2>
    <p style="margin:8px 0 0;color:#94a3b8;">Reply to your inquiry</p>
  </div>
  <div style="background:#fff;border:1px solid #e2e8f0;border-top:0;padding:24px;border-radius:0 0 12px 12px;">
    <p>Hello <strong>${escapeHtml(conv.visitor_name)}</strong>,</p>
    <p>We replied regarding <strong>${escapeHtml(conv.topic)}</strong>:</p>
    <p style="background:#f8fafc;border-left:4px solid #3b82f6;padding:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(replyText)}</p>
    <p style="font-size:13px;color:#64748b;">You can also continue on our website live chat.</p>
    <p style="font-size:12px;color:#94a3b8;">Ref: ${ref} · ${now}</p>
  </div>
</div>`;

        const response = await send({
            to_email: visitorEmail,
            to_name: conv.visitor_name,
            from_name: 'Nexus Hub Limited',
            from_email: ej.toEmail,
            reply_to: ej.toEmail,
            name: conv.visitor_name,
            email: visitorEmail,
            subject: `Re: [${ref}] ${conv.topic} — Nexus Hub Reply`,
            topic: conv.topic,
            message: plainText,
            html_message: htmlContent,
            inquiry_date: now
        });
        return { sent: true, response };
    }

    return { init, notifyAdmin, notifyVisitor, adminReplyUrl, convRef, isValidEmail, normalizeEmail };
})();
