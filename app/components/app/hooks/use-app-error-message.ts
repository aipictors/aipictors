import { useTranslation } from "~/hooks/use-translation"

/**
 * エラーメッセージを翻訳する
 */
export function useAppErrorMessage(message: string): string {
  const t = useTranslation()

  if (message === "The operation was aborted due to timeout") {
    return t(
      "処理に時間がかかりすぎたため、エラーが発生しました。",
      "The operation timed out because it took too long.",
    )
  }

  return message
}
