type Props = {
  name: string
  worksCount: number
  /** 0 始まり */
  page: number
  pageCount: number
  /** 一覧の先頭の作品のタイトル（説明文に入れて、ページごとに違う説明にする） */
  workTitles: string[]
  /** 画像生成のモデルの種類（SDXL など） */
  modelType: string | null
  lang?: string
}

/**
 * モデルの作品一覧のタイトルと説明文
 * 作品数とページ番号を入れて、ページごとに違うタイトル・説明にする（同じタイトルのページが並ばないように）
 */
export const toAiModelPageText = (props: Props) => {
  const isEn = props.lang === "en"
  const pageNumber = props.page + 1
  const count = props.worksCount.toLocaleString(isEn ? "en-US" : "ja-JP")
  const titles = props.workTitles
    .map((title) => title.trim())
    .filter((title) => title.length > 0)
    .slice(0, 2)
  const isPaged = props.page > 0 && props.page < props.pageCount
  const pageSuffix = isPaged
    ? isEn
      ? ` (page ${pageNumber} of ${props.pageCount})`
      : `（${pageNumber}/${props.pageCount}ページ）`
    : ""
  const typeText = props.modelType ? `${props.modelType} ` : ""

  if (isEn) {
    return {
      title: `${props.name} AI Art & Prompts - ${count} works${pageSuffix}`,
      description: [
        `${count} AI images generated with the ${typeText}model ${props.name}.`,
        titles.length > 0
          ? `Featuring ${titles.map((title) => `"${title}"`).join(", ")} and more.`
          : "",
        "Show only works with prompts or sort by popularity.",
        isPaged ? `Page ${pageNumber}.` : "",
      ]
        .filter((text) => text.length > 0)
        .join(" "),
    }
  }

  return {
    title: `${props.name}のAIイラスト作品一覧（${count}件）${pageSuffix}`,
    description: [
      `${typeText}モデル「${props.name}」で生成されたAIイラスト・画像${count}件の一覧です。`,
      titles.length > 0
        ? `${titles.map((title) => `「${title}」`).join("")}など。`
        : "",
      "プロンプト（呪文）付きの作品だけの表示や、人気順の並び替えもできます。",
      isPaged ? `${pageNumber}ページ目。` : "",
    ].join(""),
  }
}
