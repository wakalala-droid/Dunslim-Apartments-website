"""Regenerate src/lib/photos.ts from the files in public/photos.

Run after adding, removing or replacing any photograph:

    python scripts/build-photo-manifest.py

It reads every .jpg in public/photos, records the real pixel dimensions (so the
page reserves the right space and never shifts as images arrive) and embeds a
tiny blurred preview that next/image shows while the full file loads.

Needs Pillow:  pip install pillow
"""

import base64
import glob
import io
import os

from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PHOTOS = os.path.join(ROOT, "public", "photos")
TARGET = os.path.join(ROOT, "src", "lib", "photos.ts")

HEADER = '''/**
 * Photo manifest, generated from the files in /public/photos.
 *
 * Do not edit by hand. Run:  python scripts/build-photo-manifest.py
 *
 * Each entry carries the real pixel dimensions (so there is no layout shift)
 * and a tiny inline blur, which next/image shows while the full file loads. On
 * a weak connection that is the difference between a page that feels considered
 * and a page that flashes empty boxes.
 */
export type Photo = { src: string; w: number; h: number; blur: string };

export const photos: Record<string, Photo> = {
'''

FOOTER = '''};

export const photo = (key: string): Photo | null => photos[key] ?? null;
'''


def main() -> None:
    os.chdir(PHOTOS)
    rows = []

    for path in sorted(glob.glob("*.jpg")):
        image = Image.open(path).convert("RGB")
        width, height = image.size

        thumb = image.copy()
        thumb.thumbnail((8, 8))
        thumb = thumb.filter(ImageFilter.GaussianBlur(0.4))

        buffer = io.BytesIO()
        thumb.save(buffer, format="JPEG", quality=30)
        blur = base64.b64encode(buffer.getvalue()).decode()

        key = os.path.splitext(path)[0]
        rows.append(
            f'  "{key}": {{ src: "/photos/{path}", w: {width}, h: {height}, '
            f'blur: "data:image/jpeg;base64,{blur}" }},'
        )
        print(f"{path:22s} {width}x{height}")

    with open(TARGET, "w", encoding="utf-8") as handle:
        handle.write(HEADER + "\n".join(rows) + "\n" + FOOTER)

    print(f"\nwrote {len(rows)} entries to src/lib/photos.ts")


if __name__ == "__main__":
    main()
