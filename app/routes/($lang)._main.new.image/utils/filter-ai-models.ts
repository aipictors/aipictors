import type { AiModel } from "~/routes/($lang)._main.new.image/types/model"

/**
 * 比べるためにモデル名を整える
 * 「Krea2」で「Krea 2」が、「flux2」で「FLUX.2」が見つかるように、大文字小文字・全角半角・空白・記号の違いを無視する
 * （API がモデルを足すときに同じモデルとみなす規則と同じ。aipictors-system lib/ai-model-name.ts）
 */
export const toComparableModelName = (text: string) => {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\-_.・()（）]/g, "")
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

/**
 * 入れた名前を新しいモデルとして足せるか（空でなく、表記ゆれを除いて同じ名前のモデルが一覧にない）
 */
export const canAddAiModel = (models: AiModel[], name: string) => {
  const term = toComparableModelName(name.trim())
  if (term.length === 0) return false
  return !models.some((model) => toComparableModelName(model.name) === term)
}
