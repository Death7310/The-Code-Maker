"""Generate app icons (web + Android) from one design. Run: python3 scripts/make-icons.py"""
import os
from PIL import Image, ImageDraw, ImageFont

BG = (15, 20, 25)        # matches --term-bg
FG = (126, 226, 184)     # matches --term-cmd
FONT = '/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def draw(size, safe=1.0, rounded=True):
    """Dark tile with a green '>_' prompt. `safe` shrinks the glyph for maskable icons."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if rounded:
        d.rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * 0.22), fill=BG)
    else:
        d.rectangle([0, 0, size, size], fill=BG)
    font = ImageFont.truetype(FONT, int(size * 0.42 * safe))
    text = '>_'
    box = d.textbbox((0, 0), text, font=font)
    w, h = box[2] - box[0], box[3] - box[1]
    d.text(((size - w) / 2 - box[0], (size - h) / 2 - box[1]), text, font=font, fill=FG)
    return img


def save(img, path):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    img.save(full)


# Web / PWA
save(draw(512), 'icons/icon-512.png')
save(draw(192), 'icons/icon-192.png')
save(draw(512, safe=0.7, rounded=False), 'icons/maskable-512.png')
save(draw(180, rounded=False), 'icons/apple-touch-icon.png')
save(draw(64), 'icons/favicon.png')

# Android launcher icons (written only if the Capacitor Android project exists)
res = os.path.join(ROOT, 'android/app/src/main/res')
if os.path.isdir(res):
    sizes = {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}
    fg_sizes = {'mdpi': 108, 'hdpi': 162, 'xhdpi': 216, 'xxhdpi': 324, 'xxxhdpi': 432}
    for dpi, px in sizes.items():
        save(draw(px), f'android/app/src/main/res/mipmap-{dpi}/ic_launcher.png')
        save(draw(px), f'android/app/src/main/res/mipmap-{dpi}/ic_launcher_round.png')
        # Adaptive icon foreground: transparent background, glyph in the 66% safe zone.
        fg = Image.new('RGBA', (fg_sizes[dpi],) * 2, (0, 0, 0, 0))
        glyph = draw(fg_sizes[dpi], safe=0.6, rounded=False)
        # keep only the green glyph on transparency
        px_data = [(r, g, b, a) if (r, g, b) != BG else (0, 0, 0, 0) for (r, g, b, a) in (glyph.get_flattened_data() if hasattr(glyph, "get_flattened_data") else glyph.getdata())]
        fg.putdata(px_data)
        save(fg, f'android/app/src/main/res/mipmap-{dpi}/ic_launcher_foreground.png')
print('icons written')
