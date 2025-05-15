module.exports = {
    // Configuration de base
    enabled: true,
    
    // Protection DDoS
    ddosProtection: {
        enabled: true,
        level: 'high', // high, medium, low
        ipWhitelist: [], // IP autorisées
        ipBlacklist: []  // IP bannies
    },
    
    // Protection SSL
    ssl: {
        enabled: true,
        mode: 'full', // full, strict
        hsts: {
            enabled: true,
            maxAge: 31536000, // 1 an
            includeSubdomains: true,
            preload: true
        }
    },
    
    // Protection contre les attaques
    security: {
        webApplicationFirewall: true,
        botFightMode: true,
        securityLevel: 'high', // high, medium, low
        ipGeolocation: true
    },
    
    // Performance
    performance: {
        minify: {
            html: true,
            css: true,
            javascript: true
        },
        autoMinify: true,
        imageOptimization: true
    }
};
