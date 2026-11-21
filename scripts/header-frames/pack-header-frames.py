"""
generate-header-frames.mjs の PNG を WebP にまとめる

python3 scripts/header-frames/pack-header-frames.py <PNG のフォルダ> public/header-frames [slug...]

<slug>.<pc|sp>.webp: 止まった絵（ふち・角の飾り。動きを減らす設定の人と、枠選びの一覧はこれだけ）
<slug>.<pc|sp>.motion.webp: 動くものだけの絵（ほとんど透明。プロフィールでは止まった絵の上に重ねる）
<slug>.<pc|sp>.nopictor.webp: ぴくたーちゃんを外した止まった絵（動く絵は「あり」と同じものを重ねる）
"""
import json
import sys
from pathlib import Path

from PIL import Image

source, output = Path(sys.argv[1]), Path(sys.argv[2])
slugs = sys.argv[3:]
output.mkdir(parents=True, exist_ok=True)

FRAME_MS = 150

total = 0
for folder in sorted(p for p in source.iterdir() if p.is_dir() and (not slugs or p.name.split(".")[0] in slugs)):
    meta = folder / "meta.json"
    frame_ms = json.loads(meta.read_text())["frameMs"] if meta.exists() else FRAME_MS
    Image.open(folder / "base.png").convert("RGBA").save(output / f"{folder.name}.webp", quality=86, method=6)
    if folder.name.endswith(".nopictor"):
        size = (output / f"{folder.name}.webp").stat().st_size
        total += size
        print(f"{folder.name}: {size // 1024}KB", flush=True)
        continue
    frames = [Image.open(path).convert("RGBA") for path in sorted(folder.glob("[0-9][0-9].png"))]
    frames[0].save(
        output / f"{folder.name}.motion.webp",
        save_all=True,
        append_images=frames[1:],
        duration=frame_ms,
        loop=0,
        quality=70,
        method=6,
        minimize_size=True,
    )
    sizes = [(output / f"{folder.name}{ext}").stat().st_size for ext in (".webp", ".motion.webp")]
    total += sum(sizes)
    print(f"{folder.name}: {sizes[0] // 1024}KB + {sizes[1] // 1024}KB = {sum(sizes) // 1024}KB", flush=True)
print(f"total {total // 1024}KB")
