import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { AppMarkdown } from "@/_components/app/app-markdown"
import { AppPageCenter } from "@/_components/app/app-page-center"
import { Button } from "@/_components/ui/button"
import { Link } from "@remix-run/react"
import type { Metadata } from "next"

/**
 * 画像生成機能の利用規約
 * @returns
 */
export default function GenerationTerms() {
  const termsMarkdownText = readFile(
    join(process.cwd(), "assets/image-generation-terms.md"),
    "utf-8",
  )

  return (
    <>
      <AppPageCenter>
        <div className="w-full space-y-8 py-8">
          <h1 className="font-bold text-2xl">{"プライバシーポリシー"}</h1>
          <AppMarkdown>{termsMarkdownText}</AppMarkdown>
          <Link to={"/generation"}>
            <Button variant={"secondary"}>{"画像生成画面"}</Button>
          </Link>
        </div>
      </AppPageCenter>
    </>
  )
}
