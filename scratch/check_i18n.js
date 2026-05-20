const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, '../public/i18n');
const files = fs.readdirSync(i18nDir).filter(f => f.endsWith('.json'));

const baselineFile = 'es.json'; // Usamos español como referencia
const baselinePath = path.join(i18nDir, baselineFile);
const baselineData = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));

// Función para aplanar el JSON y obtener una lista de claves completas (ej. "HOME.TITLE")
function flattenObj(obj, parent = '', res = {}) {
    for (let key in obj) {
        let propName = parent ? parent + '.' + key : key;
        if (typeof obj[key] == 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            flattenObj(obj[key], propName, res);
        } else {
            res[propName] = obj[key];
        }
    }
    return res;
}

const baselineFlat = flattenObj(baselineData);
const baselineKeys = Object.keys(baselineFlat);

const report = {};

files.forEach(file => {
    if (file === baselineFile) return;
    
    const filePath = path.join(i18nDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const flatData = flattenObj(data);
    const keys = Object.keys(flatData);
    
    const missingKeys = baselineKeys.filter(k => !keys.includes(k));
    const extraKeys = keys.filter(k => !baselineKeys.includes(k));
    const emptyValues = keys.filter(k => typeof flatData[k] === 'string' && flatData[k].trim() === '');
    
    report[file] = {
        missing: missingKeys,
        extra: extraKeys,
        empty: emptyValues,
        totalMissing: missingKeys.length,
        totalExtra: extraKeys.length,
        totalEmpty: emptyValues.length
    };
});

console.log(JSON.stringify(report, null, 2));
