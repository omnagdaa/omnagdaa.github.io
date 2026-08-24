#!/usr/bin/env python3
"""Render static/og-card.png, the 1200x630 social preview card.

Reuses the site's ASCII frames and palette so a shared link looks like the
site it points at. Regenerate with ./site ogcard after changing the name,
headline, or palette.
"""
import json
import pathlib
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "static" / "og-card.png"
FRAMES = ROOT / "assets" / "ascii" / "frames.json"

W, H = 1200, 630
BG = (11, 15, 20)          # --p-bg dark
FG = (233, 238, 243)       # --p-text dark
ACCENT = (94, 234, 212)    # --p-accent dark
FAINT = (123, 139, 153)    # --p-text-faint dark
ASCII_ALPHA = 38           # ~15%: higher than the site's 10%, since the card
                           # is viewed small and briefly, not read against.

NAME = "Om Nagda"
HEADLINE = "Security Engineer & DevOps"
TAGLINE = "memory forensics  ·  mobile security  ·  tooling  ·  infrastructure"
URL = "omnagdaa.github.io"


def font(size, bold=False):
    stem = "JetBrainsMonoNerdFontMono"
    for name in (f"{stem}-{'Bold' if bold else 'Regular'}.ttf",
                 f"NotoSansMono-{'Bold' if bold else 'Regular'}.ttf"):
        p = pathlib.Path("/usr/share/fonts/TTF") / name
        if p.exists():
            return ImageFont.truetype(str(p), size)
    for p in pathlib.Path("/usr/share/fonts").rglob("*Mono*.ttf"):
        return ImageFont.truetype(str(p), size)
    return ImageFont.load_default()


def ascii_layer():
    """The densest frame, drawn faintly across the whole card."""
    if not FRAMES.exists():
        return None
    data = json.loads(FRAMES.read_text())
    frames = data["frames"] if isinstance(data, dict) else data
    if not frames:
        return None
    # Densest = most non-space glyphs, matching the 'rest' frame the site holds.
    art = max(frames, key=lambda f: sum(c != " " for c in "".join(f)))
    if isinstance(art, str):
        art = art.split("\n")

    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    f = font(13)
    lh = H / max(len(art), 1)
    for i, row in enumerate(art):
        d.text((0, i * lh), row, font=f, fill=(*ACCENT, ASCII_ALPHA))
    return layer


def main():
    img = Image.new("RGB", (W, H), BG)
    layer = ascii_layer()
    if layer is not None:
        img = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")
    # Scrim: the ASCII is dense enough on the left to fight the tagline, so
    # fade the background back toward BG under the text block. Left ~62% is
    # fully scrimmed, then it ramps out so the art still reads on the right.
    scrim = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(scrim)
    for col in range(W):
        t = col / W
        a = 216 if t < 0.50 else max(0, int(216 * (1 - (t - 0.50) / 0.36)))
        sd.line([(col, 0), (col, H)], fill=(*BG, a))
    img = Image.alpha_composite(img.convert("RGBA"), scrim).convert("RGB")

    d = ImageDraw.Draw(img)

    x, y = 84, 190
    d.text((x, y - 54), "$ whoami", font=font(26), fill=ACCENT)
    d.text((x, y), NAME, font=font(92, bold=True), fill=FG)
    d.text((x, y + 118), HEADLINE, font=font(38), fill=ACCENT)
    d.text((x, y + 186), TAGLINE, font=font(22), fill=FAINT)

    # Accent rule anchoring the block, and the URL bottom-right.
    d.rectangle([x, y + 250, x + 148, y + 253], fill=ACCENT)
    f = font(22)
    d.text((W - 84 - d.textlength(URL, font=f), H - 76), URL, font=f, fill=FAINT)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, "PNG", optimize=True)
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    sys.exit(main())
