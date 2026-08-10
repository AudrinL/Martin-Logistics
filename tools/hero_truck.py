# -*- coding: utf-8 -*-
"""Prepare the hero truck and its contact shadow.

The source is already a clean cutout with a real alpha channel, so the old
flood-fill/de-halo pass is gone — there is no background left to separate the
white bodywork from. All that remains is trim, resize, and derive the shadow
from the silhouette's footprint so the truck has weight on the road instead of
floating on it.
"""
import os

from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, "Martin logistics Assets", "HERO IMAGE.png")
OUT = os.path.join(ROOT, "public", "assets", "img")

# --truck-w tops out at 1120 CSS px, so this covers it on a 2x display without
# shipping the full 2.5k master to every visitor.
OUT_W = 1920

im = Image.open(SRC).convert("RGBA")
im = im.crop(im.getbbox())
if im.width > OUT_W:
    im = im.resize((OUT_W, round(im.height * OUT_W / im.width)), Image.LANCZOS)

dest = os.path.join(OUT, "hero-truck.webp")
im.save(dest, "WEBP", quality=90, method=6)
print("hero-truck.webp %dx%d  %d KB  (ratio %.4f)"
      % (im.width, im.height, os.path.getsize(dest) // 1024, im.height / im.width))

# ── contact shadow ─────────────────────────────────────────────────────────
# Take the lowest opaque pixel per column, then smear it into a soft pool.
# Only the bottom fifth of the silhouette casts contact, so the trailer body
# does not lay down a shadow the length of the whole vehicle.
tw, th = im.size
a = im.getchannel("A").load()
SH_H = max(60, th // 5)
shadow = Image.new("L", (tw, SH_H), 0)
sp = shadow.load()
for x in range(tw):
    lowest = None
    for y in range(th - 1, -1, -1):
        if a[x, y] > 60:
            lowest = y
            break
    if lowest is None or lowest < th * 0.80:
        continue
    for k in range(SH_H):
        v = int(170 * (1 - k / SH_H) ** 2.1)
        if v > sp[x, k]:
            sp[x, k] = v

shadow = shadow.filter(ImageFilter.GaussianBlur(tw * 0.010))
sh = Image.new("RGBA", (tw, SH_H), (16, 16, 20, 0))
sh.putalpha(shadow)
dest = os.path.join(OUT, "hero-truck-shadow.webp")
sh.save(dest, "WEBP", quality=88, method=6)
print("hero-truck-shadow.webp %dx%d  %d KB"
      % (sh.width, sh.height, os.path.getsize(dest) // 1024))
