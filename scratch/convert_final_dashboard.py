import os
from PIL import Image

def main():
    # 1. Convert and save setup.type (Game Type)
    src_type = r"C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3\media__1779713298651.jpg"
    dest_type = r"c:\Users\dj_ra\OneDrive\Documentos\Proyectos\impostor-words\impostor-frontend\public\images\setup\type.png"
    
    if os.path.exists(src_type):
        try:
            with Image.open(src_type) as img:
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                img.save(dest_type, 'PNG')
                print(f"Successfully converted and saved type image to {dest_type}")
        except Exception as e:
            print(f"Error converting type image: {e}")
    else:
        print(f"Error: Source type image not found at {src_type}")

    # 2. Convert and save setup.players (Players count)
    src_players = r"C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3\media__1779713362413.jpg"
    dest_players = r"c:\Users\dj_ra\OneDrive\Documentos\Proyectos\impostor-words\impostor-frontend\public\images\setup\players.png"
    
    if os.path.exists(src_players):
        try:
            with Image.open(src_players) as img:
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                img.save(dest_players, 'PNG')
                print(f"Successfully converted and saved players image to {dest_players}")
        except Exception as e:
            print(f"Error converting players image: {e}")
    else:
        print(f"Error: Source players image not found at {src_players}")

if __name__ == '__main__':
    main()
