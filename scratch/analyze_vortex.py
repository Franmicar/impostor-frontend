import os
from PIL import Image

brain_dir = r"C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3"
files = [
    "media__1779720765063.jpg",
    "media__1779720765139.jpg"
]

for filename in files:
    filepath = os.path.join(brain_dir, filename)
    if not os.path.exists(filepath):
        continue
    
    img = Image.open(filepath)
    width, height = img.size
    print(f"\nAnalyzing vertical profile of {filename}:")
    
    # Top 30% of the image
    top_box = (0, 0, width, int(height * 0.3))
    top_crop = img.crop(top_box)
    top_data = top_crop.getdata()
    top_sum = sum(sum(p) for p in top_data) / (len(top_data) * 3)
    
    # Bottom 30% of the image
    bot_box = (0, int(height * 0.7), width, height)
    bot_crop = img.crop(bot_box)
    bot_data = bot_crop.getdata()
    bot_sum = sum(sum(p) for p in bot_data) / (len(bot_data) * 3)
    
    print(f"  Top 30% Average Intensity: {top_sum:.2f}")
    print(f"  Bottom 30% Average Intensity: {bot_sum:.2f}")
    print(f"  Ratio Top/Bottom: {top_sum / bot_sum:.2f}")
