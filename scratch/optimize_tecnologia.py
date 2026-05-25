import os
from PIL import Image

filepath = r"c:\Users\dj_ra\OneDrive\Documentos\Proyectos\impostor-words\impostor-frontend\public\images\packages\nerd_tecnologia.png"

try:
    with Image.open(filepath) as img:
        width, height = img.size
        print(f"Optimizing nerd_tecnologia.png (Original: {width}x{height})")
        
        # Crop to square from center (it's already 1024x1024 but let's do it just in case)
        min_dim = min(width, height)
        left = (width - min_dim) // 2
        top = (height - min_dim) // 2
        right = left + min_dim
        bottom = top + min_dim
        cropped_img = img.crop((left, top, right, bottom))
        
        # Resize to 256x256
        resized_img = cropped_img.resize((256, 256), Image.Resampling.LANCZOS)
        
        # Save back
        resized_img.save(filepath, "PNG", optimize=True)
        new_size = os.path.getsize(filepath)
        print(f"  Optimized and saved to {filepath} ({new_size / 1024:.1f} KB)")
except Exception as e:
    print(f"Error: {e}")
