
const handler = async (req, res) => {
  // Gérer les requêtes OPTIONS pour CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://fusionsgfx.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Méthode non autorisée',
      message: 'Seules les requêtes POST sont acceptées.'
    });
  }

  try {
    // Lire le corps de la requête
    let body = '';
    for await (const chunk of req) {
      body += chunk.toString();
    }

    const orderData = JSON.parse(body);

    // Validation des données
    if (!orderData || !orderData.discord || !orderData.items) {
      return res.status(400).json({ 
        error: 'Données manquantes',
        message: 'Données de commande incomplètes.'
      });
    }

    hook.setUsername('Fusions GFX - Nouvelle Commande');
    hook.setAvatar('https://cdn.discordapp.com/attachments/1361691433022521634/1369417064808452281/image.png?ex=681c7146&is=681b1fc6&hm=78211d687d47e61e3e64460bfcf0c3e32dd440f164264fa0525002e46a45497b&');

    // Création du message Discord
    const embed = new MessageBuilder()
      .setTitle('Nouvelle Commande Reçue')
      .setColor('#7289da')
      .setDescription(`**Nouvelle commande de ${orderData.discord}**`)
      .addField('Email', orderData.email || 'Non fourni', true)
      .addField('Date', new Date().toLocaleString('fr-FR'), true)
      .addField('Méthode de paiement', orderData.paymentMethod === 'paypal_friends' ? 'PayPal Amis & Famille' : 'Inconnue', true)
      .addField('Description', orderData.description || 'Aucune description fournie')
      .setFooter('Fusions GFX - Système de commande')
      .setTimestamp();

    // Ajouter les articles commandés
    if (orderData.items) {
      const itemsList = [];
      if (orderData.items.banner > 0) itemsList.push(`- ${orderData.items.banner} Bannière(s)`);
      if (orderData.items.logo > 0) itemsList.push(`- ${orderData.items.logo} Logo(s)`);
      if (orderData.items.pack > 0) itemsList.push(`- ${orderData.items.pack} Pack(s)`);
      
      if (itemsList.length > 0) {
        embed.addField('Articles commandés', itemsList.join('\n'));
      }
    }

    // Envoyer la notification
    await hook.send(embed);
    
    res.status(200).json({ 
      success: true, 
      message: 'Commande enregistrée avec succès' 
    });

  } catch (error) {
    console.error('Erreur lors du traitement de la commande:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors du traitement de votre commande.'
    });
  }
};

// Export pour Vercel
module.exports = handler;
