#!/usr/bin/env python3
"""
Build the static map for /location.

WHY A COMMITTED PNG RATHER THAN AN EMBED.

The location page had no map on it at all: two buttons that sent the guest off to
Google and a Plus Code. For a property whose recorded problem is that guests
could not find the gate at night and whose map pin was once wrong by 9.3
kilometres, you could not see where the apartments were without leaving the site.

The obvious fix is an interactive embed and it is the wrong one here. An embed
means a third-party iframe, a few hundred kilobytes of JavaScript, a consent
question the site does not currently have to ask and a blank grey box on a weak
Lusaka connection. A guest looking at a location page wants to see roughly where
the place is; the two Maps buttons beside it already handle "take me there".

So the map is fetched once, here, stitched into a PNG and committed to the repo
like any other photograph. It costs one image request, needs no key, no script
and no cookie banner and it works offline once cached.

RUN IT when the coordinates in src/lib/content.ts change:

    python scripts/build-static-map.py

Tiles come from OpenStreetMap, whose licence requires the attribution that the
page renders under the image. A handful of tiles fetched by hand once is within
their usage policy; do not put this in a loop.
"""

from __future__ import annotations

import io
import math
import sys
import time
from pathlib import Path

try:
    import requests
    from PIL import Image, ImageDraw
except ImportError:  # pragma: no cover
    sys.exit("Needs Pillow and requests:  pip install pillow requests")

# Must match `business.coords` in src/lib/content.ts.
LAT = -15.4640271
LON = 28.2024538

ZOOM = 15    # street level: the compound and the roads around it
TILE = 256
OUT_W, OUT_H = 768, 512   # 3:2, matching the other figures on the page

# Tiles are fetched with a ring of margin and the output is then cropped to a
# window centred exactly on the property. Snapping the canvas to whole tiles
# instead put the pin wherever the fractional part of the coordinate happened to
# fall, which on the first run was half off the bottom edge.
MARGIN_TILES = 1

OUT = Path(__file__).resolve().parent.parent / "public" / "map" / "makeni-road.png"

USER_AGENT = "dunslim-apartments-website/1.0 (static map build script; one-off)"

# Deep Navy and Soft Brass, from the brand guidelines.
NAVY = (15, 34, 52)
BRASS = (178, 138, 74)


def deg_to_tile(lat: float, lon: float, zoom: int) -> tuple[float, float]:
    """Fractional tile coordinates, so the pin can land on the right pixel."""
    n = 2.0**zoom
    x = (lon + 180.0) / 360.0 * n
    rad = math.radians(lat)
    y = (1.0 - math.asinh(math.tan(rad)) / math.pi) / 2.0 * n
    return x, y


def main() -> None:
    fx, fy = deg_to_tile(LAT, LON, ZOOM)

    # Enough tiles to cover the output window plus a ring of margin all round.
    cols = math.ceil(OUT_W / TILE) + 2 * MARGIN_TILES
    rows = math.ceil(OUT_H / TILE) + 2 * MARGIN_TILES
    x0 = math.floor(fx) - cols // 2
    y0 = math.floor(fy) - rows // 2

    canvas = Image.new("RGB", (cols * TILE, rows * TILE), (233, 229, 220))
    session = requests.Session()
    session.headers["User-Agent"] = USER_AGENT

    for dx in range(cols):
        for dy in range(rows):
            url = f"https://tile.openstreetmap.org/{ZOOM}/{x0 + dx}/{y0 + dy}.png"
            res = session.get(url, timeout=30)
            res.raise_for_status()
            tile = Image.open(io.BytesIO(res.content)).convert("RGB")
            canvas.paste(tile, (dx * TILE, dy * TILE))
            print(f"  {url}")
            time.sleep(0.4)  # polite and there are only six of them

    # Crop a window centred on the property, then draw the pin dead centre of it.
    cx = (fx - x0) * TILE
    cy = (fy - y0) * TILE
    left = round(cx - OUT_W / 2)
    top = round(cy - OUT_H / 2)
    canvas = canvas.crop((left, top, left + OUT_W, top + OUT_H))

    px, py = OUT_W // 2, OUT_H // 2

    draw = ImageDraw.Draw(canvas, "RGBA")

    # A ring rather than a teardrop: the pin is a mark on a map, not an icon.
    for radius, colour, width in ((26, (*NAVY, 60), 0), (15, (*BRASS, 255), 3)):
        box = (px - radius, py - radius, px + radius, py + radius)
        if width:
            draw.ellipse(box, outline=colour, width=width)
        else:
            draw.ellipse(box, fill=colour)
    draw.ellipse((px - 5, py - 5, px + 5, py + 5), fill=(*NAVY, 255))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(OUT, "PNG", optimize=True)

    kb = OUT.stat().st_size / 1024
    print(f"\nWrote {OUT.relative_to(OUT.parents[2])}  {canvas.width}x{canvas.height}  {kb:.0f}KB")
    print("Attribution is rendered on the page. Do not remove it.")


if __name__ == "__main__":
    main()
