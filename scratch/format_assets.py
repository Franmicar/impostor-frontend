import os
import shutil
from PIL import Image

# 1. Create backups
os.makedirs('scratch/backups', exist_ok=True)
shutil.copy('public/assets/icon.png', 'scratch/backups/icon_backup.png')
shutil.copy('public/assets/splash.png', 'scratch/backups/splash_backup.png')
shutil.copy('public/favicon.png', 'scratch/backups/favicon_backup.png')
print("Backups created in scratch/backups/")

# 2. Process images
def process_image(src_path, dest_path, target_size):
    # Open the backup version so we don't read and write the same file pointer simultaneously
    backup_path = os.path.join('scratch/backups', os.path.basename(src_path).replace('.png', '_backup.png'))
    if not os.path.exists(backup_path):
        backup_path = src_path
        
    with Image.open(backup_path) as img:
        print(f"Processing {src_path}...")
        print(f"  Original Format: {img.format}, Size: {img.size}")
        
        # Resize using Lanczos resampling (highest quality)
        resized_img = img.resize(target_size, Image.Resampling.LANCZOS)
        
        # Save as PNG format
        resized_img.save(dest_path, format="PNG")
        print(f"  Saved to {dest_path} as true PNG with size {target_size}")

process_image('public/assets/icon.png', 'public/assets/icon.png', (1024, 1024))
process_image('public/assets/splash.png', 'public/assets/splash.png', (2048, 2048))
process_image('public/favicon.png', 'public/favicon.png', (32, 32))
print("Image formatting complete!")
