import os
import glob

# translations
base_path = 'src/app/core/../public/i18n'
base_path = r'c:\Users\dj_ra\Documents\Proyectos\impostor-words\impostor-frontend\public\i18n'
for filepath in glob.glob(os.path.join(base_path, '*.json')):
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
    
    text = text.replace('1.0.0-beta', '1.1.0')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(text)

print("Versions updated in translations.")
