import type { IntrospectionEnum } from "~/lib/introspection-enum"

export type ReadingKind = "novel" | "column"

export type ReadingSort = "new" | "popular"

/** [日本語, English] */
type Text = readonly [string, string]

type ReadingConfig = {
  kind: ReadingKind
  path: string
  workType: IntrospectionEnum<"WorkType">
  /** 指定がないときの並び順 */
  defaultSort: ReadingSort
  name: Text
  h1: Text
  lead: Text
  description: Text
  searchPlaceholder: Text
  hints: readonly Text[]
  /** もう一方の読みものへの案内 */
  otherLink: { path: string; label: Text }
}

export const READING_CONFIGS: Record<ReadingKind, ReadingConfig> = {
  novel: {
    kind: "novel",
    path: "/novels",
    workType: "NOVEL",
    defaultSort: "new",
    name: ["小説", "Novels"],
    h1: ["AI小説の一覧", "AI Novels"],
    lead: [
      "AIと一緒に書かれた小説や、AIイラストの挿絵がついた物語を読めます。",
      "Read stories written with AI and tales illustrated with AI art.",
    ],
    description: [
      "Aipictorsに投稿されたAI小説の一覧です。AIと一緒に書かれた物語や、AIイラストの挿絵つきの小説を、新着順・人気順で読めます。",
      "Browse AI novels posted on Aipictors. Read stories written with AI and illustrated with AI art, sorted by latest or most liked.",
    ],
    searchPlaceholder: ["小説の題名でさがす", "Search novels"],
    hints: [
      ["今日はどんなお話を読みましょうか？", "What kind of story shall we read today?"],
      [
        "続きものは、作者さんのページから順番に読めますよ！",
        "You can read a series in order from the author's page!",
      ],
      [
        "気に入ったお話には、いいねで感想を伝えてみましょう！",
        "Liked a story? Let the author know with a like!",
      ],
    ],
    otherLink: { path: "/notes", label: ["コラムを読む", "Read columns"] },
  },
  column: {
    kind: "column",
    path: "/notes",
    workType: "COLUMN",
    // 投稿が少なく、古くても役に立つ記事が多いので、よく読まれているものを先に出す
    defaultSort: "popular",
    name: ["コラム", "Columns"],
    h1: ["AIイラストのコラム一覧", "AI Art Columns"],
    lead: [
      "AIイラストの作り方のコツや、制作の裏話、使ってみた感想を読めます。",
      "Read tips on making AI art, behind-the-scenes stories, and hands-on impressions.",
    ],
    description: [
      "Aipictorsに投稿されたコラムの一覧です。AIイラストの作り方のコツ、プロンプトの工夫、制作の裏話などを、人気順・新着順で読めます。",
      "Browse columns posted on Aipictors, including AI art tips, prompt ideas, and behind-the-scenes stories, sorted by most liked or latest.",
    ],
    searchPlaceholder: ["コラムの題名でさがす", "Search columns"],
    hints: [
      [
        "プロンプトのコツや制作の裏話が読めますよ！",
        "You'll find prompt tips and behind-the-scenes stories here!",
      ],
      [
        "読んだら、すぐ試してみたくなるかもしれません！",
        "You might want to try it right after reading!",
      ],
      [
        "投稿した時期が古い記事は、今の機能と違うこともあります。ご注意くださいね！",
        "Older articles may not match today's features. Keep that in mind!",
      ],
    ],
    otherLink: { path: "/novels", label: ["小説を読む", "Read novels"] },
  },
}

export const READING_EMPTY_HINTS: readonly Text[] = [
  [
    "うーん、見つかりませんでした…。短い言葉でさがしてみませんか？",
    "Hmm, nothing here... How about trying a shorter word?",
  ],
]
