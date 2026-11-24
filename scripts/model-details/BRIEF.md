# Aipictors model pages: write model detail entries (ja + en)

Input: `data/bundle_<K>.json` (array). Each item is one image-generation model on Aipictors with:
- generatorId, displayName, file, aipictorsType (SD1/SD2/SDXL/FLUX/GEMINI), aipictorsStyle, aipictorsExplanation (old auto-written text, often generic or WRONG — do not trust it except for facts like steps/CFG/author it states explicitly), dbLicense
- civitai (optional): url, name, creator, tags, versionName, baseModel, publishedAt, trainedWords, description, versionDescription
- huggingface (optional): url, license, readme

Output: `data/out_<K>.json` — a JSON array, one object per input item, same order, exactly this shape:

```json
{
  "generatorId": 730,
  "source": { "kind": "civitai", "url": "https://civitai.com/models/...", "label": "Civitai" },
  "links": [{ "label": "Hugging Face", "url": "https://huggingface.co/..." }],
  "creator": "Tongyi-MAI",
  "baseModel": "SD 1.5",
  "license": "CreativeML Open RAIL-M",
  "versionName": "v1.0",
  "publishedAt": "2024-01-31",
  "triggerWords": [],
  "ja": {
    "summary": "2〜4文。どんな絵が得意なモデルか、誰が作ったか、元になったモデル。",
    "features": ["3〜5個の短い特徴"],
    "tips": ["0〜4個。推奨設定（サンプラー・ステップ・CFG・Clip skip・解像度・VAE）やプロンプトのコツ。元情報に書いてあるものだけ"]
  },
  "en": { "summary": "...", "features": ["..."], "tips": ["..."] }
}
```

Rules:
- `source.kind`: "civitai" if civitai exists, else "huggingface" if huggingface exists, else "official" (FLUX → https://blackforestlabs.ai/ , Gemini Nano Banana → https://deepmind.google/models/gemini-image/ ), else "aipictors" with url null and label "Aipictors". `links`: other sources (e.g. the Hugging Face page when source is Civitai). Only URLs present in the input or the two official URLs above.
- Use null for unknown creator/baseModel/license/versionName/publishedAt. `license`: from civitai/huggingface/dbLicense; do not guess.
- Write the summary/features/tips yourself from the source descriptions, in your own words (summarize, do not copy long passages; translating short facts is fine). Facts must come from the input. If the sources say little, write less — never invent features, authors, dates, or settings.
- Japanese: plain, friendly です/ます, short sentences, no hype words (「最適」「圧倒的」など避ける). English: natural, concise.
- Steps/CFG for Aipictors-specific behavior (e.g. "自動で 9 ステップ・CFG 1", "LoRA・ControlNet は使えません") from aipictorsExplanation are true facts about Aipictors — include them in tips.
- Mention Aipictors only where useful ("Aipictors の生成機で使えます" is unnecessary — the page already says it).
- Never describe sexual content, nudity, or minors-related content even if the source has it. For models whose names or sources are about young-looking characters (e.g. loliDiffusion), describe only the art style (anime, cute/chibi proportions, coloring) neutrally and briefly. Leave NSFW-only tips out.
- triggerWords: from civitai trainedWords only (drop empty or NSFW ones), else [].
- Validate: the output must parse with `python3 -c "import json;json.load(open('data/out_<K>.json'))"` and have the same count as the input. Then reply with only the count and any models where the sources were empty or ambiguous.
