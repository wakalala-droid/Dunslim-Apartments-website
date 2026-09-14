"""Bring the owner's photographs of the outside and the pool into public/photos.

Run after unzipping the photographer's files:

    python scripts/import-grounds-photos.py
    python scripts/build-photo-manifest.py

The first copies arrived on 14 September 2026 over WhatsApp, shrunk to 1080px,
which is too small for anything that runs edge to edge. The photographer's
originals (up to 6720px) arrived the same day as Photos-1-001.zip and replaced
them. Unzip that to SOURCE and rerun.

They are kept apart from import-residence-photos.py because they belong to no
one apartment: the pool and the grounds are shared by all three. Every key here
starts with `grounds-`, and that script leaves anything with that prefix alone.
"""

import os

from PIL import Image, ImageOps

SOURCE = os.path.join(os.path.expanduser("~"), "Downloads", "Photos-1-001")
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PHOTOS = os.path.join(ROOT, "public", "photos")

LONG_EDGE = 2560
# The ones that can run the full width of a large screen get more to work with.
LONG_EDGE_WIDE = 3200
WIDE = {"grounds-pool-1", "grounds-panorama"}
QUALITY = 82

# key -> file in SOURCE. Order is the order they are shown in.
MAPPING = {
    # Daylight, the row of apartments from the paved courtyard.
    "grounds-front": "untitled-308.jpg",
    # Night, the pool with two of the front doors behind it. Also the full
    # width photograph at the foot of the homepage.
    "grounds-pool-1": "untitled-380.jpg",
    # Daylight, the outdoor tables on the artificial grass.
    "grounds-terrace": "untitled-333.jpg",
    # Daylight, the lawn with the apartments behind the slatted fence.
    "grounds-lawn": "untitled-315.jpg",
    # Night, the pool lit red and blue.
    "grounds-pool-2": "untitled-379.jpg",
    # Night, close on the water feature at the pool's edge.
    "grounds-pool-3": "untitled-382.jpg",
    # Daylight, a very wide panorama of the lawn and the whole row. Roughly
    # three to one, so it only suits a wide band.
    "grounds-panorama": "untitled-314.jpg",
}


def main() -> None:
    missing = [f for f in MAPPING.values() if not os.path.exists(os.path.join(SOURCE, f))]
    if missing:
        raise SystemExit(f"not found in {SOURCE}: {missing}")

    for key, filename in MAPPING.items():
        image = Image.open(os.path.join(SOURCE, filename))
        image = ImageOps.exif_transpose(image).convert("RGB")
        before = image.size
        edge = LONG_EDGE_WIDE if key in WIDE else LONG_EDGE
        image.thumbnail((edge, edge), Image.LANCZOS)
        target = os.path.join(PHOTOS, f"{key}.jpg")
        # No `exif=`, so no camera metadata (some frames carry GPS) reaches the web server.
        image.save(target, "JPEG", quality=QUALITY, optimize=True, progressive=True)
        kb = os.path.getsize(target) // 1024
        print(f"{key:18s} {filename:18s} {before[0]}x{before[1]} -> {image.size[0]}x{image.size[1]}  {kb}KB")


if __name__ == "__main__":
    main()
