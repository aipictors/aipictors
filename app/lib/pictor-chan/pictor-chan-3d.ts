/**
 * ぴくたーちゃんの 3D モデルの配布ファイル（assets.aipictors.com に置いている。作り方は scripts/pictor-chan-3d/README.md）
 */

export const PICTOR_CHAN_3D_VERSION = "1.0"

const BASE_URL = "https://assets.aipictors.com/pictor-chan/3d/v1.0"

type Text = readonly [ja: string, en: string]

export const PICTOR_CHAN_3D_FILES: {
  features: readonly Text[]
  downloads: readonly { name: Text; note: Text; size: string; url: string }[]
} = {
  features: [
    [
      "身長 1.2m・約 2.4 万ポリゴン・人型のボーン入り",
      "1.2 m tall, about 24k triangles, humanoid rig",
    ],
    [
      "モーション 5 種（待ち・走り・ジャンプ・転ぶ・ダメージ）",
      "5 motions (idle, run, jump, fall, hurt)",
    ],
    [
      "表情 9 種（まばたき・ウインク・にっこり・びっくり など）",
      "9 expressions (blink, wink, joy, surprised and more)",
    ],
    [
      "VRM / glTF / FBX / Blender の 4 形式",
      "4 formats: VRM, glTF, FBX and Blender",
    ],
  ],
  downloads: [
    {
      name: ["ぜんぶ入り（ZIP）", "Everything (ZIP)"],
      note: [
        "VRM・GLB・FBX・Blender・テクスチャ",
        "VRM, GLB, FBX, Blender, textures",
      ],
      size: "55MB",
      url: `${BASE_URL}/PictorChan_v1.0.zip`,
    },
    {
      name: ["VRM", "VRM"],
      note: ["VRM 1.0（アバター・配信向け）", "VRM 1.0 (avatars, streaming)"],
      size: "6.9MB",
      url: `${BASE_URL}/PictorChan_v1.0.vrm`,
    },
    {
      name: ["glTF（GLB）", "glTF (GLB)"],
      note: ["Web・Godot・Blender 向け", "For the web, Godot, Blender"],
      size: "4.9MB",
      url: `${BASE_URL}/PictorChan_v1.0.glb`,
    },
    {
      name: ["FBX（ZIP）", "FBX (ZIP)"],
      note: ["Unity・Unreal Engine 向け", "For Unity, Unreal Engine"],
      size: "21MB",
      url: `${BASE_URL}/PictorChan_v1.0_FBX.zip`,
    },
  ],
}
