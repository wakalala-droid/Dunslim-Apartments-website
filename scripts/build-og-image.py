"""
Build public/og-default.jpg, the site's default share card.

This is the picture a link to the homepage carries into WhatsApp, Facebook and
the rest, and the first picture search engines are given for the business. It
is 1200 x 630, the size every one of those previews asks for.

Until 25 September 2026 it was a stock photograph of somebody else's living
room, made on 28 August before the owner's own photographs existed and never
remade when they arrived. So this script exists: rerun it whenever the homepage
cover changes and the card follows.

    python scripts/build-og-image.py

THE BAND IS REUSED, NOT REDRAWN. The foot of the card is a solid Deep Navy band
carrying the reversed horizontal lockup, which is the brand book's treatment
for the mark near a photograph (p.12: never directly on one). That band is
lifted from scripts/assets/og-band.png rather than rendered from the SVG here, because
this machine has no reliable SVG renderer for the lockup: PyMuPDF draws marks
that browsers leave blank, which is the trap recorded in the handover notes.
"""

import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PHOTOS = ROOT / "public" / "photos"
OUT = ROOT / "public" / "og-default.jpg"
BAND = ROOT / "scripts" / "assets" / "og-band.png"

W, H = 1200, 630
PHOTO_H = 440  # photograph on top, 0..439
RULE_H = 2  # the brass hairline under it
BRASS = (0xB2, 0x8A, 0x4A)
NAVY = (0x0F, 0x22, 0x34)

# The homepage cover, chosen by the owner on 7 September 2026. Keep in step
# with the `Hero` image on the homepage.
COVER = "r1-living-4"
# Where the crop sits vertically, 0 = top of the photograph, 1 = bottom. The
# card is far wider than the photograph, so this picks the band that keeps the
# glass table, the plant and the armchairs.
FOCUS_Y = 0.42
# The same, per residence card, where the middle of the photograph is wrong.
# Kaunda's frame is mostly bare wall above the sofa.
RESIDENCE_FOCUS_Y = {"kaunda": 0.8}


def cover_crop(img: Image.Image, w: int, h: int, focus_y: float) -> Image.Image:
    """CSS object-fit: cover, with the vertical position set by focus_y."""
    scale = max(w / img.width, h / img.height)
    resized = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    left = (resized.width - w) // 2
    top = round((resized.height - h) * focus_y)
    return resized.crop((left, top, left + w, top + h))


def residence_covers() -> dict[str, str]:
    """
    Each residence's slug and its first photograph, read out of content.ts.

    `photos[0]` is the picture the residence card and the booking flow lead
    with, so it is the one the share card uses too. Read from the file rather
    than copied here, so reordering a gallery cannot leave a card showing a
    photograph the page no longer leads with.
    """
    src = (ROOT / "src" / "lib" / "content.ts").read_text(encoding="utf-8")
    covers = {}
    for m in re.finditer(r'slug: "([a-z-]+)",', src):
        after = src[m.end():]
        first = re.search(r'photos: \[\s*\{ id: "([^"]+)"', after)
        if first:
            covers[m.group(1)] = first.group(1)
    assert covers, "no residences found in content.ts"
    return covers


def build(photo_id: str, out: Path, band: Image.Image, focus_y: float) -> None:
    photo = Image.open(PHOTOS / f"{photo_id}.jpg").convert("RGB")
    card = Image.new("RGB", (W, H), NAVY)
    card.paste(cover_crop(photo, W, PHOTO_H, focus_y), (0, 0))
    card.paste(Image.new("RGB", (W, RULE_H), BRASS), (0, PHOTO_H))
    card.paste(band, (0, PHOTO_H + RULE_H))

    # No EXIF is carried over: some of the owner's frames hold the property's
    # GPS position and a share card is the most widely copied file on the site.
    card.save(out, "JPEG", quality=86, optimize=True, progressive=True)
    kb = out.stat().st_size // 1024
    # WhatsApp drops the picture from a link preview when the file is much over
    # 300 KB, which is why the pages do not simply point at the photographs.
    assert kb < 300, f"{out.name} is {kb} KB"
    print(f"wrote {out.relative_to(ROOT)} ({kb} KB) from {photo_id}")


def main() -> None:
    band = Image.open(BAND).convert("RGB")
    assert band.size == (W, H - PHOTO_H - RULE_H), band.size

    build(COVER, OUT, band, FOCUS_Y)
    # One per residence, served at /og/<slug>.jpg and named in that page's
    # metadata. Same band, same rule, so a shared link to any page is
    # recognisably the same property.
    (ROOT / "public" / "og").mkdir(exist_ok=True)
    for slug, photo_id in residence_covers().items():
        focus = RESIDENCE_FOCUS_Y.get(slug, 0.5)
        build(photo_id, ROOT / "public" / "og" / f"{slug}.jpg", band, focus)


if __name__ == "__main__":
    main()
