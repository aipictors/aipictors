import { PlusForm } from "@/[lang]/(main)/plus/_components/plus-form"
import { PlusNoteList } from "@/[lang]/(main)/plus/_components/plus-note-list"
import { AppPage } from "@/_components/app/app-page"
import { AppPageHeader } from "@/_components/app/app-page-header"
import type { Metadata } from "next"

/**
 * サブスク
 * @returns
 */
export default function Plus() {
  return (
    <AppPage>
      <AppPageHeader
        title={"Aipictors +"}
        description={
          "Aipictors+に加入してサービス内で特典を受けることができます。"
        }
      />
      <PlusForm />
      <div>
        <p>{"この度はAipictorsをご利用いただき、誠にありがとうございます。"}</p>
      </div>
      <div className="space-y-2">
        <p className="font-bold text-lg">{"注意事項"}</p>
        <PlusNoteList />
      </div>
    </AppPage>
  )
}
