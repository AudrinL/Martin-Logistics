# -*- coding: utf-8 -*-
"""Cut the hero truck at full source resolution, plus a soft contact shadow.

The cutout is flood-filled inward from the border so the white bodywork
survives. The shadow is generated separately from the silhouette's footprint
so the truck has weight on the ground instead of floating.
"""
import os
from collections import deque

from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(os.path.dirname(ROOT), "Martin logistics Assets", "twyfod truck.png")
OUT = os.path.join(ROOT, "assets", "img")

TOL = 22

im = Image.open(SRC).convert("RGB")
w, h = im.size
px = im.load()

corners = [px[2, 2], px[w - 3, 2], px[2, h - 3], px[w - 3, h - 3]]
bg = tuple(sum(c[i] for c in corners) // 4 for i in range(3))

visited = bytearray(w * h)
q = deque()


def push(x, y):
    i = y * w + x
    if visited[i]:
        return
    c = px[x, y]
    if abs(c[0] - bg[0]) <= TOL and abs(c[1] - bg[1]) <= TOL and abs(c[2] - bg[2]) <= TOL:
        visited[i] = 1
        q.append((x, y))


for x in range(w):
    push(x, 0); push(x, h - 1)
for y in range(h):
    push(0, y); push(w - 1, y)

while q:
    x, y = q.popleft()
    if x > 0: push(x - 1, y)
    if x < w - 1: push(x + 1, y)
    if y > 0: push(x, y - 1)
    if y < h - 1: push(x, y + 1)

mask = Image.new("L", (w, h), 255)
mp = mask.load()
for y in range(h):
    row = y * w
    for x in range(w):
        if visited[row + x]:
            mp[x, y] = 0

mask = mask.filter(ImageFilter.GaussianBlur(0.7))
out = im.convert("RGBA")
out.putalpha(mask)
bbox = out.getbbox()
out = out.crop(bbox)
out.save(os.path.join(OUT, "hero-truck.png"))
print("hero-truck.png", out.size, os.path.getsize(os.path.join(OUT, "hero-truck.png")) // 1024, "KB")

out.save(os.path.join(OUT, "hero-truck.webp"), "WEBP", quality=92, method=6)
print("hero-truck.webp", os.path.getsize(os.path.join(OUT, "hero-truck.webp")) // 1024, "KB")

# ── contact shadow ─────────────────────────────────────────────────────────
# Take the lowest opaque pixel per column, then smear it into a soft pool.
tw, th = out.size
a = out.getchannel("A").load()
SH_H = max(60, th // 5)
shadow = Image.new("L", (tw, SH_H), 0)
sp = shadow.load()
for x in range(tw):
    lowest = None
    for y in range(th - 1, -1, -1):
        if a[x, y] > 60:
            lowest = y
            break
    if lowest is None:
        continue
    # Wheels sit near the bottom; only the last few percent casts contact.
    if lowest < th * 0.80:
        continue
    for k in range(SH_H):
        v = int(160 * (1 - k / SH_H) ** 2.1)
        if v > sp[x, k]:
            sp[x, k] = v

shadow = shadow.filter(ImageFilter.GaussianBlur(tw * 0.012))
sh = Image.new("RGBA", (tw, SH_H), (18, 18, 22, 0))
sh.putalpha(shadow)
sh.save(os.path.join(OUT, "hero-truck-shadow.webp"), "WEBP", quality=88, method=6)
print("hero-truck-shadow.webp", sh.size,
      os.path.getsize(os.path.join(OUT, "hero-truck-shadow.webp")) // 1024, "KB")
