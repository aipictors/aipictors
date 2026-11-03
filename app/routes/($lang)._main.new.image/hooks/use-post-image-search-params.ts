import type { Dispatch } from "react"
import { useEffect, useRef } from "react"
import type { PostImageFormInputAction } from "~/routes/($lang)._main.new.image/reducers/actions/post-image-form-input-action"
import type { PostImageFormInputState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-input-state"

type Props = {
  searchParams: URLSearchParams
  tags: PostImageFormInputState["tags"]
  dailyThemes: { id: string; title: string; dateText: string }[] | undefined
  now: Date
  dispatchInput: Dispatch<PostImageFormInputAction>
}

/**
 * URL の tag・theme をフォームに入れる
 */
export function usePostImageSearchParams(props: Props) {
  const { searchParams, tags, dailyThemes, now, dispatchInput } = props

  const appliedInitialTagParamsRef = useRef<Set<string>>(new Set())

  // クエリパラメータからイベント参加情報とタグを処理
  useEffect(() => {
    const tagParam = searchParams.get("tag")

    if (!tagParam) {
      return
    }

    const decodedTag = decodeURIComponent(tagParam)

    if (appliedInitialTagParamsRef.current.has(decodedTag)) {
      return
    }

    appliedInitialTagParamsRef.current.add(decodedTag)

    const hasTagAlready = tags.some((tag) => tag.text === decodedTag)

    if (hasTagAlready) {
      return
    }

    dispatchInput({
      type: "ADD_TAG",
      payload: {
        id: Math.random().toString(),
        text: decodedTag,
      },
    })
  }, [tags, searchParams])

  // お題ページの「このお題で投稿する」から来たら、今日のお題に参加した状態にする
  const appliedThemeParamRef = useRef(false)

  useEffect(() => {
    const themeParam = searchParams.get("theme")

    if (!themeParam || appliedThemeParamRef.current) {
      return
    }

    const todayText = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

    const theme = dailyThemes?.find((item) => {
      return item.id === themeParam && item.dateText === todayText
    })

    if (theme === undefined) {
      return
    }

    appliedThemeParamRef.current = true

    dispatchInput({
      type: "SET_THEME_ID",
      payload: { themeId: theme.id, themeTitle: theme.title },
    })
  }, [searchParams, dailyThemes])
}
