import text from "@/_assets/privacy-policy.md?raw"

import { AppMarkdown } from "@/_components/app/app-markdown"
import { AppPageCenter } from "@/_components/app/app-page-center"

export default function MyCollectionsPage() {
  return (
    <>
      <AppPageCenter>
        <div className="w-full space-y-8 py-8">
          <h1 className="font-bold text-2xl">{"プライバシーポリシー"}</h1>
          <AppMarkdown>{text}</AppMarkdown>
        </div>
      </AppPageCenter>
    </>
  )
}
