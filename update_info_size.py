import os

with open('src/app/features/setup/setup.component.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Make the wrapper slightly larger
old_btn = 'class="w-[26px] h-[26px] rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50 hover:bg-secondary/40 transition-colors pointer-events-auto shrink-0"'
new_btn = 'class="w-[30px] h-[30px] rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50 hover:bg-secondary/40 transition-colors pointer-events-auto shrink-0"'

# Make the svg inside it slightly larger
old_svg = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11v5m0-8h.01" /></svg>'
new_svg = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6 text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11v5m0-8h.01" /></svg>'

text = text.replace(old_btn, new_btn)
text = text.replace(old_svg, new_svg)

with open('src/app/features/setup/setup.component.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Icons resized successfully.")
