import os
from PIL import Image

brain_dir = r"C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3"
setup_dir = r"c:\Users\dj_ra\OneDrive\Documentos\Proyectos\impostor-words\impostor-frontend\public\images\setup"

# Mappings based on our analysis:
# media__1779718968735.jpg -> mode.png (Sliders/faders)
# media__1779718968733.jpg -> type.png (Gamepad + question mark)
# media__1779718968727.jpg -> players.png (Three silhouettes)
# media__1779718968720.jpg -> impostors.png (Oni mask)
# media__1779718968711.jpg -> detectives.png (Magnifying glass)
mappings = {
    "media__1779718968735.jpg": os.path.join(setup_dir, "mode.png"),
    "media__1779718968733.jpg": os.path.join(setup_dir, "type.png"),
    "media__1779718968727.jpg": os.path.join(setup_dir, "players.png"),
    "media__1779718968720.jpg": os.path.join(setup_dir, "impostors.png"),
    "media__1779718968711.jpg": os.path.join(setup_dir, "detectives.png")
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
