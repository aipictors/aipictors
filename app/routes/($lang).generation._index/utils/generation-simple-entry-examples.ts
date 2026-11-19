/**
 * かんたん入口の作例（運営が選んだ固定のもの）
 *
 * 選び方
 * - 公開中の全年齢（rating G）・センシティブではない・プロンプト公開の作品だけ。画像は目で見て確認したもの
 * - 押すと入るプロンプトは、作品の公開プロンプトそのまま（LoRA の指定だけ外す）か、
 *   画像に合わせて運営が書いた短い英語のプロンプト。非公開のプロンプトは使わない
 * - 作品が非公開・削除になったら、ここから外す
 */
export type GenerationSimpleEntryExample = {
  /**
   * 元の作品の ID（/posts/<id>）
   */
  workId: string
  /**
   * 作品の画像（大きいサムネイル）
   */
  imageUrl: string
  width: number
  height: number
  title: string
  enTitle: string
  /**
   * 押すと入力欄に入るプロンプト
   */
  prompt: string
  /**
   * prompt が作品の公開プロンプトそのものか（false は運営が書いたもの）
   */
  isWorkPrompt: boolean
}

export const GENERATION_SIMPLE_ENTRY_EXAMPLES: GenerationSimpleEntryExample[] =
  [
    {
      workId: "361648",
      imageUrl:
        "https://files.aipictors.com/0cc71f47-9301-453b-862f-1119564f7966",
      width: 410,
      height: 600,
      title: "水彩でお料理",
      enTitle: "Watercolor cooking",
      prompt:
        "kawaii, pastel colour, soft light, watercolor, cooking, girl, smile",
      isWorkPrompt: true,
    },
    {
      workId: "285774",
      imageUrl:
        "https://files.aipictors.com/8ab89afa-cedf-4ae6-bd07-aa7d7862f03c",
      width: 600,
      height: 1440,
      title: "宇宙の猫タワー",
      enTitle: "Cat tower in space",
      prompt:
        "chibi, many cute cats piled up on a cat tower, outer space, planets, stars, happy, smile",
      isWorkPrompt: false,
    },
    {
      workId: "318306",
      imageUrl:
        "https://files.aipictors.com/3f8a29c7-6cfc-4860-a68e-d29670bb6655",
      width: 400,
      height: 600,
      title: "宇宙旅行へ",
      enTitle: "Off to space",
      prompt:
        "kawaii, pastel colour, soft light, space travel, spaceship, earth in the background, girl, skirt, smile, waving, upper body",
      isWorkPrompt: true,
    },
    {
      workId: "242233",
      imageUrl:
        "https://files.aipictors.com/b28eb3a9-38cb-48d6-b62a-6ea284e7e39f",
      width: 400,
      height: 600,
      title: "雪の神社ときつね",
      enTitle: "Fox at a snowy shrine",
      prompt:
        "1girl, fox ears, fox tail, shrine maiden outfit, torii gate, snowing, winter sunrise, gloves, smile",
      isWorkPrompt: false,
    },
    {
      workId: "306511",
      imageUrl:
        "https://files.aipictors.com/6aecae32-36cd-422b-b660-0b8a96484a0a",
      width: 600,
      height: 410,
      title: "ケーキ屋さん",
      enTitle: "Cake shop",
      prompt:
        "cute cake shop, pastry chef costume, making sweets, strawberry cakes, warm light, happy, smile",
      isWorkPrompt: false,
    },
    {
      workId: "263991",
      imageUrl:
        "https://files.aipictors.com/7f5c1f7c-f008-42bb-be3a-f09196e030c1",
      width: 400,
      height: 600,
      title: "花びらの舞う丘",
      enTitle: "Petals in the wind",
      prompt:
        "1girl, white dress, long hair, flower field, falling petals, looking up at the sky, windy, soft light",
      isWorkPrompt: false,
    },
    {
      workId: "424807",
      imageUrl:
        "https://files.aipictors.com/f0086f57-b57c-483f-9ec2-a6c078d60938",
      width: 410,
      height: 600,
      title: "海の見えるお寿司屋さん",
      enTitle: "Sushi by the sea",
      prompt:
        "1girl, elf, black cat on head, sushi restaurant, plates of sushi and sashimi, ocean view from the window, summer sunlight, smile",
      isWorkPrompt: false,
    },
    {
      workId: "508346",
      imageUrl:
        "https://files.aipictors.com/5e37913f-835a-440b-8815-8bad7a35c6a5",
      width: 600,
      height: 410,
      title: "宇宙ねこ",
      enTitle: "Space cat",
      prompt:
        "1girl, cat ears, pink space suit, cat ear space helmet, floating in space, galaxy, meteor shower, spread arms, smile",
      isWorkPrompt: false,
    },
  ]
