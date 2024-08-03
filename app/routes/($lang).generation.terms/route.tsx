import termsMarkdownText from "~/assets/image-generation-terms.md?raw"
import { AppMarkdown } from "~/components/app/app-markdown"
import { Button } from "~/components/ui/button"
import { Link } from "@remix-run/react"

/**
 * 画像生成機能の利用規約
 */
export default function GenerationTerms() {
  return (
    <>
      <div className="w-full space-y-8 py-8">
        <h1 className="font-bold text-2xl">{"プライバシーポリシー"}</h1>
        <AppMarkdown>{termsMarkdownText}</AppMarkdown>
        <Link to={"/generation"}>
          <Button variant={"secondary"}>{"画像生成画面"}</Button>
        </Link>
      </div>
    </>
  )
}
