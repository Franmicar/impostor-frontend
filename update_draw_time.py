import os
import json

base_path = r'c:\Users\dj_ra\Documents\Proyectos\impostor-words\impostor-frontend\public\i18n'

updates = {
    'es.json': {
        'INFO_DRAW_TIME_TITLE': 'Tiempo turno',
        'DRAW_TIME': 'Tiempo turno'
    },
    'en.json': {
        'INFO_DRAW_TIME_TITLE': 'Turn Time',
        'DRAW_TIME': 'Turn Time'
    },
    'ca.json': {
        'INFO_DRAW_TIME_TITLE': 'Temps del torn',
        'DRAW_TIME': 'Temps del torn'
    },
    'fr.json': {
        'INFO_DRAW_TIME_TITLE': 'Temps du tour',
        'DRAW_TIME': 'Temps du tour'
    }
}

for filename, changes in updates.items():
    filepath = os.path.join(base_path, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    for k, v in changes.items():
        if 'SETUP' in data and k in data['SETUP']:
            data['SETUP'][k] = v
        elif 'SETUP_PACKAGES' in data and k in data['SETUP_PACKAGES']:
            data['SETUP_PACKAGES'][k] = v
            
    # Also update DURATION_INFO if it says "duración turno" etc.
    for section in ['SETUP', 'SETUP_PACKAGES', 'RULES']:
        if section in data and 'DURATION_INFO' in data[section]:
            if filename == 'es.json':
                data[section]['DURATION_INFO'] = data[section]['DURATION_INFO'].replace('duración turno', 'tiempo turno')
            elif filename == 'en.json':
                data[section]['DURATION_INFO'] = data[section]['DURATION_INFO'].replace('turn duration', 'turn time')
            elif filename == 'ca.json':
                data[section]['DURATION_INFO'] = data[section]['DURATION_INFO'].replace('durada del torn', 'temps del torn')
            elif filename == 'fr.json':
                data[section]['DURATION_INFO'] = data[section]['DURATION_INFO'].replace('durée du tour', 'temps du tour')

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
        
print("Translations updated.")
