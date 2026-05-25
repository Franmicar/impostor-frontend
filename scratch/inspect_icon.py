from PIL import Image

img_path = 'public/assets/icon.png'
try:
    with Image.open(img_path) as img:
        print(f"Format: {img.format}")
        print(f"Size: {img.size}")
        print(f"Mode: {img.mode}")
        
        # Get corner pixel to inspect background color
        pixels = img.convert('RGB')
        w, h = img.size
        corners = [
            pixels.getpixel((0, 0)),
            pixels.getpixel((w - 1, 0)),
            pixels.getpixel((0, h - 1)),
            pixels.getpixel((w - 1, h - 1))
        ]
        print(f"Corner pixels: {corners}")
except Exception as e:
    print(f"Error: {e}")
