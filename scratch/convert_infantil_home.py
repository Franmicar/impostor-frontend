import os
from PIL import Image

src = r"C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3\infantil_home_girl_mask_1779723534081.png"
dst = r"C:\Users\dj_ra\OneDrive\Documentos\Proyectos\impostor-words\impostor-frontend\themes-source\infantil\home_impostor_mask.png"

try:
    with Image.open(src) as img:
        width, height = img.size
        print(f"Original size: {width}x{height}")
        
        # Ensure it's square from center
        min_dim = min(width, height)
        left = (width - min_dim) // 2
        top = (height - min_dim) // 2
        right = left + min_dim
        bottom = top + min_dim
        cropped = img.crop((left, top, right, bottom))
        
        # Keep 1024x1024 for home screen clarity, but optimized
        final_img = cropped.resize((1024, 1024), Image.Resampling.LANCZOS)
        
        # Save and optimize
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        final_img.save(dst, "PNG", optimize=True, compress_level=9)
        print(f"Success: Saved optimized image to {dst} ({os.path.getsize(dst) / 1024:.1f} KB)")
except Exception as e:
    print(f"Error: {e}")
