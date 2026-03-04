import re

with open('src/app/features/setup/setup.component.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Restore span to flex
text = text.replace('span class="font-semibold text-slate-200 leading-tight"', 'span class="font-semibold text-slate-200 flex items-center gap-2"')

# Restore button to flex
old_btn = 'class="w-5 h-5 rounded-full bg-secondary/20 inline-flex items-center justify-center border border-secondary/50 hover:bg-secondary/40 transition-colors pointer-events-auto shrink-0 align-middle ml-2 -mt-0.5"'
new_btn = 'class="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50 hover:bg-secondary/40 transition-colors pointer-events-auto shrink-0"'

text = text.replace(old_btn, new_btn)

# Shrink all selects
text = text.replace('<div class="relative w-48 shrink-0">', '<div class="relative w-[130px] shrink-0">')
text = text.replace('<div class="relative w-40 shrink-0">', '<div class="relative w-[130px] shrink-0">')

# Shrink paddings slightly inside selects to gracefully handle text like '10 Segundos'
text = text.replace(
    'px-4 py-3 flex items-center justify-between hover:bg-white/20 transition-all cursor-pointer',
    'px-3 py-3 flex items-center justify-between hover:bg-white/20 transition-all cursor-pointer'
)

# Text size for selects if needed (already text-sm)
text = text.replace(
    'class="text-sm font-medium text-slate-100 select-none"',
    'class="text-xs sm:text-sm font-medium text-slate-100 select-none truncate"'
)

with open('src/app/features/setup/setup.component.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Done parsing.")
