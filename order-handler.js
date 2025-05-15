class OrderHandler {
  constructor() {
    this.apiUrl = '/api/send-notification';
    this.form = document.getElementById('orderForm');
    this.init();
  }

  init() {
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(this.form);
    const discord = formData.get('discord');
    
    // Récupération des quantités
    const items = {
      banner: parseInt(formData.get('banner') || 0),
      logo: parseInt(formData.get('logo') || 0),
      pack: parseInt(formData.get('pack') || 0)
    };

    // Vérification qu'au moins un article est sélectionné
    if (Object.values(items).every(qty => qty === 0)) {
      alert('Veuillez sélectionner au moins un article.');
      return;
    }

    // Affichage du loader
    const submitBtn = this.form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traitement...';

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderData: {
            discord: discord,
            items: items,
            date: new Date().toISOString()
          }
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Redirection vers la page de remerciement
        window.location.href = '/merci';
      } else {
        throw new Error(result.error || 'Erreur lors de l\'envoi de la commande');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue. Veuillez réessayer ou nous contacter.');
    } finally {
      // Réinitialisation du bouton
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
}

// Initialisation du gestionnaire de commande
document.addEventListener('DOMContentLoaded', () => {
  new OrderHandler();
});
