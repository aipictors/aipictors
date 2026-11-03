import type { Dispatch } from "react"
import { toast } from "sonner"
import type { PostImageFormInputAction } from "~/routes/($lang)._main.new.image/reducers/actions/post-image-form-input-action"
import type { PostImageFormInputState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-input-state"

export type PostFormGeneratedContent = {
  title?: string
  description?: string
  tags?: string[]
  titleEn?: string
  descriptionEn?: string
  tagsEn?: string[]
}

const MAX_TAGS = 10

/**
 * 追加するタグを選ぶ（上限まで。今あるタグと同じものは除く）
 */
export const pickGeneratedTagsToAdd = (props: {
  tags: string[]
  currentTags: { text: string }[]
}) => {
  const currentTagCount = props.currentTags.length
  const added: string[] = []

  for (const tag of props.tags) {
    if (tag.trim() !== "" && currentTagCount + added.length < MAX_TAGS) {
      // 重複チェック: 既存のタグと重複しないかを確認
      const isDuplicate = props.currentTags.some(
        (existingTag) =>
          existingTag.text.toLowerCase() === tag.trim().toLowerCase(),
      )

      if (!isDuplicate) {
        added.push(tag.trim())
      }
    }
  }

  return {
    tags: added,
    isLimitReached: currentTagCount + added.length >= MAX_TAGS,
  }
}

const addGeneratedTags = (props: {
  tags: string[]
  currentTags: { text: string }[]
  dispatchInput: Dispatch<PostImageFormInputAction>
}) => {
  const picked = pickGeneratedTagsToAdd(props)

  for (const tag of picked.tags) {
    props.dispatchInput({
      type: "ADD_TAG",
      payload: {
        id: Math.random().toString(),
        text: tag,
      },
    })
  }

  // 上限に達した場合はユーザーに通知
  if (picked.isLimitReached) {
    toast.warning(
      "タグの上限は10個までです。一部のタグが追加されませんでした。",
    )
  }
}

/**
 * AI生成されたコンテンツをフォームに反映する
 */
export const applyGeneratedContentToPostForm = (props: {
  data: PostFormGeneratedContent
  tags: PostImageFormInputState["tags"]
  dispatchInput: Dispatch<PostImageFormInputAction>
}) => {
  const { data, dispatchInput } = props

  // タイトルが設定されている場合は日本語タイトルを設定
  if (data.title && data.title.trim() !== "") {
    dispatchInput({
      type: "SET_TITLE",
      payload: data.title,
    })
  }

  // 英語タイトルが設定されている場合は英語タイトルを設定
  if (data.titleEn && data.titleEn.trim() !== "") {
    dispatchInput({
      type: "SET_EN_TITLE",
      payload: data.titleEn,
    })
  }

  // 説明文が設定されている場合は日本語説明文を設定
  if (data.description && data.description.trim() !== "") {
    dispatchInput({
      type: "SET_CAPTION",
      payload: data.description,
    })
  }

  // 英語説明文が設定されている場合は英語説明文を設定
  if (data.descriptionEn && data.descriptionEn.trim() !== "") {
    dispatchInput({
      type: "SET_EN_CAPTION",
      payload: data.descriptionEn,
    })
  }

  // タグが設定されている場合はタグを追加（上限10個まで）
  if (data.tags && data.tags.length > 0) {
    addGeneratedTags({
      tags: data.tags,
      currentTags: props.tags,
      dispatchInput,
    })
  }

  // 英語タグが設定されている場合は英語タグを追加（上限10個まで）
  if (data.tagsEn && data.tagsEn.length > 0) {
    addGeneratedTags({
      tags: data.tagsEn,
      currentTags: props.tags,
      dispatchInput,
    })
  }
}
