import os
from PIL import Image

brain_dir = r"C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3"
files = [
    "media__1779718968733.jpg",
    "media__1779718968735.jpg"
]

for filename in files:
    filepath = os.path.join(brain_dir, filename)
    if not os.path.exists(filepath):
        continue
    
    img = Image.open(filepath)
    width, height = img.size
    print(f"\nAnalyzing vertical slices of {filename}:")
    
    # Top half (y from 0 to height // 2)
    top_box = (0, 0, width, height // 2)
    top_crop = img.crop(top_box)
    top_data = top_crop.getdata()
    top_r = sum(p[0] for p in top_data) / len(top_data)
    top_g = sum(p[1] for p in top_data) / len(top_data)
    top_b = sum(p[2] for p in top_data) / len(top_data)
    
    # Bottom half (y from height // 2 to height)
    bot_box = (0, height // 2, width, height)
    bot_crop = img.crop(bot_box)
    bot_data = bot_crop.getdata()
    bot_r = sum(p[0] for p in bot_data) / len(bot_data)
    bot_g = sum(p[1] for p in bot_data) / len(bot_data)
    bot_b = sum(p[2] for p in bot_data) / len(bot_data)
    
    print(f"  Top Half: R={top_r:.2f}, G={top_g:.2f}, B={top_b:.2f}")
    print(f"  Bottom Half: R={bot_r:.2f}, G={bot_g:.2f}, B={bot_b:.2f}")
