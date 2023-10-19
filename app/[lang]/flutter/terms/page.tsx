import { join } from "path"
import { MainFlutterTerms } from "app/[lang]/flutter/terms/_components/MainFlutterTerms"
import { readFile } from "fs/promises"
import type { Metadata } from "next"

const FlutterTermsPage = async () => {
  const text = await readFile(
    join(process.cwd(), "assets/flutter/terms.md"),
    "utf-8",
  )

  return <MainFlutterTerms text={text} />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: { absolute: "利用規約" },
}

export const revalidate = 240

export default FlutterTermsPage
