import os
from PIL import Image

brain_dir = r"C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3"
types_dir = r"c:\Users\dj_ra\OneDrive\Documentos\Proyectos\impostor-words\impostor-frontend\public\images\types"

# Mappings based on our analysis:
# media__1779718050655.jpg -> word.png (Chalkboard ABC)
# media__1779718050647.jpg -> draw.png (Palette and paintbrush)
mappings = {
    "media__1779718050655.jpg": os.path.join(types_dir, "word.png"),
    "media__1779718050647.jpg": os.path.join(types_dir, "draw.png")
}

for src_name, dest_path in mappings.items():
    src_path = os.path.join(brain_dir, src_name)
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    
    if not os.path.exists(src_path):
        print(f"Error: Source file {src_path} does not exist!")
        continue
        
    try:
        with Image.open(src_path) as img:
            img.save(dest_path, "PNG")
            print(f"Converted {src_name} -> {dest_path}")
    except Exception as e:
        print(f"Error converting {src_name}: {e}")
