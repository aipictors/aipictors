"""
止まった絵（<slug>.webp、384px）から一覧向けの小さい版を作る

python3 scripts/avatar-frames/resize-decorations.py public/avatar-frames/deco

<slug>.w128.webp: 小さいアイコン（32〜48px 表示。枠はアイコンの 1.484 倍）の 2x
<slug>.w256.webp: 中くらいの表示・3x の画面向け
"""
import sys
from pathlib import Path

from PIL import Image

WIDTHS = (128, 256)

folder = Path(sys.argv[1])
total = 0
for path in sorted(folder.glob("*.webp")):
    if path.name.count(".") != 1:
        continue
    image = Image.open(path).convert("RGBA")
    for width in WIDTHS:
        output = path.with_name(f"{path.stem}.w{width}.webp")
        # RGBA の縮小は Pillow が透過を考慮して混ぜる（縁が黒くにじまない）
        image.resize((width, width), Image.LANCZOS).save(
            output, quality=88, alpha_quality=100, method=6
        )
        total += output.stat().st_size
print(f"total {total // 1024}KB")
