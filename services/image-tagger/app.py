"""
作品画像の年齢区分を判定する小さな API（サーバー内だけで使う）

- モデル: SmilingWolf/wd-vit-tagger-v3（アニメ・AI イラスト向けのタグ付けモデル。Apache-2.0）
- CPU だけで動く。1 枚 0.5〜2 秒ほど。外部の有料 API は使わない
- POST /classify {"images": ["https://...", ...]} → 画像ごとの判定と、作品全体の判定
"""

import io
import json
import os
import threading
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import numpy as np
import onnxruntime as ort
import pandas as pd
from PIL import Image

MODEL_DIR = os.environ.get("MODEL_DIR", "/model")
PORT = int(os.environ.get("PORT", "8510"))
THREADS = int(os.environ.get("THREADS", "2"))
MAX_IMAGES = int(os.environ.get("MAX_IMAGES", "20"))
ALLOWED_HOSTS = tuple(
    os.environ.get("ALLOWED_HOSTS", "aipictors.com,aipictors.workers.dev").split(",")
)

options = ort.SessionOptions()
options.intra_op_num_threads = THREADS
options.inter_op_num_threads = 1
session = ort.InferenceSession(
    os.path.join(MODEL_DIR, "model.onnx"), options, providers=["CPUExecutionProvider"]
)
tags = pd.read_csv(os.path.join(MODEL_DIR, "selected_tags.csv"))

NAMES = tags["name"].tolist()
CATEGORIES = tags["category"].tolist()
INPUT = session.get_inputs()[0]
SIZE = INPUT.shape[1]
INDEX = {name: i for i, name in enumerate(NAMES)}
RATING_INDEX = {NAMES[i]: i for i in range(len(NAMES)) if CATEGORIES[i] == 9}
lock = threading.Lock()

# 判定に使うタグ（しきい値はここで調整する）
GENITAL_TAGS = ["pussy", "penis", "sex", "anus", "cum", "testicles", "fellatio"]
NIPPLE_TAGS = ["nipples"]
# 規約で R-15 にあたるもの（下着・水着）。モデルの「sensitive」は普通の絵にも付くので使わない
R15_TAGS = ["panties", "underwear", "bikini", "swimsuit", "lingerie"]
GORE_TAGS = ["guro", "intestines", "decapitation", "severed_head", "disembowelment"]
CHILD_TAGS = ["child", "loli", "shota", "aged_down", "onii-shota"]
REALISTIC_TAGS = ["realistic", "photorealistic"]
UNCENSORED_TAGS = ["uncensored"]
CENSORED_TAGS = ["censored", "mosaic_censoring", "bar_censor", "novelty_censor"]

# 年齢区分の重さ（大きいほど厳しい）
SEVERITY = {"G": 0, "R15": 1, "R18": 2, "R18G": 3}


def score(probs, names):
    return max((float(probs[INDEX[n]]) for n in names if n in INDEX), default=0.0)


def load_image(url):
    host = urllib.request.urlparse(url).hostname or ""
    if not any(host == h or host.endswith("." + h) for h in ALLOWED_HOSTS):
        raise ValueError(f"許可していないホストです: {host}")
    req = urllib.request.Request(url, headers={"User-Agent": "aipictors-image-tagger"})
    with urllib.request.urlopen(req, timeout=20) as res:
        data = res.read(32 * 1024 * 1024)
    image = Image.open(io.BytesIO(data))
    image.seek(0)
    image = image.convert("RGBA")
    background = Image.new("RGBA", image.size, (255, 255, 255, 255))
    background.alpha_composite(image)
    image = background.convert("RGB")
    width, height = image.size
    side = max(width, height)
    square = Image.new("RGB", (side, side), (255, 255, 255))
    square.paste(image, ((side - width) // 2, (side - height) // 2))
    square = square.resize((SIZE, SIZE), Image.BICUBIC)
    # モデルは BGR の 0〜255 を受け取る。顔の年齢を見るときのために元の画像も返す
    return np.asarray(square, dtype=np.float32)[:, :, ::-1][None], image


def judge(probs):
    rating = {name: float(probs[i]) for name, i in RATING_INDEX.items()}
    genital = score(probs, GENITAL_TAGS)
    nipples = score(probs, NIPPLE_TAGS)
    r15 = score(probs, R15_TAGS)
    gore = score(probs, GORE_TAGS)
    child = score(probs, CHILD_TAGS)
    realistic = score(probs, REALISTIC_TAGS)
    uncensored = score(probs, UNCENSORED_TAGS)
    censored = score(probs, CENSORED_TAGS)

    reasons = []
    level = "G"
    # 取り違えると投稿者に迷惑なので、はっきりしたものだけにする（実際の投稿で確かめたしきい値）
    if rating["questionable"] >= 0.6 or r15 >= 0.8:
        level = "R15"
        reasons.append("SUGGESTIVE")
    if rating["explicit"] >= 0.6 or genital >= 0.7 or nipples >= 0.7:
        level = "R18"
        reasons.append("NUDITY")
    if gore >= 0.4:
        level = "R18G"
        reasons.append("GORE")

    # 性器が写っているのにモザイクが無さそう（運営の確認に回す。自動では何もしない）
    need_mosaic = genital >= 0.7 and uncensored >= 0.5 and censored < 0.3

    # おすすめで中身の好み（少年・少女・制服など）を見るためのタグ（キャラクター・作品名・年齢区分は除く）
    content_tags = [
        NAMES[i]
        for i in np.argsort(probs)[::-1][:60]
        if CATEGORIES[i] == 0 and probs[i] >= 0.35
    ][:25]

    return {
        "level": level,
        "reasons": reasons,
        "tags": content_tags,
        "needMosaic": need_mosaic,
        "scores": {
            **{k: round(v, 3) for k, v in rating.items()},
            "genital": round(genital, 3),
            "nipples": round(nipples, 3),
            "underwear": round(r15, 3),
            "gore": round(gore, 3),
            "child": round(child, 3),
            "realistic": round(realistic, 3),
            "uncensored": round(uncensored, 3),
            "censored": round(censored, 3),
        },
    }


def classify(urls):
    results = []
    for url in urls[:MAX_IMAGES]:
        try:
            tensor, _ = load_image(url)
            with lock:
                probs = session.run(None, {INPUT.name: tensor})[0][0]
                result = judge(probs)
            results.append({"url": url, **result})
        except Exception as error:  # 1 枚失敗しても他は続ける
            results.append({"url": url, "error": str(error)})
    judged = [r for r in results if "error" not in r]
    level = "G"
    for r in judged:
        if SEVERITY[r["level"]] > SEVERITY[level]:
            level = r["level"]
    tags = []
    for r in judged:
        for tag in r.get("tags", []):
            if tag not in tags:
                tags.append(tag)
    return {
        "level": level,
        "tags": tags[:40],
        # センシティブ（子どもに見える人物の際どい表現）の判定は廃止した。古い呼び出し元のため常に false
        "childRisk": False,
        "needMosaic": any(r["needMosaic"] for r in judged),
        "analyzedCount": len(judged),
        "images": results,
    }


class Handler(BaseHTTPRequestHandler):
    def _send(self, status, body):
        data = json.dumps(body, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path == "/health":
            return self._send(200, {"ok": True})
        return self._send(404, {"error": "not found"})

    def do_POST(self):
        if self.path != "/classify":
            return self._send(404, {"error": "not found"})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            body = json.loads(self.rfile.read(min(length, 1024 * 1024)))
            urls = [u for u in body.get("images", []) if isinstance(u, str)]
            if not urls:
                return self._send(400, {"error": "images が空です"})
            return self._send(200, classify(urls))
        except Exception as error:
            return self._send(500, {"error": str(error)})

    def log_message(self, format, *args):
        pass


if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
