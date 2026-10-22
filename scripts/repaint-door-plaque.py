"""Repaint the name on the third apartment's door plaque.

    python scripts/repaint-door-plaque.py
    python scripts/build-photo-manifest.py

The third apartment was Kaunda when the photographer shot it, and its door
plaque says KAUNDA. On 22 October 2026 the owner renamed it Rupiah Banda, and
the door is the first thing its page shows, so the photograph has to say the
new name too.

It works from the photographer's original, resized exactly as
import-residence-photos.py resizes it, so the repaint is one JPEG generation
and can be redone from scratch. import-residence-photos.py leaves r3-door.jpg
alone once it exists, so a re-import does not put KAUNDA back.

HOW. The inner border of the plaque is found by walking in from the yellow
until the brown rule starts, and four straight lines through those points give
the plaque's corners in the photograph. The camera was a little above and to
one side, so the plaque is not a rectangle in the frame; the new name is set
flat and then warped onto those four corners, so it leans exactly as the
border does.

The old letters are painted out with a smooth model of the bare plaque (it is
lit unevenly, brighter on the left) plus the plaque's own grain, copied from
bare rows above and below rather than invented, so the fill has the same
texture as the yellow around it.

The new name is Arial Bold, which is what the plaque was printed in (the stem
is a fifth of the cap height on both), with the same open letter spacing
KAUNDA had. RUPIAH BANDA is twice as many letters, so it runs at the width
KAUNDA took (about 85 per cent of the panel) and the letters are smaller to
fit. The colour is the median of the old letters' cores.
"""

import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

SOURCE = r"C:\Users\User\Downloads\New folder\Kaunda\Door K.jpg"
HERE = os.path.dirname(os.path.abspath(__file__))
TARGET = os.path.join(os.path.dirname(HERE), "public", "photos", "r3-door.jpg")
FONT = r"C:\Windows\Fonts\arialbd.ttf"

NAME = "RUPIAH BANDA"
# The same as import-residence-photos.py: the door is in its WIDE set.
LONG_EDGE = 3200
QUALITY = 82

# Where KAUNDA sits in the 3200px frame, with a margin. Only dark pixels inside
# this box are painted out, so the specks on the plaque and its darker top
# right corner stay exactly as shot.
OLD_TEXT = (840, 700, 2530, 1000)  # left, top, right, bottom
INSET = 7  # keep this far inside the brown rule
TRACK = 0.06  # extra letter spacing as a share of the em, measured off KAUNDA
WIDTH_SHARE = 0.845  # how much of the panel's width the name runs across
DROP = 0.475  # share of the spare height above the name; KAUNDA sat just high


def is_yellow(p) -> bool:
    return p[0] > 190 and p[1] > 140 and p[2] < 150 and p[0] - p[2] > 100


def inner_border(a):
    """Points on the inside edge of the brown rule, one set per side."""
    top, bot, left, right = [], [], [], []
    for x in range(780, 2640, 60):
        y = 640
        while is_yellow(a[y, x]):
            y -= 1
        top.append((x, y + 0.5))
        y = 1100
        while is_yellow(a[y, x]):
            y += 1
        bot.append((x, y - 0.5))
    for y in range(590, 1130, 30):
        x = 800
        while is_yellow(a[y, x]):
            x -= 1
        left.append((x + 0.5, y))
        x = 2600
        while is_yellow(a[y, x]):
            x += 1
        right.append((x - 0.5, y))
    return top, bot, left, right


def corners(a):
    top, bot, left, right = inner_border(a)

    def across(pts):  # y = m*x + c
        p = np.array(pts, float)
        return np.polyfit(p[:, 0], p[:, 1], 1)

    def down(pts):  # x = m*y + c
        p = np.array(pts, float)
        return np.polyfit(p[:, 1], p[:, 0], 1)

    def meet(h, v):
        y = (h[0] * v[1] + h[1]) / (1 - h[0] * v[0])
        return v[0] * y + v[1], y

    t, b, l, r = across(top), across(bot), down(left), down(right)
    return meet(t, l), meet(t, r), meet(b, r), meet(b, l)


def homography(src, dst):
    rows, rhs = [], []
    for (x, y), (u, v) in zip(src, dst):
        rows.append([x, y, 1, 0, 0, 0, -u * x, -u * y])
        rows.append([0, 0, 0, x, y, 1, -v * x, -v * y])
        rhs += [u, v]
    h = np.linalg.solve(np.array(rows), np.array(rhs))
    return np.append(h, 1).reshape(3, 3)


def set_line(text, em):
    """The name in white on black, cropped to its letters and cap height."""
    font = ImageFont.truetype(FONT, int(em))
    advances = [font.getlength(ch) for ch in text]
    track = TRACK * em
    width = sum(advances) + track * (len(text) - 1)
    _, cap_top, _, cap_bottom = font.getbbox("H")
    mask = Image.new("L", (int(width) + 40, int(cap_bottom) + 40), 0)
    draw = ImageDraw.Draw(mask)
    x = 20
    for ch, adv in zip(text, advances):
        draw.text((x, 20), ch, font=font, fill=255)
        x += adv + track
    box = mask.getbbox()
    return mask.crop((box[0], 20 + cap_top, box[2], 20 + cap_bottom + 1))


def main() -> None:
    image = ImageOps.exif_transpose(Image.open(SOURCE)).convert("RGB")
    image.thumbnail((LONG_EDGE, LONG_EDGE), Image.LANCZOS)
    a = np.asarray(image).astype(np.float64)
    height, width = a.shape[:2]

    quad = corners(a)
    W = (np.hypot(*np.subtract(quad[1], quad[0])) + np.hypot(*np.subtract(quad[2], quad[3]))) / 2
    H = (np.hypot(*np.subtract(quad[3], quad[0])) + np.hypot(*np.subtract(quad[2], quad[1]))) / 2
    to_image = homography([(0, 0), (W, 0), (W, H), (0, H)], quad)
    to_plaque = np.linalg.inv(to_image)

    # Every pixel's position on the flat plaque.
    yy, xx = np.mgrid[0:height, 0:width]
    d = to_plaque[2, 0] * xx + to_plaque[2, 1] * yy + to_plaque[2, 2]
    u = (to_plaque[0, 0] * xx + to_plaque[0, 1] * yy + to_plaque[0, 2]) / d
    v = (to_plaque[1, 0] * xx + to_plaque[1, 1] * yy + to_plaque[1, 2]) / d
    inner = (u > INSET) & (u < W - INSET) & (v > INSET) & (v < H - INSET)

    # The old letters, grown a little to take their soft edges with them.
    dark = (a[..., 0] < 205) | (a[..., 1] < 150)
    box = np.zeros_like(dark)
    left, top, right, bottom = OLD_TEXT
    box[top:bottom, left:right] = True
    old = inner & dark & box
    grown = Image.fromarray((old * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(11))
    old_mask = (np.asarray(grown) > 0) & inner
    shrunk = Image.fromarray((old * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(9))
    ink_colour = np.median(a[(np.asarray(shrunk) > 0) & inner], axis=0)

    # The bare plaque: a gentle quadratic in each channel, plus its grain.
    bare = inner & ~old_mask
    U, V = u / W, v / H
    terms = np.stack([np.ones_like(U), U, V, U * U, U * V, V * V], -1)
    smooth = np.zeros_like(a)
    for ch in range(3):
        coef, *_ = np.linalg.lstsq(terms[bare], a[..., ch][bare], rcond=None)
        smooth[..., ch] = terms @ coef
    grain = a - smooth

    # Paint the old letters out with grain lifted from bare rows above or below.
    ys, xs = np.nonzero(old_mask)
    rows = np.nonzero(old_mask.any(1))[0]
    mid, shift = (rows[0] + rows[-1]) // 2, rows[-1] - rows[0] + 6
    near = np.clip(np.where(ys < mid, ys + shift, ys - shift), 0, height - 1)
    far = np.clip(np.where(ys < mid, ys - shift, ys + shift), 0, height - 1)
    near = np.where(~bare[near, xs] & bare[far, xs], far, near)
    rng = np.random.default_rng(7)
    for i in np.nonzero(~bare[near, xs])[0]:
        near[i] = rng.choice(np.nonzero(bare[:, xs[i]])[0])
    out = a.copy()
    out[ys, xs] = smooth[ys, xs] + grain[near, xs]
    grain[ys, xs] = grain[near, xs]

    # Set the new name flat, three times oversize, then warp it onto the plaque.
    ss = 3
    probe = set_line(NAME, 300 * ss)
    line = set_line(NAME, 300 * ss * WIDTH_SHARE * W * ss / probe.width)
    flat = Image.new("L", (int(W * ss), int(H * ss)), 0)
    flat.paste(line, (int((flat.width - line.width) / 2), int((flat.height - line.height) * DROP)))
    warp = np.diag([ss, ss, 1]) @ to_plaque
    warped = flat.transform(
        (width, height), Image.PERSPECTIVE, tuple((warp / warp[2, 2]).flatten()[:8]), Image.BICUBIC
    ).filter(ImageFilter.GaussianBlur(0.9))
    alpha = (np.asarray(warped).astype(np.float64) / 255.0 * inner)[..., None]

    # Printed ink on the same stock carries a little of the same grain.
    ink = ink_colour[None, None, :] + grain * 0.55
    out = np.clip(out * (1 - alpha) + ink * alpha, 0, 255).astype(np.uint8)
    Image.fromarray(out).save(TARGET, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    print(f"r3-door.jpg now reads {NAME}  ({os.path.getsize(TARGET) // 1024}KB)")


if __name__ == "__main__":
    main()
