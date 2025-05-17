// Configuration de base
const prices = {
    banner: 2,
    logo: 1.5,
    pack: 3
};

// Initialisation des composants
function initializeComponents() {
    // Gestion des quantités
    document.querySelectorAll('.qty-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const input = this.parentElement.querySelector('.qty-input');
            const action = this.dataset.action;
            let value = parseInt(input.value) || 0;
            
            if (action === 'increase') value++;
            else if (action === 'decrease' && value > 0) value--;
            
            input.value = value;
            updateOrderSummary();
        });
    });

    // Scroll smooth
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

// Gestion des commandes
class OrderHandler {
    constructor() {
        this.init();
    }

    init() {
        const validateBtn = document.getElementById('validate-order');
        if (validateBtn) {
            validateBtn.addEventListener('click', (e) => this.handleSubmit(e));
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = this.getFormData();
        if (!this.validateOrder(formData)) return;

        try {
            this.saveOrderLocally(formData);
            console.log('Commande validée, redirection...');
            window.location.href = './paiement.html';
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la validation de la commande');
        }
    }

    getFormData() {
        return {
            discord: document.getElementById('discord').value,
            email: document.getElementById('email').value,
            items: {
                banner: parseInt(document.getElementById('banner-qty').value) || 0,
                logo: parseInt(document.getElementById('logo-qty').value) || 0,
                pack: parseInt(document.getElementById('pack-qty').value) || 0
            }
        };
    }

    validateOrder(data) {
        if (Object.values(data.items).every(qty => qty === 0)) {
            alert('Sélectionnez au moins un article');
            return false;
        }
        if (!data.discord || !data.email) {
            alert('Tous les champs sont requis');
            return false;
        }
        return true;
    }

    saveOrderLocally(data) {
        const total = (data.items.banner * prices.banner) + 
                     (data.items.logo * prices.logo) + 
                     (data.items.pack * prices.pack);

        Object.entries(data).forEach(([key, value]) => {
            localStorage.setItem(`client${key.charAt(0).toUpperCase() + key.slice(1)}`, 
                               typeof value === 'object' ? JSON.stringify(value) : value);
        });
        localStorage.setItem('orderAmount', total.toFixed(2));
    }
}

// Mise à jour du récapitulatif
function updateOrderSummary() {
    const quantities = {
        banner: parseInt(document.getElementById('banner-qty').value) || 0,
        logo: parseInt(document.getElementById('logo-qty').value) || 0,
        pack: parseInt(document.getElementById('pack-qty').value) || 0
    };

    const total = Object.entries(quantities).reduce((sum, [type, qty]) => 
        sum + (qty * prices[type]), 0);

    document.getElementById('order-total').textContent = total.toFixed(2) + '€';
    
    Object.entries(quantities).forEach(([type, qty]) => {
        localStorage.setItem(`${type}Qty`, qty.toString());
    });
    localStorage.setItem('orderAmount', total.toFixed(2));
}

// Initialisation avec un console.log pour debug
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initialisation...');
    initializeComponents();
    const handler = new OrderHandler();
    console.log('Handler initialisé');
});

document.getElementById('validate-order').addEventListener('click', function() {
    const discord = document.getElementById('discord').value;
    const email = document.getElementById('email').value;
    
    // Vérifier si les champs obligatoires sont remplis
    if (!discord || !email) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }

    // Vérifier si au moins un service est sélectionné
    const bannerQty = parseInt(document.getElementById('banner-qty').value) || 0;
    const logoQty = parseInt(document.getElementById('logo-qty').value) || 0;
    const packQty = parseInt(document.getElementById('pack-qty').value) || 0;

    if (bannerQty === 0 && logoQty === 0 && packQty === 0) {
        alert('Veuillez sélectionner au moins un service');
        return;
    }

    // Sauvegarder les données dans localStorage
    localStorage.setItem('orderDiscord', discord);
    localStorage.setItem('orderEmail', email);
    localStorage.setItem('bannerQty', bannerQty);
    localStorage.setItem('logoQty', logoQty);
    localStorage.setItem('packQty', packQty);
    localStorage.setItem('orderAmount', calculateTotal());

    // Rediriger vers la page de paiement
    window.location.href = 'paiement.html';
});
