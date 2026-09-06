"""Bring the owner's photographs of the three apartments into public/photos.

Run once, after the photographer's folders land in Downloads:

    python scripts/import-residence-photos.py
    python scripts/build-photo-manifest.py

WHY THIS IS A SCRIPT AND NOT A DRAG AND DROP.

The originals are 6720x4480, ten megabytes each, and there are eighty-six of
them. Dropped into public/ as they are, a phone on a Lusaka connection would be
asked to fetch a print-resolution file to fill a card three hundred pixels wide.
This resizes to a sensible long edge, strips the camera metadata (which carries
the GPS pin of the property in some frames) and applies the EXIF rotation, which
matters because several frames are portrait and would otherwise land on their
side.

THE MAPPING IS THE POINT. Each line below says which photograph is which room in
which apartment. It is written down here rather than done by hand so that the
next batch of photographs can be slotted in against the same names and nothing
has to be guessed a second time.
"""

import os
import shutil

from PIL import Image, ImageOps

SOURCE = r"C:\Users\User\Downloads\New folder"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PHOTOS = os.path.join(ROOT, "public", "photos")

# The long edge, in pixels. 2560 covers a full-bleed band on a retina laptop
# and is the largest size next/image will ever be asked to produce from it.
LONG_EDGE = 2560
# The hero and the wide banner are the two that run edge to edge on a large
# screen, so they get more to work with.
LONG_EDGE_WIDE = 3200
QUALITY = 82

WIDE = {"hero", "detail-living"}

# key -> (folder, file). The key is what src/lib/content.ts refers to.
MAPPING = {
    # --- Mandela -----------------------------------------------------------
    # The door plaque opens the page. It is the one photograph that says which
    # apartment you are looking at, which is what the owner asked for.
    "r1-door":      ("Mandela", "Door M.jpg"),
    "r1-living":    ("Mandela", "untitled-2.jpg"),
    "r1-living-2":  ("Mandela", "untitled-3.jpg"),
    "r1-bedroom":   ("Mandela", "Master bedroom1.jpg"),
    "r1-bedroom-2": ("Mandela", "Guest bedroom.jpg"),
    "r1-dining":    ("Mandela", "untitled-4.jpg"),
    "r1-kitchen":   ("Mandela", "untitled-10.jpg"),
    "r1-bath":      ("Mandela", "Master toilet1.jpg"),

    # --- Mulima ------------------------------------------------------------
    "r2-door":      ("Mulima", "Door M.jpg"),
    "r2-living":    ("Mulima", "untitled-59.jpg"),
    "r2-living-2":  ("Mulima", "untitled-52.jpg"),
    "r2-bedroom-1": ("Mulima", "Master bedroom.jpg"),
    "r2-bedroom-2": ("Mulima", "Guest bedroom.jpg"),
    "r2-dining":    ("Mulima", "untitled-50.jpg"),
    "r2-kitchen":   ("Mulima", "untitled-63.jpg"),
    "r2-bath":      ("Mulima", "Master Shower1.jpg"),

    # --- Kaunda ------------------------------------------------------------
    "r3-door":      ("Kaunda", "Door K.jpg"),
    "r3-living":    ("Kaunda", "untitled-106.jpg"),
    "r3-bedroom-1": ("Kaunda", "Master bedroom.jpg"),
    "r3-bedroom-2": ("Kaunda", "Guest bedroom1.jpg"),
    "r3-dining":    ("Kaunda", "untitled-105.jpg"),
    "r3-kitchen":   ("Kaunda", "untitled-97.jpg"),
    "r3-bath":      ("Kaunda", "guest shower.jpg"),

    # --- Not tied to one apartment -----------------------------------------
    # The homepage cover, the wide banner on /residences and the bathroom
    # detail on the homepage. All three were stock photographs of somebody
    # else's house; one of them still carried a visible agency credit line.
    # NOT a living room, deliberately. The three cards further down the same
    # page are the three living rooms, and the photographer shot each of them
    # from more or less one position, so any living room used here turns up
    # again as a card a screen and a half later looking like the same picture.
    # The first attempt used Mandela's, whose two frames are near enough
    # identical. This one looks across the dining table, through to the living
    # room and out at the front door, so it reads as an apartment rather than
    # as a sofa, and it matches nothing else on the page.
    "hero":          ("Mandela", "untitled-5.jpg"),
    "detail-living": ("Mulima", "untitled-56.jpg"),
    "detail-bath":   ("Mandela", "Guest shower.jpg"),
    # `exterior` is deliberately absent. There is no photograph of the building
    # or the approach from Makeni Road in this batch, and the location page
    # captions that slot "The approach from Makeni Road". Leaving the stock
    # file in place is wrong, but replacing it with an interior would be worse.
    # It needs one photograph from the owner, taken at the gate.
}

# Files that were placeholders for slots this batch does not fill.
RETIRE = ["r1-desk.jpg"]


def main() -> None:
    os.makedirs(PHOTOS, exist_ok=True)
    written = 0

    for key, (folder, filename) in sorted(MAPPING.items()):
        source = os.path.join(SOURCE, folder, filename)
        if not os.path.exists(source):
            print(f"MISSING  {key:14s} {folder}/{filename}")
            continue

        image = Image.open(source)
        # Several frames are portrait and carry the rotation in EXIF only.
        image = ImageOps.exif_transpose(image).convert("RGB")
        before = image.size

        edge = LONG_EDGE_WIDE if key in WIDE else LONG_EDGE
        image.thumbnail((edge, edge), Image.LANCZOS)

        target = os.path.join(PHOTOS, f"{key}.jpg")
        # No `exif=` argument, so the camera metadata (including GPS on some
        # frames) does not travel to the web server.
        image.save(target, "JPEG", quality=QUALITY, optimize=True, progressive=True)

        kb = os.path.getsize(target) // 1024
        print(
            f"{key:14s} {folder}/{filename:22s} "
            f"{before[0]}x{before[1]} -> {image.size[0]}x{image.size[1]}  {kb}KB"
        )
        written += 1

    for name in RETIRE:
        path = os.path.join(PHOTOS, name)
        if os.path.exists(path):
            os.remove(path)
            print(f"removed  {name} (no photograph in this batch fills that slot)")

    print(f"\n{written} photographs written to public/photos")


if __name__ == "__main__":
    main()
