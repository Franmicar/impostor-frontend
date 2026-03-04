import re

with open('src/app/features/setup/setup.component.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the modal i
modal_search = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 12" stroke-width="1.5" stroke="currentColor" class="w-4 h-[30px] text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5v6m0-9h.01" /></svg>'
modal_replace = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-10 h-10 text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M12 8.25h.008v.008H12V8.25z" /></svg>'

text = text.replace(modal_search, modal_replace)

# Replace the buttons i
button_search = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 12" stroke-width="1.5" stroke="currentColor" class="w-2.5 h-full pt-[2px] text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5v6m0-9h.01" /></svg>'
button_replace = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M12 8.25h.008v.008H12V8.25z" /></svg>'

text = text.replace(button_search, button_replace)

with open('src/app/features/setup/setup.component.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Replacement complete. Occurrences found for button: ", text.count(button_replace))
