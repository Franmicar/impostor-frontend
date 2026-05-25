from PIL import Image

img_path = r'C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3\neon_setup_mode_v5_1779705507619.png'
dest_path = r'C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3\neon_setup_mode_v5_cropped.png'

try:
    with Image.open(img_path) as img:
        w, h = img.size
        # Crop 25 pixels from all four sides to reduce margin
        crop_amount = 22
        cropped = img.crop((crop_amount, crop_amount, w - crop_amount, h - crop_amount))
        # Resize back to original resolution
        final_img = cropped.resize((w, h), Image.Resampling.LANCZOS)
        final_img.save(dest_path, format="PNG")
        print("Success: Image cropped and resized!")
except Exception as e:
    print(f"Error: {e}")
