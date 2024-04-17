import { GenerationForm } from "@/[lang]/generation/_components/generation-form"
import text from "@/_assets/terms.md?raw"
import { AppLoadingPage } from "@/_components/app/app-loading-page"

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
