import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { AppMarkdown } from "@/components/app/app-markdown"
import type { Metadata } from "next"

const TermsPage = async () => {
  const text = await readFile(
    join(process.cwd(), "assets/flutter/terms.md"),
    "utf-8",
  )

  return (
    <div className="py-8">
      <AppMarkdown>{text}</AppMarkdown>
    </div>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: { absolute: "利用規約" },
}

export const revalidate = 240

export default TermsPage
