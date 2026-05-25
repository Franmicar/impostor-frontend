import os
from PIL import Image

brain_dir = r"C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3"
files = [
    "media__1779718968711.jpg",
    "media__1779718968720.jpg",
    "media__1779718968727.jpg",
    "media__1779718968733.jpg",
    "media__1779718968735.jpg"
]

for filename in files:
    filepath = os.path.join(brain_dir, filename)
    if not os.path.exists(filepath):
        print(f"{filename} does not exist!")
        continue
    
    img = Image.open(filepath)
    width, height = img.size
    print(f"\nAnalyzing {filename}: Size = {width}x{height}")
    
    # Analyze center average color
    center_box = (int(width * 0.4), int(height * 0.4), int(width * 0.6), int(height * 0.6))
    center_crop = img.crop(center_box)
    center_data = center_crop.getdata()
    center_r = sum(p[0] for p in center_data) / len(center_data)
    center_g = sum(p[1] for p in center_data) / len(center_data)
    center_b = sum(p[2] for p in center_data) / len(center_data)
    print(f"  Center Average RGB: R={center_r:.2f}, G={center_g:.2f}, B={center_b:.2f}")

    # Analyze left half vs right half
    left_box = (0, 0, width // 2, height)
    left_crop = img.crop(left_box)
    left_data = left_crop.getdata()
    left_r = sum(p[0] for p in left_data) / len(left_data)
    left_g = sum(p[1] for p in left_data) / len(left_data)
    left_b = sum(p[2] for p in left_data) / len(left_data)
    
    right_box = (width // 2, 0, width, height)
    right_crop = img.crop(right_box)
    right_data = right_crop.getdata()
    right_r = sum(p[0] for p in right_data) / len(right_data)
    right_g = sum(p[1] for p in right_data) / len(right_data)
    right_b = sum(p[2] for p in right_data) / len(right_data)
    
    print(f"  Left Half Average RGB: R={left_r:.2f}, G={left_g:.2f}, B={left_b:.2f}")
    print(f"  Right Half Average RGB: R={right_r:.2f}, G={right_g:.2f}, B={right_b:.2f}")
