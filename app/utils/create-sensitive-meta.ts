import { config, type MetaData } from "~/config"
import { createMeta } from "~/utils/create-meta"

/**
 * R18 のページの meta
 * SNS のカードや検索結果に成人向けの画像を出さないよう、og:image は常に既定の画像にする
 * （<meta name="rating" content="adult"> は app/root.tsx が /r のページすべてに出す）
 */
export function createSensitiveMeta(
  data: MetaData,
  dynamicData?: { [key: string]: string },
  lang?: string,
) {
  return createMeta(
    { ...data, image: config.defaultOgpImageUrl },
    dynamicData,
    lang,
  )
}
