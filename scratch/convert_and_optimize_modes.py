import os
from PIL import Image

brain_dir = r"C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3"
modes_dir = r"c:\Users\dj_ra\OneDrive\Documentos\Proyectos\impostor-words\impostor-frontend\public\images\modes"

# Mappings based on our vertical and color analysis:
# media__1779720764960.jpg -> detective.png
# media__1779720765039.jpg -> infiltrator.png
# media__1779720765046.jpg -> team.png
# media__1779720765063.jpg -> fast.png
# media__1779720765139.jpg -> chaos.png
mappings = {
    "media__1779720764960.jpg": "detective.png",
    "media__1779720765039.jpg": "infiltrator.png",
    "media__1779720765046.jpg": "team.png",
    "media__1779720765063.jpg": "fast.png",
    "media__1779720765139.jpg": "chaos.png"
}

os.makedirs(modes_dir, exist_ok=True)

for src_name, dest_name in mappings.items():
    src_path = os.path.join(brain_dir, src_name)
    dest_path = os.path.join(modes_dir, dest_name)
    
    if not os.path.exists(src_path):
        print(f"Error: Source file {src_path} does not exist!")
        continue
        
    try:
        with Image.open(src_path) as img:
            width, height = img.size
            print(f"Processing {src_name} -> {dest_name} (Original: {width}x{height})")
            
            # Crop to square from center
            min_dim = min(width, height)
            left = (width - min_dim) // 2
            top = (height - min_dim) // 2
            right = left + min_dim
            bottom = top + min_dim
            
            cropped_img = img.crop((left, top, right, bottom))
            
            # Resize using Lanczos (high quality 256x256)
            resized_img = cropped_img.resize((256, 256), Image.Resampling.LANCZOS)
            
            # Save as PNG
            resized_img.save(dest_path, "PNG", optimize=True)
            new_size = os.path.getsize(dest_path)
            print(f"  Saved to {dest_path} ({new_size / 1024:.1f} KB)")
    except Exception as e:
        print(f"Error processing {src_name}: {e}")
