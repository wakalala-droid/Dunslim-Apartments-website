"""Bring the owner's photographs of the outside and the pool into public/photos.

Run after the files land in Downloads:

    python scripts/import-grounds-photos.py
    python scripts/build-photo-manifest.py

These arrived on 14 September 2026 over WhatsApp, which had already shrunk
them to 1080px wide. That is enough for the way they are used (half the width
of a laptop screen at most) but not for anything that runs edge to edge. If the
photographer's originals turn up, point SOURCE at them and rerun.

They are kept apart from import-residence-photos.py because they belong to no
one apartment: the pool and the grounds are shared by all three. Every key here
starts with `grounds-`, and that script leaves anything with that prefix alone.
"""

import os

from PIL import Image, ImageOps

SOURCE = r"C:\Users\User\Downloads"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PHOTOS = os.path.join(ROOT, "public", "photos")

LONG_EDGE = 2560
# Already compressed once by WhatsApp, so a gentler second pass.
QUALITY = 88

# key -> file in Downloads. Order is the order they are shown in.
MAPPING = {
    # Daylight, the row of apartments from the paved courtyard.
    "grounds-front": "iu.jpeg",
    # Night, the pool with two of the front doors behind it.
    "grounds-pool-1": "8.jpeg",
    # Daylight, the outdoor tables on the artificial grass.
    "grounds-terrace": "6r.jpeg",
    # Daylight, the lawn with the apartments behind the slatted fence.
    "grounds-lawn": "u.jpeg",
    # Night, the pool lit red and blue.
    "grounds-pool-2": "tr.jpeg",
    # Night, close on the water feature at the pool's edge.
    "grounds-pool-3": "WhatsApp Image 2026-09-14 at 9.32.09 AM.jpeg",
}


def main() -> None:
    missing = [f for f in MAPPING.values() if not os.path.exists(os.path.join(SOURCE, f))]
    if missing:
        raise SystemExit(f"not found in {SOURCE}: {missing}")

    for key, filename in MAPPING.items():
        image = Image.open(os.path.join(SOURCE, filename))
        image = ImageOps.exif_transpose(image).convert("RGB")
        before = image.size
        image.thumbnail((LONG_EDGE, LONG_EDGE), Image.LANCZOS)
        target = os.path.join(PHOTOS, f"{key}.jpg")
        # No `exif=`, so no camera metadata reaches the web server.
        image.save(target, "JPEG", quality=QUALITY, optimize=True, progressive=True)
        kb = os.path.getsize(target) // 1024
        print(f"{key:16s} {filename:48s} {before[0]}x{before[1]}  {kb}KB")


if __name__ == "__main__":
    main()
