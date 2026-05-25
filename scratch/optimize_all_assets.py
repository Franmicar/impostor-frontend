import os
from PIL import Image

def optimize_image(filepath, target_size=256):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
        
    try:
        with Image.open(filepath) as img:
            width, height = img.size
            print(f"Optimizing {os.path.basename(filepath)} (Original: {width}x{height})")
            
            # Crop to square from center
            min_dim = min(width, height)
            left = (width - min_dim) // 2
            top = (height - min_dim) // 2
            right = left + min_dim
            bottom = top + min_dim
            
            cropped_img = img.crop((left, top, right, bottom))
            
            # Resize using Lanczos interpolation (high quality)
            resized_img = cropped_img.resize((target_size, target_size), Image.Resampling.LANCZOS)
            
            # Save back as PNG (overwriting)
            resized_img.save(filepath, "PNG", optimize=True)
            new_size = os.path.getsize(filepath)
            print(f"  -> Cropped & Resized to {target_size}x{target_size} (New size: {new_size / 1024:.1f} KB)")
    except Exception as e:
        print(f"Error optimizing {filepath}: {e}")

# Target paths
setup_dir = r"c:\Users\dj_ra\OneDrive\Documentos\Proyectos\impostor-words\impostor-frontend\public\images\setup"
types_dir = r"c:\Users\dj_ra\OneDrive\Documentos\Proyectos\impostor-words\impostor-frontend\public\images\types"

setup_files = [
    "mode.png", "type.png", "players.png", "impostors.png",
    "detectives.png", "hints.png", "duration.png", "turn_time.png", "package.png"
]

types_files = [
    "word.png", "question.png", "draw.png"
]

print("--- Optimizing Setup Icons (256x256) ---")
for f in setup_files:
    optimize_image(os.path.join(setup_dir, f), target_size=256)

print("\n--- Optimizing Type Icons (256x256) ---")
for f in types_files:
    optimize_image(os.path.join(types_dir, f), target_size=256)

# Also let's optimize default-avatar.png to 256x256
avatar_path = r"c:\Users\dj_ra\OneDrive\Documentos\Proyectos\impostor-words\impostor-frontend\public\images\default-avatar.png"
print("\n--- Optimizing Avatar Icon (256x256) ---")
optimize_image(avatar_path, target_size=256)
