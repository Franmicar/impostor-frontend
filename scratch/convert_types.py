import os
from PIL import Image

brain_dir = r"C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3"
target_dir = r"c:\Users\dj_ra\OneDrive\Documentos\Proyectos\impostor-words\impostor-frontend\public\images\types"

# Mappings based on our analysis:
# media__1779714260761.jpg -> question.png (Question marks ¿ and ?)
# media__1779714260781.jpg -> word.png (ABC Chalkboard)
# media__1779714301352.jpg -> draw.png (Color palette and paintbrush)
mappings = {
    "media__1779714260761.jpg": "question.png",
    "media__1779714260781.jpg": "word.png",
    "media__1779714301352.jpg": "draw.png"
}

os.makedirs(target_dir, exist_ok=True)

for src_name, dest_name in mappings.items():
    src_path = os.path.join(brain_dir, src_name)
    dest_path = os.path.join(target_dir, dest_name)
    
    if not os.path.exists(src_path):
        print(f"Error: Source file {src_path} does not exist!")
        continue
        
    try:
        with Image.open(src_path) as img:
            img.save(dest_path, "PNG")
            print(f"Converted {src_name} -> {dest_name} and saved to {dest_path}")
    except Exception as e:
        print(f"Error converting {src_name}: {e}")
