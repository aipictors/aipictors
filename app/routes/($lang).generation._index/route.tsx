import text from "@/assets/terms.md?raw"
import { AppLoadingPage } from "@/components/app/app-loading-page"
import { GenerationForm } from "@/routes/($lang).generation._index/components/generation-form"
import { json } from "@remix-run/react"

export function HydrateFallback() {
  return <AppLoadingPage />
}

/**
 * 画像生成
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
