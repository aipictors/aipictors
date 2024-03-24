import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { AppMarkdown } from "@/components/app/app-markdown"
import { AppPageCenter } from "@/components/app/app-page-center"
import type { Metadata } from "next"

const TermsPage = async () => {
  const text = await readFile(join(process.cwd(), "assets/terms.md"), "utf-8")

  return (
    <>
      <AppPageCenter>
        <div className="w-full space-y-8 py-8">
          <h1 className="font-bold text-2xl">{"利用規約"}</h1>
          <AppMarkdown>{text}</AppMarkdown>
        </div>
      </AppPageCenter>
    </>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "利用規約",
}

export const revalidate = 60

export default TermsPage
