import re

with open('src/app/features/setup/setup.component.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('span class="font-semibold text-slate-200 flex items-center gap-2"', 'span class="font-semibold text-slate-200 leading-tight"')
text = text.replace('span class="font-semibold text-slate-200 flex items-center gap-2"', 'span class="font-semibold text-slate-200 leading-tight"') # just in case

old_btn = 'class="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50 hover:bg-secondary/40 transition-colors pointer-events-auto shrink-0"'
new_btn = 'class="w-5 h-5 rounded-full bg-secondary/20 inline-flex items-center justify-center border border-secondary/50 hover:bg-secondary/40 transition-colors pointer-events-auto shrink-0 align-middle ml-2 -mt-0.5"'

text = text.replace(old_btn, new_btn)

# Quitarle width al select de tiempo por turno si aún no se hizo
text = text.replace('<div class="relative w-48 shrink-0">', '<div class="relative w-40 shrink-0">')

# Añadir shrink-0 a las imagenes de iconos para que no se deformen en movil (ya lo tenían en algunos)
text = text.replace('class="w-12 h-12 object-contain scale-[1.15]', 'class="w-12 h-12 shrink-0 object-contain scale-[1.15]')
text = text.replace('class="w-12 h-12 rounded-xl object-cover', 'class="w-12 h-12 shrink-0 rounded-xl object-cover')
text = text.replace('class="w-12 h-12 object-contain scale-[1.3]', 'class="w-12 h-12 shrink-0 object-contain scale-[1.3]')
text = text.replace('class="w-12 h-12 object-contain drop-[0_0_8px_rgba(', 'class="w-12 h-12 shrink-0 object-contain drop-[0_0_8px_rgba(')
text = text.replace('class="w-12 h-12 object-contain drop-', 'class="w-12 h-12 shrink-0 object-contain drop-')

with open('src/app/features/setup/setup.component.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Done parsing.")
