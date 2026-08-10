# -*- coding: utf-8 -*-
"""Prepare the hero frame sequence and the logo files for the web."""
import glob
import os
import shutil

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ASSETS = os.path.join(ROOT, "Martin logistics Assets")
IMG = os.path.join(ROOT, "public", "assets", "img")
SEQ = os.path.join(ROOT, "public", "assets", "seq")

# ── Hero frame sequence ────────────────────────────────────────────────────
# 300 source frames is more than scroll scrubbing needs. 120 frames at 1152
# wide is smooth under the wheel, and WebP roughly halves what JPEG costs on
# this footage (large soft sky gradients). Replaces the 12.5 MB mp4 outright.
TARGET_FRAMES = 120
OUT_W = 1152
QUALITY = 60

if os.path.isdir(SEQ):
    shutil.rmtree(SEQ)
os.makedirs(SEQ)

src = sorted(glob.glob(os.path.join(ASSETS, "hero video scroll", "*.jpg")))
kept = [src[round(i * (len(src) - 1) / (TARGET_FRAMES - 1))] for i in range(TARGET_FRAMES)]
total = 0
for i, f in enumerate(kept):
    im = Image.open(f).convert("RGB")
    if im.width > OUT_W:
        im = im.resize((OUT_W, round(im.height * OUT_W / im.width)), Image.LANCZOS)
    dest = os.path.join(SEQ, "f%03d.webp" % i)
    im.save(dest, "WEBP", quality=QUALITY, method=6)
    total += os.path.getsize(dest)

print("sequence: %d frames  %dx%d  %.1f MB  (avg %d KB)"
      % (len(kept), OUT_W, im.height, total / 1048576, total / len(kept) / 1024))

# ── Logos ──────────────────────────────────────────────────────────────────
# The site is dark throughout, so only the white lockup is emitted. The black
# one is still in the design assets — add it back here as "logo-dark" if a
# light-background surface ever needs it.
LOGOS = {
    "Martin logistics logo white truck perfect logo.png": "logo-light",
}

for srcname, base in LOGOS.items():
    p = os.path.join(ASSETS, srcname)
    im = Image.open(p).convert("RGBA")

    # Trim to the artwork so there is no baked-in padding to fight in CSS.
    bbox = im.getbbox()
    im = im.crop(bbox)

    full = im.copy()
    full.thumbnail((900, 900), Image.LANCZOS)
    full.save(os.path.join(IMG, base + ".png"))

    # The wordmark bar alone reads far better at nav size than the full
    # lockup does — find it by the red block and cut from there.
    px = im.load()
    w, h = im.size
    top = None
    for y in range(h - 1, -1, -1):
        red = sum(1 for x in range(0, w, 3)
                  if px[x, y][3] > 60 and px[x, y][0] > 130
                  and px[x, y][1] < 90 and px[x, y][2] < 90)
        if red > 6:
            top = y
        elif top is not None and y < top - 4:
            break
    if top is not None:
        # Walk down to the first fully-solid row: that is the bar proper,
        # below the truck's rear wheels which overlap its top edge.
        solid = top
        for y in range(top, h):
            opaque = sum(1 for x in range(0, w, 2) if px[x, y][3] > 200)
            if opaque > (w // 2) * 0.82:
                solid = y
                break
        bar = im.crop((0, solid, w, h))
        bar = bar.crop(bar.getbbox())
        bw = 760
        bar = bar.resize((bw, round(bar.height * bw / bar.width)), Image.LANCZOS)
        bar.save(os.path.join(IMG, base + "-word.png"))
        print("%-12s full=%s word=%s" % (base, full.size, bar.size))
    else:
        print("%-12s full=%s  (no red bar found)" % (base, full.size))
