import os
from PIL import Image

brain_dir = r"C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3"
files = [
    "media__1779717616331.jpg",
    "media__1779717616334.jpg"
]

for filename in files:
    filepath = os.path.join(brain_dir, filename)
    if not os.path.exists(filepath):
        print(f"{filename} does not exist!")
        continue
    
    img = Image.open(filepath)
    width, height = img.size
    print(f"\nAnalyzing {filename}: Size = {width}x{height}")
    
    # Let's crop center to see average RGB
    center_box = (int(width * 0.4), int(height * 0.4), int(width * 0.6), int(height * 0.6))
    center_crop = img.crop(center_box)
    center_data = center_crop.getdata()
    center_r = sum(p[0] for p in center_data) / len(center_data)
    center_g = sum(p[1] for p in center_data) / len(center_data)
    center_b = sum(p[2] for p in center_data) / len(center_data)
    print(f"  Center Average RGB: R={center_r:.2f}, G={center_g:.2f}, B={center_b:.2f}")

    # Let's check color in top half vs bottom half to find where the hourglass neck is
    # Hourglass center is thin and might have pink/cyan glow, let's just see.
