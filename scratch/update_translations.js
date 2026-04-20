const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, '../../public/i18n');
const files = fs.readdirSync(i18nDir).filter(f => f.endsWith('.json'));

const translations = {
    es: {
        PLAY: {
            CHANGE_WORD: "Cambiar palabra",
            CHANGE_WORD_TITLE: "Cambiar Palabra",
            CHANGE_WORD_DESC: "¿Seguro que quieres cambiar la palabra con la que estáis jugando?<br><br><strong>Esto reiniciará toda la ronda desde cero:</strong> Se asignará una nueva palabra, se volverán a repartir los roles de forma aleatoria, y todos tendrán que volver a ver su tarjeta desde el primer jugador.",
            CHANGE_WORD_CONFIRM: "SÍ, REINICIAR"
        },
        COMMON: {
            CANCEL: "Cancelar",
            LOADING: "Cargando..."
        }
    },
    en: {
        PLAY: {
            CHANGE_WORD: "Change word",
            CHANGE_WORD_TITLE: "Change Word",
            CHANGE_WORD_DESC: "Are you sure you want to change the word you are playing with?<br><br><strong>This will restart the entire round from scratch:</strong> A new word will be assigned, roles will be redistributed randomly, and everyone will have to see their card again starting from the first player.",
            CHANGE_WORD_CONFIRM: "YES, RESTART"
        },
        COMMON: {
            CANCEL: "Cancel",
            LOADING: "Loading..."
        }
    }
};

files.forEach(file => {
    const lang = file.replace('.json', '');
    const filePath = path.join(i18nDir, file);
    
    let data;
    try {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        console.error("Error reading " + file);
        return;
    }

    const updates = translations[lang] || translations.en; // fallback to English

    if (!data.PLAY) data.PLAY = {};
    Object.assign(data.PLAY, updates.PLAY);

    if (!data.COMMON) data.COMMON = {};
    Object.assign(data.COMMON, updates.COMMON);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
    console.log(`Updated ${file}`);
});
