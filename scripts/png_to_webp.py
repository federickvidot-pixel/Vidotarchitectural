"""Convert all PNGs under Image/ to WebP (quality 85). Run: python scripts/png_to_webp.py from project root. Requires Pillow."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "Image"


def main() -> None:
    count = 0
    for p in sorted(ROOT.rglob("*.png")):
        im = Image.open(p)
        if im.mode == "P":
            im = im.convert("RGBA")
        elif im.mode in ("RGBA", "LA"):
            pass
        else:
            im = im.convert("RGB")
        out = p.with_suffix(".webp")
        im.save(out, "WEBP", quality=85, method=6)
        count += 1
        print("OK", p.relative_to(ROOT.parent))
    print("Converted", count, "files")


if __name__ == "__main__":
    main()
