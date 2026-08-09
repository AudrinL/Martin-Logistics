# -*- coding: utf-8 -*-
"""Turn the supplied Africa map into a dot matrix + verify city placement.

The source jpg is cropped tight to the continent's bounding box, so pixel
position maps linearly onto Africa's geographic extent. Country borders are
white lines through the black silhouette, so sampling on a grid naturally
leaves gaps along the borders — the dot field keeps the country structure.
"""
import json
import os

from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(os.path.dirname(ROOT), "Martin logistics Assets", "africa map.jpg")

# Africa's geographic extent, matching the crop of the source image.
LON_W, LON_E = -17.53, 51.42
LAT_N, LAT_S = 37.35, -34.83

im = Image.open(SRC).convert("L")
W, H = im.size
px = im.load()

# Output coordinate space for the SVG/canvas overlay.
VB_W, VB_H = 1000, round(1000 * H / W)


def lonlat_to_vb(lon, lat):
    x = (lon - LON_W) / (LON_E - LON_W) * VB_W
    y = (LAT_N - lat) / (LAT_N - LAT_S) * VB_H
    return round(x, 1), round(y, 1)


STEP = 9          # px between samples in source space
THRESH = 105      # below this = inside the continent

dots = []
for gy in range(STEP // 2, H, STEP):
    for gx in range(STEP // 2, W, STEP):
        if px[gx, gy] < THRESH:
            dots.append([
                round(gx / W * VB_W, 1),
                round(gy / H * VB_H, 1),
            ])

CITIES = {
    "mombasa":  (39.67, -4.05),
    "dar":      (39.21, -6.79),
    "nairobi":  (36.82, -1.29),
    "kigali":   (30.06, -1.94),
    "goma":     (29.22, -1.68),
    "kampala":  (32.58, 0.35),
    "lubumbashi": (27.48, -11.66),
}
cities = {k: lonlat_to_vb(*v) for k, v in CITIES.items()}

out = {"viewBox": [VB_W, VB_H], "dots": dots, "cities": cities}
dest = os.path.join(ROOT, "assets", "africa-dots.json")
with open(dest, "w") as f:
    json.dump(out, f, separators=(",", ":"))

print("viewBox", VB_W, VB_H)
print("dots", len(dots))
print("json", os.path.getsize(dest) // 1024, "KB")
for k, v in cities.items():
    print("  ", k, v)

# --- visual check: draw the dots + city markers so placement can be eyeballed
chk = Image.new("RGB", (VB_W, VB_H), (11, 11, 12))
d = ImageDraw.Draw(chk)
for x, y in dots:
    d.ellipse([x - 1.6, y - 1.6, x + 1.6, y + 1.6], fill=(70, 70, 74))
for name, (x, y) in cities.items():
    d.ellipse([x - 6, y - 6, x + 6, y + 6], fill=(237, 216, 54))
    d.text((x + 10, y - 6), name.upper(), fill=(237, 216, 54))
chk.save(os.path.join(ROOT, "_mapcheck.png"))
print("wrote _mapcheck.png")
