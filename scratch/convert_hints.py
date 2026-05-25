import os
from PIL import Image

def main():
    src_path = r"C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3\media__1779709936877.jpg"
    dest_path = r"c:\Users\dj_ra\OneDrive\Documentos\Proyectos\impostor-words\impostor-frontend\public\images\setup\hints.png"
    
    if not os.path.exists(src_path):
        print(f"Error: Source image not found at {src_path}")
        return
        
    try:
        with Image.open(src_path) as img:
            # Convert to RGB if it is in CMYK or another format
            if img.mode != 'RGB':
                img = img.convert('RGB')
            # Save as PNG
            img.save(dest_path, 'PNG')
            print(f"Successfully converted and saved image to {dest_path}")
    except Exception as e:
        print(f"Error converting image: {e}")

if __name__ == '__main__':
    main()
