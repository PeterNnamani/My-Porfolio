// Supabase — run supabase/schema.sql in the SQL Editor first.
window.NEXUS_CONFIG = {
    supabaseUrl: 'https://mrmnzewqvguuulqtqclr.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ybW56ZXdxdmd1dXVscXRxY2xyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMDE0MzcsImV4cCI6MjA4OTY3NzQzN30.6Lh0lIOuEvpMZRTGnpZFSug4ZXJrgpL4oRMDcILGD_k',

    // Custom table names (won't conflict with your other tables)
    tables: {
        conversations: 'nexus_hub_conversations',
        messages: 'nexus_hub_messages'
    },

    adminPassword: 'nexus-admin-2026',

    emailjs: {
        publicKey: 'N3kN7OWGID6l2hxsI',
        serviceId: 'service_5c7dbcf',
        templateId: 'template_pi624hk',
        toEmail: 'nexushub.officiel@yahoo.com'
    },

    siteUrl: typeof window !== 'undefined' ? window.location.origin : ''
};
