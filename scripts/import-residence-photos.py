"""Bring the owner's photographs of the three apartments into public/photos.

Run once, after the photographer's folders land in Downloads:

    python scripts/import-residence-photos.py
    python scripts/build-photo-manifest.py

WHY THIS IS A SCRIPT AND NOT A DRAG AND DROP.

The originals are up to 6720x4480, ten megabytes each, and there are eighty-six
of them. Dropped into public/ as they are, a phone on a Lusaka connection would
be asked to fetch a print-resolution file to fill a card three hundred pixels
wide. This resizes to a sensible long edge, strips the camera metadata (which
carries the GPS pin of the property in some frames) and applies the EXIF
rotation, which matters because several frames are portrait and would otherwise
land on their side.

THE MAPPING IS THE POINT. Every one of the eighty-six frames is listed below
against the room it shows. It is written down here rather than done by hand so
that the next batch can be slotted in against the same names and nothing has to
be guessed a second time.

Nothing is left out. The owner asked for the whole shoot on the site, so the
check at the bottom fails loudly if a file in any of the three folders has no
key, or if two keys point at the same frame.
"""

import glob
import os

from PIL import Image, ImageOps

SOURCE = r"C:\Users\User\Downloads\New folder"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PHOTOS = os.path.join(ROOT, "public", "photos")

# The long edge, in pixels. 2560 covers a gallery slide on a retina laptop and
# is the largest size next/image will ever be asked to produce from it.
LONG_EDGE = 2560
# The few that run edge to edge on a large screen get more to work with.
LONG_EDGE_WIDE = 3200
QUALITY = 82

WIDE = {"r1-door", "r2-door", "r3-door", "r1-living-4", "r2-living-2"}

# key -> (folder, file). The key is what src/lib/content.ts refers to.
#
# Order inside each apartment is the order the gallery runs in: the room you
# walk into, then where you eat, then the kitchen, then the beds, then the
# bathrooms, then the hall and the small things.
MAPPING = {
    # ---------------------------------------------------------------- MANDELA
    # The door plaque opens the page. It is the one photograph that says which
    # apartment you are looking at, which is what the owner asked for.
    "r1-door": ("Mandela", "Door M.jpg"),

    "r1-living-1": ("Mandela", "untitled-2.jpg"),
    "r1-living-2": ("Mandela", "untitled.jpg"),
    "r1-living-3": ("Mandela", "untitled-9.jpg"),
    # The homepage cover, chosen by the owner, which is why it is in the wide
    # set: it is the only photograph on the site that runs the full width of a
    # laptop screen.
    "r1-living-4": ("Mandela", "untitled-3.jpg"),
    "r1-living-5": ("Mandela", "untitled-7.jpg"),
    "r1-living-6": ("Mandela", "untitled-48.jpg"),

    "r1-dining-1": ("Mandela", "untitled-5.jpg"),
    "r1-dining-2": ("Mandela", "untitled-6.jpg"),
    "r1-dining-3": ("Mandela", "untitled-4.jpg"),

    "r1-kitchen-1": ("Mandela", "untitled-10.jpg"),
    "r1-kitchen-2": ("Mandela", "untitled-11.jpg"),
    "r1-kitchen-3": ("Mandela", "untitled-12.jpg"),
    "r1-kitchen-4": ("Mandela", "untitled-15.jpg"),
    "r1-kitchen-5": ("Mandela", "untitled-17.jpg"),

    "r1-bedroom-1": ("Mandela", "Master bedroom1.jpg"),
    "r1-bedroom-2": ("Mandela", "Master bedroom.jpg"),
    "r1-bedroom-3": ("Mandela", "Guest bedroom.jpg"),

    "r1-bath-1": ("Mandela", "Master toilet1.jpg"),
    "r1-bath-2": ("Mandela", "Master toilet2.jpg"),
    "r1-bath-3": ("Mandela", "Master toilet.jpg"),
    "r1-bath-4": ("Mandela", "Master toile3.jpg"),
    # Also the bathroom detail on the homepage.
    "r1-bath-5": ("Mandela", "Guest shower.jpg"),
    "r1-bath-6": ("Mandela", "Guest Toilet.jpg"),
    "r1-bath-7": ("Mandela", "Guest Toilet 1.jpg"),

    "r1-hall-1": ("Mandela", "untitled-23.jpg"),
    "r1-hall-2": ("Mandela", "untitled-24.jpg"),

    "r1-detail-1": ("Mandela", "untitled-44.jpg"),
    "r1-detail-2": ("Mandela", "untitled-45.jpg"),
    "r1-detail-3": ("Mandela", "untitled-49.jpg"),

    # ----------------------------------------------------------------- MULIMA
    "r2-door": ("Mulima", "Door M.jpg"),

    "r2-living-1": ("Mulima", "untitled-59.jpg"),
    # Also the wide banner on /residences and the long-stay block at home.
    "r2-living-2": ("Mulima", "untitled-56.jpg"),
    "r2-living-3": ("Mulima", "untitled-52.jpg"),
    "r2-living-4": ("Mulima", "untitled-51.jpg"),
    "r2-living-5": ("Mulima", "untitled-54.jpg"),
    "r2-living-6": ("Mulima", "untitled-55.jpg"),
    "r2-living-7": ("Mulima", "untitled-61.jpg"),
    "r2-living-8": ("Mulima", "untitled-58.jpg"),

    "r2-dining-1": ("Mulima", "untitled-57.jpg"),
    "r2-dining-2": ("Mulima", "untitled-50.jpg"),

    "r2-kitchen-1": ("Mulima", "untitled-63.jpg"),
    "r2-kitchen-2": ("Mulima", "untitled-62.jpg"),
    "r2-kitchen-3": ("Mulima", "untitled-16.jpg"),
    "r2-kitchen-4": ("Mulima", "untitled-67.jpg"),
    "r2-kitchen-5": ("Mulima", "untitled-68.jpg"),
    "r2-kitchen-6": ("Mulima", "untitled-69.jpg"),

    "r2-bedroom-1": ("Mulima", "Master bedroom.jpg"),
    "r2-bedroom-2": ("Mulima", "Master bedroom1.jpg"),
    "r2-bedroom-3": ("Mulima", "Master bedroom2.jpg"),
    "r2-bedroom-4": ("Mulima", "Guest bedroom.jpg"),

    "r2-bath-1": ("Mulima", "Master Shower1.jpg"),
    "r2-bath-2": ("Mulima", "Master Shower.jpg"),
    "r2-bath-3": ("Mulima", "Guest shower.jpg"),
    "r2-bath-4": ("Mulima", "Guest Toilet.jpg"),
    "r2-bath-5": ("Mulima", "Guest Toilet1.jpg"),
    "r2-bath-6": ("Mulima", "Guest Toilet2.jpg"),

    "r2-hall-1": ("Mulima", "untitled-76.jpg"),

    "r2-detail-1": ("Mulima", "untitled-46.jpg"),

    # ----------------------------------------------------------------- KAUNDA
    "r3-door": ("Kaunda", "Door K.jpg"),

    "r3-living-1": ("Kaunda", "untitled-106.jpg"),
    "r3-living-2": ("Kaunda", "untitled-109.jpg"),
    "r3-living-3": ("Kaunda", "untitled-110.jpg"),
    "r3-living-4": ("Kaunda", "untitled-102.jpg"),
    "r3-living-5": ("Kaunda", "untitled-103.jpg"),

    "r3-dining-1": ("Kaunda", "untitled-105.jpg"),
    "r3-dining-2": ("Kaunda", "untitled-104.jpg"),
    "r3-dining-3": ("Kaunda", "untitled-107.jpg"),
    "r3-dining-4": ("Kaunda", "untitled-108.jpg"),

    "r3-kitchen-1": ("Kaunda", "untitled-97.jpg"),
    "r3-kitchen-2": ("Kaunda", "untitled-98.jpg"),
    "r3-kitchen-3": ("Kaunda", "untitled-99.jpg"),
    "r3-kitchen-4": ("Kaunda", "untitled-100.jpg"),
    "r3-kitchen-5": ("Kaunda", "untitled-16.jpg"),

    "r3-bedroom-1": ("Kaunda", "Master bedroom.jpg"),
    "r3-bedroom-2": ("Kaunda", "Master bedroom1.jpg"),
    "r3-bedroom-3": ("Kaunda", "Guest bedroom1.jpg"),
    "r3-bedroom-4": ("Kaunda", "Guest bedroom2.jpg"),
    "r3-bedroom-5": ("Kaunda", "Guest bedroom3.jpg"),
    "r3-bedroom-6": ("Kaunda", "Guest bedroom.jpg"),

    "r3-bath-1": ("Kaunda", "master toilet.jpg"),
    "r3-bath-2": ("Kaunda", "guest shower.jpg"),
    "r3-bath-3": ("Kaunda", "guest shower1.jpg"),
    "r3-bath-4": ("Kaunda", "guest toilet.jpg"),
    "r3-bath-5": ("Kaunda", "Guest Toilet 3.jpg"),

    "r3-detail-1": ("Kaunda", "untitled-47.jpg"),

    # `exterior` is deliberately absent. There is no photograph of the building
    # or the approach from Makeni Road in this batch, and the location page
    # captions that slot "The approach from Makeni Road". Leaving the stock file
    # in place is wrong, but replacing it with an interior would be worse. It
    # needs one photograph from the owner, taken at the gate.
}


def check() -> bool:
    """Every frame in every folder has a key, and no frame has two."""
    ok = True

    for folder in sorted({f for f, _ in MAPPING.values()}):
        on_disk = {
            os.path.basename(p)
            for p in glob.glob(os.path.join(SOURCE, folder, "*.jpg"))
        }
        mapped = {n for f, n in MAPPING.values() if f == folder}

        for name in sorted(on_disk - mapped):
            print(f"NOT USED   {folder}/{name}")
            ok = False
        for name in sorted(mapped - on_disk):
            print(f"NO SUCH FILE {folder}/{name}")
            ok = False

    seen = {}
    for key, pair in MAPPING.items():
        if pair in seen:
            print(f"SAME FRAME twice: {key} and {seen[pair]} -> {pair[0]}/{pair[1]}")
            ok = False
        seen[pair] = key

    return ok


def main() -> None:
    os.makedirs(PHOTOS, exist_ok=True)

    if not check():
        raise SystemExit("mapping is not complete; nothing written")

    # Anything in the folder that this mapping does not name is from an earlier
    # pass and goes, EXCEPT the stock exterior, which nothing here replaces.
    keep = set(MAPPING) | {"exterior"}
    for path in sorted(glob.glob(os.path.join(PHOTOS, "*.jpg"))):
        if os.path.splitext(os.path.basename(path))[0] not in keep:
            os.remove(path)
            print(f"removed  {os.path.basename(path)}")

    written = 0
    for key, (folder, filename) in MAPPING.items():
        image = Image.open(os.path.join(SOURCE, folder, filename))
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
            f"{key:15s} {folder}/{filename:22s} "
            f"{before[0]}x{before[1]} -> {image.size[0]}x{image.size[1]}  {kb}KB"
        )
        written += 1

    total = sum(
        os.path.getsize(os.path.join(PHOTOS, f)) for f in os.listdir(PHOTOS)
    ) / (1024 * 1024)
    print(f"\n{written} photographs written to public/photos ({total:.1f}MB in total)")


if __name__ == "__main__":
    main()
