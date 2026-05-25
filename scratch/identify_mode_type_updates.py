import os
from PIL import Image

brain_dir = r"C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3"
files = [
    "media__1779719682973.jpg",
    "media__1779719683048.jpg"
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

    # Check top half vs bottom half to see the structure of the question mark
    # In the gamepad + question mark image, the question mark curves at the top, and goes straight down to the bottom.
    # The control panel has faders at the bottom, dials and buttons at the top.
