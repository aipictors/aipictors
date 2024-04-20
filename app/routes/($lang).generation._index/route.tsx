import text from "@/_assets/terms.md?raw"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { GenerationForm } from "@/routes/($lang).generation._index/_components/generation-form"

export function HydrateFallback() {
  return <AppLoadingPage />
}

/**
 * 画像生成
 * @returns
 */
export default function GenerationPage() {
  return <GenerationForm termsMarkdownText={text} />
}
