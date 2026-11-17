import type { AiModel } from "~/routes/($lang)._main.new.image/types/model"

/**
 * 比べるためにモデル名を整える
 * 「Krea2」で「Krea 2」が、「flux2」で「FLUX.2」が見つかるように、大文字小文字・空白・記号の違いを無視する
 */
const toComparableModelName = (text: string) => {
  return text.toLowerCase().replace(/[\s\-_.・()（）]/g, "")
}

/**
 * モデルを名前順に並べ、検索語で絞り込む
 */
export const filterAiModels = (models: AiModel[], searchTerm: string) => {
  const term = toComparableModelName(searchTerm)
  return [...models]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((model) => toComparableModelName(model.name).includes(term))
}
