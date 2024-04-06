"use client"

import { GenerationConfigContext } from "@/[lang]/generation/_contexts/generation-config-context"

type Props = {
  submission: React.ReactNode
}

/**
 * 画像生成画面のヘッダー部分
 * @param props
 * @returns
 */
export const GenerationHeaderView = (props: Props) => {
  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  if (
    state === "HISTORY_LIST_FULL" ||
    state === "HISTORY_PREVIEW" ||
    state === "WORK_LIST_FULL" ||
    state === "WORK_PREVIEW" ||
    state === "HISTORY_VIEW_ON_MAIN_AND_HEADER"
  ) {
    return null
  }

  return props.submission
}
