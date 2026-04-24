const fs = require('fs');
const path = require('path');
const i18nDir = 'c:/Users/dj_ra/OneDrive/Documentos/Proyectos/impostor-words/impostor-frontend/public/i18n';
const files = fs.readdirSync(i18nDir);
for (const file of files) {
  if (file.endsWith('.json')) {
    const filePath = path.join(i18nDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/"ADD_PLAYER": "\+ /g, '"ADD_PLAYER": "');
    fs.writeFileSync(filePath, content);
  }
}
