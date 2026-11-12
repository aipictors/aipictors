"""
generate-decorations.mjs の PNG を WebP にまとめる

python3 scripts/avatar-frames/pack-decorations.py <PNG のフォルダ> public/avatar-frames/deco

<slug>.webp: 止まった絵（一覧で使う）
<slug>.anim.webp: 動く絵（プロフィールと枠選びで使う）
"""
import json
import sys
from pathlib import Path

from PIL import Image

source, output = Path(sys.argv[1]), Path(sys.argv[2])
output.mkdir(parents=True, exist_ok=True)

STATIC_FRAME = 4
ANIMATED_SIZE = 256
FRAME_MS = 80

total = 0
for folder in sorted(p for p in source.iterdir() if p.is_dir()):
    paths = sorted(folder.glob("*.png"))
    frames = [Image.open(path).convert("RGBA") for path in paths]
    meta = folder / "meta.json"
    frame_ms = json.loads(meta.read_text())["frameMs"] if meta.exists() else FRAME_MS
    frames[STATIC_FRAME].save(output / f"{folder.name}.webp", quality=88, method=6)
    small = [f.resize((ANIMATED_SIZE, ANIMATED_SIZE), Image.LANCZOS) for f in frames]
    small[0].save(
        output / f"{folder.name}.anim.webp",
        save_all=True,
        append_images=small[1:],
        duration=frame_ms,
        loop=0,
        quality=72,
        method=4,
        minimize_size=True,
    )
    sizes = [(output / f"{folder.name}{ext}").stat().st_size for ext in (".webp", ".anim.webp")]
    total += sum(sizes)
    print(f"{folder.name}: {sizes[0] // 1024}KB / {sizes[1] // 1024}KB")
print(f"total {total // 1024}KB")
