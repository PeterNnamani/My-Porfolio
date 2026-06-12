(function () {
    const cfg = window.NEXUS_CONFIG || {};
    const T = cfg.tables || { conversations: 'nexus_hub_conversations', messages: 'nexus_hub_messages' };
    const T = cfg.tables || { conversations: 'nexus_hub_conversations', messages: 'nexus_hub_messages' };
    const loginEl = document.getElementById('admin-login');
    const appEl = document.getElementById('admin-app');
    const convListEl = document.getElementById('admin-conv-list');
    const messagesEl = document.getElementById('admin-messages');
    const placeholder = document.getElementById('admin-placeholder');
    const threadContent = document.getElementById('admin-thread-content');
    const replyInput = document.getElementById('admin-reply-input');

    let supabase = null;
    let activeId = null;
    let channel = null;

    const SESSION_KEY = 'nexus_admin_session';

    function initClient() {
        if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
            document.getElementById('admin-login-error').textContent =
                'Supabase not configured. Add keys to config.js and run supabase/schema.sql';
            return null;
        }
        return window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    }

    function isLoggedIn() {
        return sessionStorage.getItem(SESSION_KEY) === '1';
    }

    function showApp() {
        loginEl.classList.add('hidden');
        appEl.classList.remove('hidden');
        loadConversations();

        const params = new URLSearchParams(location.search);
        const convId = params.get('c');
        if (convId) openConversation(convId);
    }

    document.getElementById('admin-login-btn').addEventListener('click', () => {
        const pw = document.getElementById('admin-password').value;
        const err = document.getElementById('admin-login-error');
        if (pw === (cfg.adminPassword || 'nexus-admin-2026')) {
            sessionStorage.setItem(SESSION_KEY, '1');
            err.textContent = '';
            showApp();
        } else {
            err.textContent = 'Incorrect password';
        }
    });

    document.getElementById('admin-logout').addEventListener('click', () => {
        sessionStorage.removeItem(SESSION_KEY);
        location.reload();
    });

    async function loadConversations() {
        const { data } = await supabase
            .from(T.conversations)
            .select('*')
            .order('updated_at', { ascending: false });

        if (!data?.length) {
            convListEl.innerHTML = '<div class="admin-empty">No conversations yet</div>';
            return;
        }

        convListEl.innerHTML = data.map(c => `
            <button type="button" class="chat-conv-item ${c.status} ${c.id === activeId ? 'active' : ''}" data-id="${c.id}">
                <div class="chat-conv-icon ${c.status}"><i class="ri-message-2-line"></i></div>
                <div class="chat-conv-body">
                    <div class="chat-conv-top">
                        <strong>${esc(c.topic)}</strong>
                        <span>${fmt(c.updated_at)}</span>
                    </div>
                    <p>${esc(c.visitor_name)} · ${esc(c.visitor_email)}</p>
                    <span class="chat-conv-badge ${c.status}">${c.status === 'closed' ? 'Resolved' : 'Active'}</span>
                </div>
            </button>
        `).join('');

        convListEl.querySelectorAll('.chat-conv-item').forEach(btn => {
            btn.addEventListener('click', () => openConversation(btn.dataset.id));
        });
    }

    async function openConversation(id) {
        activeId = id;
        placeholder.classList.add('hidden');
        threadContent.classList.remove('hidden');
        threadContent.style.display = 'flex';

        const { data: conv } = await supabase.from(T.conversations).select('*').eq('id', id).single();
        if (!conv) return;

        document.getElementById('admin-thread-title').textContent = conv.topic;
        document.getElementById('admin-thread-meta').textContent =
            `${conv.visitor_name} <${conv.visitor_email}> · ${conv.status}`;

        await loadMessages(id);
        subscribe(id);
        loadConversations();
    }

    async function loadMessages(convId) {
        const { data } = await supabase
            .from(T.messages)
            .select('*')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: true });

        messagesEl.innerHTML = (data || []).map(m => `
            <div class="chat-msg ${m.sender === 'user' ? 'user' : 'bot'}">
                <div class="chat-msg-avatar"><i class="ri-${m.sender === 'user' ? 'user-3' : 'code-s-slash'}-line"></i></div>
                <div class="chat-msg-bubble">
                    ${m.sender === 'admin' ? '<span class="chat-admin-label">You</span>' : ''}
                    ${esc(m.content)}
                    <span class="chat-msg-time">${fmt(m.created_at)}</span>
                </div>
            </div>
        `).join('');
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    async function sendReply() {
        const text = replyInput.value.trim();
        if (!text || !activeId) return;

        await supabase.from(T.messages).insert({
            conversation_id: activeId,
            sender: 'admin',
            content: text
        });
        await supabase.from(T.conversations).update({
            updated_at: new Date().toISOString(),
            status: 'open'
        }).eq('id', activeId);

        replyInput.value = '';
        await loadMessages(activeId);
    }

    async function closeConv() {
        if (!activeId) return;
        await supabase.from(T.conversations).update({ status: 'closed' }).eq('id', activeId);
        await supabase.from(T.messages).insert({
            conversation_id: activeId,
            sender: 'bot',
            content: 'This conversation has been marked as resolved.'
        });
        loadConversations();
        openConversation(activeId);
    }

    function subscribe(convId) {
        if (channel) supabase.removeChannel(channel);
        channel = supabase
            .channel(`admin-${convId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: T.messages,
                filter: `conversation_id=eq.${convId}`
            }, () => loadMessages(convId))
            .subscribe();
    }

    function esc(t) {
        const d = document.createElement('div');
        d.textContent = t;
        return d.innerHTML;
    }

    function fmt(iso) {
        return new Date(iso).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    }

    document.getElementById('admin-send-reply').addEventListener('click', sendReply);
    document.getElementById('admin-close-conv').addEventListener('click', closeConv);
    replyInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); }
    });

    supabase = initClient();
    if (isLoggedIn() && supabase) showApp();
})();
