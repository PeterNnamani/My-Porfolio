// Copy this file to config.js and fill in your values.
window.NEXUS_CONFIG = {
    supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
    supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',

    tables: {
        conversations: 'nexus_hub_conversations',
        messages: 'nexus_hub_messages'
    },

    tables: {
        conversations: 'nexus_hub_conversations',
        messages: 'nexus_hub_messages'
    },

    // Admin panel password (admin.html only — do not share publicly)
    adminPassword: 'change-this-password',

    // EmailJS — https://dashboard.emailjs.com
    // Template "To email" MUST be {{to_email}} (not a hardcoded address).
    // Account → Security → add your live domain (e.g. nexushublimited.com).
    emailjs: {
        publicKey: 'YOUR_PUBLIC_KEY',
        serviceId: 'YOUR_SERVICE_ID',
        templateId: 'YOUR_ADMIN_TEMPLATE_ID',
        adminTemplateId: 'YOUR_ADMIN_TEMPLATE_ID',  // optional; falls back to templateId
        visitorTemplateId: 'YOUR_VISITOR_TEMPLATE_ID', // optional; for admin replies to visitors
        toEmail: 'nexushub.officiel@yahoo.com'
    },

    // Your live site URL (for admin links in emails)
    siteUrl: 'https://your-domain.com'
};
