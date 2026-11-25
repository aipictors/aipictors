# Aipictors official SDXL LoRA pages: write detail entries (ja + en)

Input: `data/bundle.json` (53 items). Each is a LoRA from Civitai that Aipictors is adding to its image generator as an official LoRA (license allows use on generation services). Fields: name (Aipictors LoRA name, used in prompts as `<lora:name:weight>`), civitaiUrl, title, creator, tags, baseModel (the version Aipictors installed: Illustrious / NoobAI / SDXL 1.0), otherBases, versionName, publishedAt, trainedWords, description, versionDescription (Civitai text, HTML stripped), sampleSettings, examplePrompts.

Output: `data/out.json` — JSON array, same order and count (53), each object exactly:

```json
{
  "name": "detail_tweaker_xl",
  "displayName": "ディテール調整（Detail Tweaker XL）",
  "genre": 1,
  "description": "1〜2文の短い日本語説明（生成画面の一覧に出る。60字以内目安）",
  "triggerWords": ["..."],
  "weight": { "recommended": 1.0, "min": -2.0, "max": 2.0 },
  "ja": { "summary": "2〜4文", "features": ["3〜5個"], "tips": ["0〜4個"] },
  "en": { "displayName": "Detail Tweaker XL", "description": "1 short sentence", "summary": "...", "features": ["..."], "tips": ["..."] }
}
```

Rules:
- genre (Aipictors LoRA category): 1 絵柄 (art style / quality / detail), 2 表情, 3 目 (eyes), 5 背景 (backgrounds, scenery, crowds), 6 肌 (skin), 7 全体エフェクト (lighting, color, darkness, zoom, overall effects, poses/composition sliders), 8 キャラクター (character sheets, clothing concepts). Pick the closest.
- displayName: short natural Japanese name + the original English name in （） when helpful. en.displayName: the Civitai title cleaned up (drop version tags, base-model brackets, emojis).
- triggerWords: from trainedWords only; drop empty, NSFW, or meaningless entries (e.g. file names). For multi-style packs, list only the words relevant to the installed version. [] if none.
- weight: recommended strength and sensible range ONLY if the description states it (sliders often say e.g. -3〜3). Otherwise use {"recommended": 1.0, "min": null, "max": null}. Never invent numbers.
- Write summary/features/tips in your own words from the input (summarize, don't copy long passages). Facts must come from the input. If the source says little, write less. tips = how to use: trigger words, strength, negative weight effect for sliders, which checkpoints it suits (if stated), prompt tips. Mention trigger words / weight in tips when known.
- Japanese: plain friendly です/ます, short sentences, no hype words (「最適」「圧倒的」「最強」など避ける). English: natural, concise.
- Never describe sexual content, nudity, or body-part sliders' sexual uses even if the source mentions them. Do not mention Civitai Buzz, donations, Patreon, or the creator's other paid offers.
- Don't mention Aipictors in the text.
- Validate: `python3 -c "import json;d=json.load(open('data/out.json'));assert len(d)==53"`, and every name matches the input in order.
- Reply with only: count, and any items where the source was empty/ambiguous or looked NSFW-oriented (so the parent can drop them).
