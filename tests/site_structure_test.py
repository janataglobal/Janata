from pathlib import Path

root = Path(__file__).resolve().parents[1]
required_files = [
    'index.html',
    'styles.css',
    'script.js',
    'privacy.html',
    'terms.html',
    'robots.txt',
    'sitemap.xml',
]
for rel in required_files:
    path = root / rel
    assert path.exists(), f'Missing {rel}'

html = (root / 'index.html').read_text(encoding='utf-8')
for text in [
    'Reliable Indian Supply.',
    'GI Binding Wire',
    'Request a Quote',
    'sales@janataglobal.com',
    'application/json',
    'Janata Global Exports',
]:
    assert text in html, f'Missing expected content: {text}'

print('site structure test passed')
