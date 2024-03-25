import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { AppMarkdown } from "@/components/app/app-markdown"
import { AppPageCenter } from "@/components/app/app-page-center"
import { Button } from "@/components/ui/button"
import type { Metadata } from "next"
import Link from "next/link"

/**
 * 画像生成機能の利用規約
 * @returns
 */
const GenerationTermsPage = async () => {
  const termsMarkdownText = await readFile(
    join(process.cwd(), "assets/image-generation-terms.md"),
    "utf-8",
  )

  return (
    <>
      <AppPageCenter>
        <div className="w-full space-y-8 py-8">
          <h1 className="font-bold text-2xl">{"プライバシーポリシー"}</h1>
          <AppMarkdown>{termsMarkdownText}</AppMarkdown>
          <Link href={"/generation"}>
            <Button variant={"secondary"}>{"画像生成画面"}</Button>
          </Link>
        </div>
      </AppPageCenter>
    </>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "画像生成利用規約",
}

export default GenerationTermsPage
