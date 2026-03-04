import re

with open('src/app/features/setup/setup.component.ts', 'r', encoding='utf-8') as f:
    content = f.read()

small_svg = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3.5 h-3.5 text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M12 10.5v7m0-10h.01" /></svg>'
new_small_svg = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 12" stroke-width="1.5" stroke="currentColor" class="w-2.5 h-full pt-[2px] text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5v6m0-9h.01" /></svg>'

modal_svg = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-10 h-10 text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M12 10.5v7m0-10h.01" /></svg>'
new_modal_svg = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 12" stroke-width="1.5" stroke="currentColor" class="w-4 h-[30px] text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5v6m0-9h.01" /></svg>'

content = content.replace(small_svg, new_small_svg)
content = content.replace(modal_svg, new_modal_svg)

with open('src/app/features/setup/setup.component.ts', 'w', encoding='utf-8') as f:
    f.write(content)
