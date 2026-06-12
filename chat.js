/* Nexus Hub — persistent chat with conversation history */

function initChatWidget() {
    const cfg = window.NEXUS_CONFIG || {};
    const T = cfg.tables || { conversations: 'nexus_hub_conversations', messages: 'nexus_hub_messages' };
    const emailjsCfg = cfg.emailjs || {
        publicKey: 'N3kN7OWGID6l2hxsI',
        serviceId: 'service_5c7dbcf',
        templateId: 'template_pi624hk',
        toEmail: 'nexushub.officiel@yahoo.com'
    };

    const widget = document.getElementById('chat-widget');
    const panel = document.getElementById('chat-panel');
    const launcher = document.getElementById('chat-launcher');
    const listView = document.getElementById('chat-list-view');
    const threadView = document.getElementById('chat-thread-view');
    const convListEl = document.getElementById('chat-conversation-list');
    const messagesEl = document.getElementById('chat-messages');
    const quickRepliesEl = document.getElementById('chat-quick-replies');
    const onboardingEl = document.getElementById('chat-onboarding');
    const inputArea = document.getElementById('chat-input-area');
    const threadActions = document.getElementById('chat-thread-actions');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    const notifBadge = document.getElementById('chat-notification');
    const threadTopic = document.getElementById('chat-thread-topic');
    const threadStatus = document.getElementById('chat-thread-status');

    let supabase = null;
    let realtimeChannel = null;
    let emailjsReady = false;

    const state = {
        view: 'list',
        activeConversationId: null,
        conversations: [],
        messages: [],
        onboarding: null,
        pollTimer: null
    };

    const VISITOR_KEY = 'nexus_visitor_id';
    const LOCAL_DATA_KEY = 'nexus_chat_data';
    const READ_KEY = 'nexus_chat_last_read';

    function getVisitorId() {
        let id = localStorage.getItem(VISITOR_KEY);
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem(VISITOR_KEY, id);
        }
        return id;
    }

    function getLocalData() {
        try {
            return JSON.parse(localStorage.getItem(LOCAL_DATA_KEY)) || { conversations: [], messages: {} };
        } catch {
            return { conversations: [], messages: {} };
        }
    }

    function saveLocalData(data) {
        localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(data));
    }

    function initSupabase() {
        try {
            if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) return null;
            const lib = window.supabase;
            if (!lib?.createClient) {
                console.warn('Supabase library not loaded — using local storage fallback');
                return null;
            }
            return lib.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
        } catch (e) {
            console.error('Supabase init failed:', e);
            return null;
        }
    }

    function convRef(id) {
        return `NXH:${id.slice(0, 8)}`;
    }

    function formatTime(iso) {
        const d = new Date(iso);
        const now = new Date();
        const sameDay = d.toDateString() === now.toDateString();
        if (sameDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

    function formatError(err) {
        if (!err) return 'Unknown error';
        if (typeof err === 'string') return err;
        const parts = [err.message, err.details, err.hint, err.code].filter(Boolean);
        if (parts.length) return parts.join(' — ');
        try {
            return JSON.stringify(err);
        } catch {
            return String(err);
        }
    }

    function showView(name) {
        state.view = name;
        listView.classList.toggle('hidden', name !== 'list');
        threadView.classList.toggle('hidden', name !== 'thread');
    }

    function openChat() {
        widget.classList.add('open', 'seen');
        panel.setAttribute('aria-hidden', 'false');
        loadConversationList();
        showView(state.activeConversationId ? 'thread' : 'list');
        setTimeout(() => input.focus(), 300);
    }

    function closeChat() {
        widget.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
        unsubscribeRealtime();
    }

    function toggleChat() {
        widget.classList.contains('open') ? closeChat() : openChat();
    }

    async function loadConversationList() {
        const visitorId = getVisitorId();

        if (supabase) {
            const { data, error } = await supabase
                .from(T.conversations)
                .select('*')
                .eq('visitor_id', visitorId)
                .order('updated_at', { ascending: false });

            if (!error && data) state.conversations = data;
        } else {
            const local = getLocalData();
            state.conversations = local.conversations
                .filter(c => c.visitor_id === visitorId)
                .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        }

        renderConversationList();
        updateUnreadBadge();
    }

    function getUnreadCount() {
        const readMap = JSON.parse(localStorage.getItem(READ_KEY) || '{}');
        let count = 0;
        state.conversations.forEach(c => {
            if (c.status === 'closed') return;
            const lastRead = readMap[c.id] || 0;
            if (new Date(c.updated_at).getTime() > lastRead) count++;
        });
        return count;
    }

    function getMessagesSync(convId) {
        if (supabase) return state.messages;
        return getLocalData().messages[convId] || [];
    }

    function updateUnreadBadge() {
        const count = getUnreadCount();
        if (count > 0) {
            notifBadge.textContent = count > 9 ? '9+' : count;
            notifBadge.classList.remove('hidden');
        } else {
            notifBadge.classList.add('hidden');
        }
    }

    function markConversationRead(convId) {
        const readMap = JSON.parse(localStorage.getItem(READ_KEY) || '{}');
        readMap[convId] = Date.now();
        localStorage.setItem(READ_KEY, JSON.stringify(readMap));
        updateUnreadBadge();
    }

    async function renderConversationList() {
        if (!state.conversations.length) {
            convListEl.innerHTML = `
                <div class="chat-list-empty">
                    <i class="ri-chat-3-line"></i>
                    <p>No conversations yet</p>
                    <span>Start a new chat to reach our team</span>
                </div>`;
            return;
        }

        const previews = await Promise.all(state.conversations.map(async (c) => {
            let lastMsg = '';
            if (supabase) {
                const { data } = await supabase
                    .from(T.messages)
                    .select('content, sender')
                    .eq('conversation_id', c.id)
                    .order('created_at', { ascending: false })
                    .limit(1);
                if (data?.[0]) lastMsg = data[0].content;
            } else {
                const msgs = getLocalData().messages[c.id] || [];
                if (msgs.length) lastMsg = msgs[msgs.length - 1].content;
            }
            return { ...c, preview: lastMsg };
        }));

        convListEl.innerHTML = previews.map(c => `
            <button type="button" class="chat-conv-item ${c.status}" data-id="${c.id}">
                <div class="chat-conv-icon ${c.status}">
                    <i class="ri-${c.status === 'closed' ? 'checkbox-circle' : 'message-2'}-line"></i>
                </div>
                <div class="chat-conv-body">
                    <div class="chat-conv-top">
                        <strong>${escapeHtml(c.topic)}</strong>
                        <span>${formatTime(c.updated_at)}</span>
                    </div>
                    <p>${escapeHtml(c.preview || 'No messages yet')}</p>
                    <span class="chat-conv-badge ${c.status}">${c.status === 'closed' ? 'Resolved' : 'Active'}</span>
                </div>
            </button>
        `).join('');

        convListEl.querySelectorAll('.chat-conv-item').forEach(btn => {
            btn.addEventListener('click', () => openConversation(btn.dataset.id));
        });
    }

    async function openConversation(id) {
        state.activeConversationId = id;
        const conv = state.conversations.find(c => c.id === id);
        if (!conv) return;

        threadTopic.textContent = conv.topic;
        threadStatus.textContent = conv.status === 'closed' ? 'Resolved' : 'Active';
        threadStatus.className = `chat-thread-status ${conv.status}`;

        const isClosed = conv.status === 'closed';
        inputArea.classList.toggle('hidden', isClosed);
        threadActions.classList.toggle('hidden', isClosed);
        onboardingEl.classList.add('hidden');
        quickRepliesEl.innerHTML = '';

        await loadMessages(id);
        subscribeRealtime(id);
        markConversationRead(id);
        showView('thread');
        scrollToBottom();
    }

    async function loadMessages(convId) {
        if (supabase) {
            const { data } = await supabase
                .from(T.messages)
                .select('*')
                .eq('conversation_id', convId)
                .order('created_at', { ascending: true });
            state.messages = data || [];
        } else {
            state.messages = getLocalData().messages[convId] || [];
        }
        renderMessages();
    }

    function renderMessages() {
        messagesEl.innerHTML = '';
        state.messages.forEach(m => appendMessageEl(m.sender, m.content, m.created_at, false));
        scrollToBottom();
    }

    function scrollToBottom() {
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function appendMessageEl(type, text, time, animate = true) {
        const msg = document.createElement('div');
        msg.className = `chat-msg ${type === 'admin' ? 'bot' : type === 'user' ? 'user' : 'bot'}`;
        if (animate) msg.style.animation = 'msgIn 0.35s ease';

        const avatar = type === 'user'
            ? '<i class="ri-user-3-line"></i>'
            : '<i class="ri-code-s-slash-line"></i>';

        const label = type === 'admin' ? '<span class="chat-admin-label">Nexus Hub</span>' : '';

        msg.innerHTML = `
            <div class="chat-msg-avatar">${avatar}</div>
            <div class="chat-msg-bubble">
                ${label}
                ${text}
                <span class="chat-msg-time">${formatTime(time || new Date().toISOString())}</span>
            </div>`;
        messagesEl.appendChild(msg);
        scrollToBottom();
    }

    async function insertMessage(convId, sender, content) {
        const now = new Date().toISOString();
        const row = {
            id: crypto.randomUUID(),
            conversation_id: convId,
            sender,
            content,
            created_at: now
        };

        if (supabase) {
            const { error } = await supabase.from(T.messages).insert({
                id: row.id,
                conversation_id: convId,
                sender,
                content
            });
            if (error) throw error;

            const { error: updateError } = await supabase
                .from(T.conversations)
                .update({ updated_at: now })
                .eq('id', convId);
            if (updateError) console.warn('Conversation update failed:', updateError);

            return row;
        }

        const local = getLocalData();
        if (!local.messages[convId]) local.messages[convId] = [];
        local.messages[convId].push(row);
        const conv = local.conversations.find(c => c.id === convId);
        if (conv) conv.updated_at = now;
        saveLocalData(local);
        return row;
    }

    async function createConversation(visitorName, visitorEmail, topic) {
        const visitorId = getVisitorId();
        const now = new Date().toISOString();
        const row = {
            id: crypto.randomUUID(),
            visitor_id: visitorId,
            visitor_name: visitorName,
            visitor_email: visitorEmail,
            topic,
            status: 'open',
            created_at: now,
            updated_at: now
        };

        if (supabase) {
            const { error } = await supabase.from(T.conversations).insert({
                id: row.id,
                visitor_id: visitorId,
                visitor_name: visitorName,
                visitor_email: visitorEmail,
                topic,
                status: 'open'
            });
            if (error) throw error;
            return row;
        }

        const local = getLocalData();
        local.conversations.push(row);
        saveLocalData(local);
        return row;
    }

    function startOnboarding() {
        state.onboarding = { step: 'topic', name: '', email: '', topic: '' };
        state.activeConversationId = null;
        showView('thread');
        messagesEl.innerHTML = '';
        onboardingEl.classList.remove('hidden');
        inputArea.classList.add('hidden');
        threadActions.classList.add('hidden');
        threadTopic.textContent = 'New conversation';
        threadStatus.textContent = 'Starting...';
        quickRepliesEl.innerHTML = '';

        onboardingEl.innerHTML = `
            <div class="chat-onboarding-inner">
                <p class="chat-onboarding-title">Start a conversation</p>
                <p class="chat-onboarding-desc">Tell us how we can help. Your chat history is saved automatically.</p>
            </div>`;

        appendMessageEl('bot', '👋 Welcome to <strong>Nexus Hub Limited</strong>! What can we help you with?', new Date().toISOString());
        setQuickReplies(['Web Development', 'Mobile App', 'Get a Quote', 'General Inquiry']);
        inputArea.classList.remove('hidden');
        input.placeholder = 'Or type your inquiry...';
        input.disabled = false;
        sendBtn.disabled = false;
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
                handleOnboardingInput(label);
            });
            quickRepliesEl.appendChild(btn);
        });
    }

    async function handleOnboardingInput(text) {
        const value = text.trim();
        if (!value || !state.onboarding) return;

        appendMessageEl('user', escapeHtml(value), new Date().toISOString());

        const ob = state.onboarding;

        if (ob.step === 'topic') {
            ob.topic = value;
            ob.step = 'name';
            appendMessageEl('bot', 'May I have your <strong>full name</strong>?', new Date().toISOString());
            input.placeholder = 'Your full name';
        } else if (ob.step === 'name') {
            ob.name = value;
            ob.step = 'email';
            appendMessageEl('bot', `Nice to meet you, <strong>${escapeHtml(ob.name)}</strong>! What's your <strong>email</strong>?`, new Date().toISOString());
            input.placeholder = 'your@email.com';
        } else if (ob.step === 'email') {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                appendMessageEl('bot', 'Please enter a valid email address.', new Date().toISOString());
                return;
            }
            ob.email = value;
            ob.step = 'message';
            appendMessageEl('bot', 'Share the <strong>details of your inquiry</strong>.', new Date().toISOString());
            input.placeholder = 'Describe your project...';
        } else if (ob.step === 'message') {
            ob.step = 'creating';
            input.disabled = true;
            sendBtn.disabled = true;
            appendMessageEl('bot', 'Creating your conversation...', new Date().toISOString());

            try {
                const conv = await createConversation(ob.name, ob.email, ob.topic);
                await insertMessage(conv.id, 'bot', 'Conversation started. Our team will reply here and via email.');
                await insertMessage(conv.id, 'user', value);
                await notifyAdminByEmail(conv, value);
                state.onboarding = null;
                onboardingEl.classList.add('hidden');
                threadActions.classList.remove('hidden');
                await loadConversationList();
                await openConversation(conv.id);
            } catch (e) {
                console.error('Create conversation failed:', e);
                const errMsg = formatError(e);
                appendMessageEl('bot', `Could not start conversation: <strong>${escapeHtml(errMsg)}</strong>. Run <code>supabase/schema.sql</code> in your Supabase SQL Editor if tables are missing.`, new Date().toISOString());
                ob.step = 'message';
                input.disabled = false;
                sendBtn.disabled = false;
                throw e;
            }
        }
    }

    async function sendThreadMessage() {
        const text = input.value.trim();
        if (!text) return;

        // Onboarding: no conversation id yet — must run before activeConversationId check
        if (state.onboarding) {
            input.value = '';
            sendBtn.disabled = true;
            try {
                await handleOnboardingInput(text);
            } catch (e) {
                console.error('Onboarding send failed:', e);
                appendMessageEl('bot', 'Something went wrong. Please try again.', new Date().toISOString());
                if (state.onboarding) state.onboarding.step = state.onboarding.step === 'creating' ? 'message' : state.onboarding.step;
            } finally {
                sendBtn.disabled = state.onboarding?.step === 'creating';
                input.disabled = state.onboarding?.step === 'creating';
                if (!input.disabled) input.focus();
            }
            return;
        }

        if (!state.activeConversationId) {
            showView('thread');
            startOnboarding();
            return;
        }

        const conv = state.conversations.find(c => c.id === state.activeConversationId);
        if (!conv) {
            appendMessageEl('bot', 'Conversation not found. Please go back and select a chat.', new Date().toISOString());
            return;
        }
        if (conv.status === 'closed') {
            appendMessageEl('bot', 'This conversation is resolved. Start a <strong>new chat</strong> from the list.', new Date().toISOString());
            return;
        }

        input.value = '';
        input.disabled = true;
        sendBtn.disabled = true;

        try {
            const saved = await insertMessage(conv.id, 'user', text);
            state.messages.push(saved || { sender: 'user', content: text, created_at: new Date().toISOString() });
            appendMessageEl('user', escapeHtml(text), new Date().toISOString());
            try {
                await notifyAdminByEmail(conv, text);
            } catch (emailErr) {
                console.warn('Email notify failed (message still saved):', emailErr);
            }
        } catch (e) {
            console.error('Send failed:', e);
            input.value = text;
            appendMessageEl('bot', `Failed to send: ${escapeHtml(formatError(e))}`, new Date().toISOString());
        }

        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
    }

    async function closeConversation() {
        if (!state.activeConversationId) return;
        const convId = state.activeConversationId;

        if (supabase) {
            await supabase.from(T.conversations).update({ status: 'closed', updated_at: new Date().toISOString() }).eq('id', convId);
        } else {
            const local = getLocalData();
            const conv = local.conversations.find(c => c.id === convId);
            if (conv) {
                conv.status = 'closed';
                conv.updated_at = new Date().toISOString();
                saveLocalData(local);
            }
        }

        await insertMessage(convId, 'bot', 'This conversation has been marked as resolved. Start a new chat anytime from the list.');
        unsubscribeRealtime();
        state.activeConversationId = null;
        await loadConversationList();
        showView('list');
    }

    function buildEmailContent(conv, messageText) {
        const now = new Date().toLocaleString('en-NG', { dateStyle: 'full', timeStyle: 'short' });
        const ref = convRef(conv.id);
        const adminUrl = `${cfg.siteUrl || window.location.origin}/admin.html?c=${conv.id}`;

        const plainText = `
NEXUS HUB LIMITED — CHAT MESSAGE
Reference: ${ref}
Conversation ID: ${conv.id}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLIENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name:  ${conv.visitor_name}
Email: ${conv.visitor_email}
Topic: ${conv.topic}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEW MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${messageText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REPLY IN CHAT (shows on user's website):
${adminUrl}

To reply by email and sync to chat, use subject:
[${ref}] Your reply
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`.trim();

        const htmlContent = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:20px;">
  <div style="background:linear-gradient(135deg,#1e3a5f,#0f172a);border-radius:12px 12px 0 0;padding:24px;text-align:center;color:white;">
    <h1 style="margin:0;font-size:18px;">Nexus Hub — New Chat Message</h1>
    <p style="margin:8px 0 0;color:#94a3b8;font-size:13px;">Ref: ${ref}</p>
  </div>
  <div style="background:white;padding:24px;border-radius:0 0 12px 12px;">
    <p><strong>From:</strong> ${escapeHtml(conv.visitor_name)} &lt;${escapeHtml(conv.visitor_email)}&gt;</p>
    <p><strong>Topic:</strong> ${escapeHtml(conv.topic)}</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;">
    <p style="line-height:1.6;white-space:pre-wrap;">${escapeHtml(messageText)}</p>
    <a href="${adminUrl}" style="display:inline-block;margin-top:20px;background:#3b82f6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Reply in Admin Panel →</a>
    <p style="margin-top:16px;font-size:12px;color:#94a3b8;">Replies from the admin panel appear instantly in the user's chat.</p>
  </div>
</div>`;

        return { plainText, htmlContent, now, ref };
    }

    async function notifyAdminByEmail(conv, messageText) {
        if (!emailjsReady) return;

        const { plainText, htmlContent, now, ref } = buildEmailContent(conv, messageText);

        await emailjs.send(emailjsCfg.serviceId, emailjsCfg.templateId, {
            to_email: emailjsCfg.toEmail,
            to_name: 'Nexus Hub Team',
            from_name: conv.visitor_name,
            from_email: conv.visitor_email,
            reply_to: conv.visitor_email,
            subject: `[${ref}] ${conv.topic} — ${conv.visitor_name}`,
            message: plainText,
            html_message: htmlContent,
            topic: conv.topic,
            conversation_id: conv.id,
            inquiry_date: now
        });
    }

    function subscribeRealtime(convId) {
        unsubscribeRealtime();
        if (!supabase) {
            state.pollTimer = setInterval(() => loadMessages(convId), 4000);
            return;
        }

        realtimeChannel = supabase
            .channel(`conv-${convId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: T.messages,
                filter: `conversation_id=eq.${convId}`
            }, (payload) => {
                const m = payload.new;
                if (m.sender === 'admin' || m.sender === 'bot') {
                    const exists = state.messages.some(x => x.id === m.id);
                    if (!exists) {
                        state.messages.push(m);
                        appendMessageEl(m.sender, m.content, m.created_at);
                        if (m.sender === 'admin' && !widget.classList.contains('open')) {
                            updateUnreadBadge();
                        }
                    }
                }
            })
            .subscribe();
    }

    function unsubscribeRealtime() {
        if (realtimeChannel) {
            supabase.removeChannel(realtimeChannel);
            realtimeChannel = null;
        }
        if (state.pollTimer) {
            clearInterval(state.pollTimer);
            state.pollTimer = null;
        }
    }

    // Init
    supabase = initSupabase();

    const emailScript = document.createElement('script');
    emailScript.src = 'https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js';
    emailScript.onload = () => {
        emailjs.init(emailjsCfg.publicKey);
        emailjsReady = true;
    };
    document.body.appendChild(emailScript);

    launcher.addEventListener('click', toggleChat);
    document.getElementById('chat-close').addEventListener('click', closeChat);
    document.getElementById('chat-close-thread').addEventListener('click', closeChat);
    document.getElementById('chat-back-btn').addEventListener('click', () => {
        unsubscribeRealtime();
        state.activeConversationId = null;
        state.onboarding = null;
        loadConversationList();
        showView('list');
    });
    document.getElementById('chat-new-btn').addEventListener('click', startOnboarding);
    document.getElementById('chat-resolve-btn').addEventListener('click', closeConversation);
    sendBtn.type = 'button';
    sendBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        sendThreadMessage();
    });
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendThreadMessage();
        }
    });

    document.querySelectorAll('.open-chat').forEach(el => {
        el.addEventListener('click', (e) => { e.preventDefault(); openChat(); });
    });

    loadConversationList();
    window.openChat = openChat;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatWidget);
} else {
    initChatWidget();
}
