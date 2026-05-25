import os
from PIL import Image

# Mapping of uploaded temp images to target packages in public/images/packages/
mapping = {
    r"C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3\media__1779726044115.jpg": "profesiones.png",
    r"C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3\media__1779726044121.jpg": "musica.png",
    r"C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3\media__1779726044129.jpg": "videojuegos.png",
    r"C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3\media__1779726044136.jpg": "peliculas_culto.png"
}

target_dir = r"c:\Users\dj_ra\OneDrive\Documentos\Proyectos\impostor-words\impostor-frontend\public\images\packages"

print("--- Starting Conversion of Uploaded Neon Packages (Batch 4) ---")

for src_path, target_filename in mapping.items():
    if not os.path.exists(src_path):
        print(f"Error: Source image not found at {src_path}")
        continue
        
    dest_path = os.path.join(target_dir, target_filename)
    
    try:
        with Image.open(src_path) as img:
            width, height = img.size
            print(f"Processing {os.path.basename(src_path)} -> {target_filename} (Original: {width}x{height})")
            
            # Center crop to 1:1
            min_dim = min(width, height)
            left = (width - min_dim) // 2
            top = (height - min_dim) // 2
            right = left + min_dim
            bottom = top + min_dim
            cropped = img.crop((left, top, right, bottom))
            
            # Resize to exactly 256x256 px
            resized = cropped.resize((256, 256), Image.Resampling.LANCZOS)
            
            # Save as PNG with optimization
            resized.save(dest_path, "PNG", optimize=True)
            new_size = os.path.getsize(dest_path)
            print(f"  Saved to {dest_path} ({new_size / 1024:.1f} KB)")
            
    except Exception as e:
        print(f"  Error processing {src_path}: {e}")

print("--- Finished Conversion ---")
