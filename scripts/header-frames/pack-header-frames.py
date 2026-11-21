"""
generate-header-frames.mjs の PNG を WebP にまとめる

python3 scripts/header-frames/pack-header-frames.py <PNG のフォルダ> public/header-frames

<slug>.<pc|sp>.webp: 止まった絵（動きを減らす設定の人と、枠選びの一覧で使う）
<slug>.<pc|sp>.anim.webp: 動く絵（プロフィールで使う）
"""
import json
import sys
from pathlib import Path

from PIL import Image

source, output = Path(sys.argv[1]), Path(sys.argv[2])
output.mkdir(parents=True, exist_ok=True)

STATIC_FRAME = 4
# 動く絵は少し小さくして軽くする（PC の 1200 → 840、スマホの 1000 → 700）
ANIMATED_SCALE = 0.7
FRAME_MS = 150

total = 0
for folder in sorted(p for p in source.iterdir() if p.is_dir()):
    paths = sorted(folder.glob("*.png"))
    frames = [Image.open(path).convert("RGBA") for path in paths]
    meta = folder / "meta.json"
    frame_ms = json.loads(meta.read_text())["frameMs"] if meta.exists() else FRAME_MS
    frames[STATIC_FRAME].save(output / f"{folder.name}.webp", quality=86, method=6)
    w, h = frames[0].size
    size = (round(w * ANIMATED_SCALE), round(h * ANIMATED_SCALE))
    small = [f.resize(size, Image.LANCZOS) for f in frames]
    small[0].save(
        output / f"{folder.name}.anim.webp",
        save_all=True,
        append_images=small[1:],
        duration=frame_ms,
        loop=0,
        quality=60,
        method=4,
        minimize_size=True,
    )
    sizes = [(output / f"{folder.name}{ext}").stat().st_size for ext in (".webp", ".anim.webp")]
    total += sum(sizes)
    print(f"{folder.name}: {sizes[0] // 1024}KB / {sizes[1] // 1024}KB")
print(f"total {total // 1024}KB")
