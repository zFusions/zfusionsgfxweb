// Détection des attaques par force brute
const rateLimit = new Map();
const MAX_REQUESTS = 10;
const TIME_WINDOW = 60 * 1000; // 1 minute

// Liste noire d'IPs (à utiliser avec précaution)
const blacklistedIPs = new Set();

/**
 * Vérifie si une IP n'a pas dépassé la limite de requêtes
 * @param {string} ip - Adresse IP du client
 * @returns {boolean} true si la requête est autorisée, false sinon
 */
const checkRateLimit = (ip) => {
  const now = Date.now();
  const requestTimestamps = rateLimit.get(ip) || [];
  
  // Supprimer les timestamps plus vieux que la fenêtre de temps
  const recentRequests = requestTimestamps.filter(timestamp => now - timestamp < TIME_WINDOW);
  
  // Vérifier si le nombre de requêtes dépasse la limite
  if (recentRequests.length >= MAX_REQUESTS) {
    return false; // Trop de requêtes
  }
  
  // Ajouter la nouvelle requête
  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);
  return true;
};

/**
 * Vérifie si une IP est blacklistée
 * @param {string} ip - Adresse IP à vérifier
 * @returns {boolean} true si l'IP est blacklistée, false sinon
 */
const isBlacklisted = (ip) => {
  return blacklistedIPs.has(ip);
};

/**
 * Ajoute une IP à la liste noire
 * @param {string} ip - Adresse IP à blacklister
 */
const blacklistIP = (ip) => {
  blacklistedIPs.add(ip);
  // Supprimer de la liste noire après 24h
  setTimeout(() => blacklistedIPs.delete(ip), 24 * 60 * 60 * 1000);
};

// Validation des entrées
const validateOrderData = (data) => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Données invalides' };
  }

  const { discord, items } = data;
  
  // Validation du tag Discord
  if (!discord || typeof discord !== 'string' || !/^[^#@:]{2,32}#\d{4}$/.test(discord)) {
    return { valid: false, error: 'Tag Discord invalide' };
  }
  
  // Validation des items
  if (!items || typeof items !== 'object') {
    return { valid: false, error: 'Articles manquants' };
  }
  
  // Vérification des quantités
  const validItems = ['banner', 'logo', 'pack'];
  for (const [item, quantity] of Object.entries(items)) {
    if (!validItems.includes(item) || !Number.isInteger(quantity) || quantity < 0 || quantity > 10) {
      return { valid: false, error: `Quantité invalide pour ${item}` };
    }
  }
  
  return { valid: true };
};

// Protection contre les injections XSS
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  return input;
};

// Vérification des en-têtes HTTP
const validateHeaders = (headers) => {
  // Vérifier l'en-tête Content-Type
  const contentType = headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return { valid: false, error: 'Content-Type must be application/json' };
  }
  
  // Vérifier l'origine de la requête (à adapter selon vos besoins)
  const origin = headers.get('origin');
  const allowedOrigins = [
    'https://votre-domaine.vercel.app',
    'http://localhost:3000'
  ];
  
  if (origin && !allowedOrigins.includes(origin)) {
    return { valid: false, error: 'Origin not allowed' };
  }
  
  return { valid: true };
};

// Détection des attaques par injection SQL (à utiliser avec les requêtes SQL si nécessaire)
const detectSQLInjection = (input) => {
  const sqlKeywords = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'UNION', 'OR 1=1',
    '--', ';', '/*', '*/', '@@', 'char', 'nchar', 'varchar', 'nvarchar',
    'alter', 'begin', 'cast', 'create', 'cursor', 'declare', 'delete',
    'drop', 'end', 'exec', 'execute', 'fetch', 'insert', 'kill', 'open',
    'select', 'sys', 'sysobjects', 'syscolumns', 'table', 'update', 'union'
  ];
  
  const inputUpper = input.toUpperCase();
  return sqlKeywords.some(keyword => 
    input.toUpperCase().includes(keyword)
  );
};

module.exports = {
  checkRateLimit,
  isBlacklisted,
  blacklistIP,
  validateOrderData,
  sanitizeInput,
  validateHeaders,
  detectSQLInjection
};
