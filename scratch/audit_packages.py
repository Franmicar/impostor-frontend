import os
from PIL import Image

packages_dir = r"c:\Users\dj_ra\OneDrive\Documentos\Proyectos\impostor-words\impostor-frontend\public\images\packages"
files = sorted([f for f in os.listdir(packages_dir) if f.endswith(".png")])

print("| Filename | Resolution | Aspect Ratio | Size (KB) | Perfect Square? |")
print("| :--- | :--- | :--- | :--- | :--- |")

for filename in files:
    filepath = os.path.join(packages_dir, filename)
    try:
        with Image.open(filepath) as img:
            width, height = img.size
            size_kb = os.path.getsize(filepath) / 1024
            is_square = "Yes" if width == height else "No"
            ratio = f"{width}:{height}"
            print(f"| `{filename}` | {width}x{height} | {ratio} | {size_kb:.1f} KB | {is_square} |")
    except Exception as e:
        print(f"| `{filename}` | Error | Error | Error | Error |")
