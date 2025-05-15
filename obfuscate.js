const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

// Configuration de l'obfuscation
const obfuscationConfig = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 1,
  numbersToExpressions: true,
  simplify: true,
  stringArrayShuffle: true,
  splitStrings: true,
  stringArrayThreshold: 1,
  // Désactive le formatage pour rendre le code plus difficile à lire
  unicodeEscapeSequence: true
};

// Fonction pour obfusquer un fichier
function obfuscateFile(filePath) {
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    const obfuscated = JavaScriptObfuscator.obfuscate(code, obfuscationConfig);
    
    // Créer un dossier dist s'il n'existe pas
    const distDir = path.join(path.dirname(filePath), 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    // Sauvegarder le fichier obfusqué
    const outputPath = path.join(
      distDir, 
      path.basename(filePath, '.js') + '.min.js'
    );
    
    fs.writeFileSync(outputPath, obfuscated.getObfuscatedCode());
    console.log(`Fichier obfusqué: ${outputPath}`);
  } catch (error) {
    console.error(`Erreur lors de l'obfuscation de ${filePath}:`, error);
  }
}

// Objets à obfusquer
const filesToObfuscate = [
  'js/order-handler.js'
  // Ajoutez d'autres fichiers JS ici
];

// Exécution
filesToObfuscate.forEach(obfuscateFile);
