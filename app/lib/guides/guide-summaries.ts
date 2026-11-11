/**
 * 解説記事（/guides）の一覧。本文は guide-articles.ts（記事のページだけが読み込む）
 * 呪文まとめなど、ほかのページから記事へリンクするときはこの一覧を使う
 */
export const GUIDE_SUMMARIES = [
  {
    slug: "prompt-basics",
    title: "AIイラストの呪文（プロンプト）の書き方",
    description: "語の並べ方・強調・品質の指定など、最初に知っておきたい基本と例",
  },
  {
    slug: "negative-prompt",
    title: "ネガティブプロンプトの使い方",
    description: "描いてほしくないものを外す指定。よく使う語と入れすぎの注意点",
  },
  {
    slug: "choose-model",
    title: "AIイラストのモデルの選び方",
    description: "アニメ調・リアル・背景など、描きたいものに合うモデルの探し方",
  },
  {
    slug: "character-prompts",
    title: "キャラクターを安定して描く呪文のコツ",
    description: "名前・髪型・衣装の書き方と、同じキャラクターを続けて描く工夫",
  },
  {
    slug: "generate-and-post",
    title: "Aipictorsで生成して投稿するまで",
    description: "無料の生成から、呪文つきで作品を投稿するまでの手順",
  },
] as const

export type GuideSlug = (typeof GUIDE_SUMMARIES)[number]["slug"]
