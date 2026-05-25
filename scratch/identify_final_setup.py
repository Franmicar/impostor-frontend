import os
from PIL import Image

brain_dir = r"C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3"
files = [
    "media__1779719277272.jpg",
    "media__1779719277317.jpg",
    "media__1779719277327.jpg"
]

for filename in files:
    filepath = os.path.join(brain_dir, filename)
    if not os.path.exists(filepath):
        print(f"{filename} does not exist!")
        continue
    
    img = Image.open(filepath)
    width, height = img.size
    print(f"\nAnalyzing {filename}: Size = {width}x{height}")
    
    # Check center average RGB
    center_box = (int(width * 0.4), int(height * 0.4), int(width * 0.6), int(height * 0.6))
    center_crop = img.crop(center_box)
    center_data = center_crop.getdata()
    center_r = sum(p[0] for p in center_data) / len(center_data)
    center_g = sum(p[1] for p in center_data) / len(center_data)
    center_b = sum(p[2] for p in center_data) / len(center_data)
    print(f"  Center Average RGB: R={center_r:.2f}, G={center_g:.2f}, B={center_b:.2f}")
    
    # Check average color of top 10% vs bottom 10%
    # This helps distinguish lightbulb (which narrows at the bottom base) vs circular clock vs square chest.
