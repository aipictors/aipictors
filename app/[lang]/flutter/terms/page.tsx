import { join } from "path"
import { FlutterTermsArticle } from "app/[lang]/flutter/terms/_components/flutter-terms-article"
import { readFile } from "fs/promises"
import type { Metadata } from "next"

const FlutterTermsPage = async () => {
  const text = await readFile(
    join(process.cwd(), "app/[lang]/flutter/_assets/terms.md"),
    "utf-8",
  )

  return <FlutterTermsArticle text={text} />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: { absolute: "利用規約" },
}

export const revalidate = 240

export default FlutterTermsPage
