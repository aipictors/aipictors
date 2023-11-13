import { join } from "path"
import { MarkdownDocument } from "@/app/_components/markdown-document"
import { readFile } from "fs/promises"
import type { Metadata } from "next"

const FlutterTermsPage = async () => {
  const text = await readFile(
    join(process.cwd(), "app/[lang]/flutter/_assets/terms.md"),
    "utf-8",
  )

  return (
    <div className="flex justify-center py-8 min-h-screen">
      <div className="max-w-[container.sm] mx-auto w-full px-4 md:px-12">
        <MarkdownDocument>{text}</MarkdownDocument>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: { absolute: "利用規約" },
}

export const revalidate = 240

export default FlutterTermsPage
