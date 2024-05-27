import text from "@/_assets/terms.md?raw"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { GenerationForm } from "@/routes/($lang).generation._index/_components/generation-form"
import { json } from "@remix-run/react"

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

export async function loader() {
  return json(
    { status: 200 },
    {
      headers: {
        // "Cache-Control": config.cacheControl.short,
      },
    },
  )
}
