from pathlib import Path
p = Path('result.html')
text = p.read_text(encoding='utf-8')
old = """          <!-- FILE INPUT -->
          <input
            type=\"file\"
            id=\"fileInput\"
            hidden
          />

        </label>


        <!-- TEXTAREA -->"""
new = """        <!-- TEXTAREA -->"""
if old not in text:
    raise SystemExit('Expected duplicate block not found')
text = text.replace(old, new, 1)
p.write_text(text, encoding='utf-8')
print('patched duplicate file input block')
