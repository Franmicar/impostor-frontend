import re

with open('src/app/features/setup/setup.component.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the "i" SVG path with a straight "i"
old_svg_path = 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M12 8.25h.008v.008H12V8.25z'
new_svg_path = 'M12 11v5m0-8h.01'

text = text.replace(old_svg_path, new_svg_path)

# Update duration.png to turn_time.png only in the DRAW TIME block
# I'll just find the exact block and replace it.

old_block = """<!-- TIEMPO DE DIBUJO -->
              @if(gameType().id === 'draw') {
              <div class="flex items-center justify-between p-5 hover:bg-white/5 transition-colors last:rounded-b-2xl">
                <div class="flex items-center gap-3">
                  <img src="/images/setup/duration.png" alt="" class="w-12 h-12 object-contain scale-125 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">"""

new_block = """<!-- TIEMPO DE DIBUJO -->
              @if(gameType().id === 'draw') {
              <div class="flex items-center justify-between p-5 hover:bg-white/5 transition-colors last:rounded-b-2xl">
                <div class="flex items-center gap-3">
                  <img src="/images/setup/turn_time.png" alt="" class="w-12 h-12 object-contain scale-125 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">"""

text = text.replace(old_block, new_block)

# Sometimes shrink-0 is present
old_block_2 = """<!-- TIEMPO DE DIBUJO -->
              @if(gameType().id === 'draw') {
              <div class="flex items-center justify-between p-5 hover:bg-white/5 transition-colors last:rounded-b-2xl">
                <div class="flex items-center gap-3">
                  <img src="/images/setup/duration.png" alt="" class="w-12 h-12 shrink-0 object-contain scale-125 drop-[0_0_8px_rgba(255,255,255,0.2)]">"""

new_block_2 = """<!-- TIEMPO DE DIBUJO -->
              @if(gameType().id === 'draw') {
              <div class="flex items-center justify-between p-5 hover:bg-white/5 transition-colors last:rounded-b-2xl">
                <div class="flex items-center gap-3">
                  <img src="/images/setup/turn_time.png" alt="" class="w-12 h-12 shrink-0 object-contain scale-125 drop-[0_0_8px_rgba(255,255,255,0.2)]">"""

text = text.replace(old_block_2, new_block_2)

with open('src/app/features/setup/setup.component.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Done updating TS file.")
