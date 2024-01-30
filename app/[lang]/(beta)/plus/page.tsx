import { PlusForm } from "@/app/[lang]/(beta)/plus/_components/plus-form"
import { PlusNoteList } from "@/app/[lang]/(beta)/plus/_components/plus-note-list"
import { AppPage } from "@/components/app/app-page"
import { AppPageHeader } from "@/components/app/app-page-header"
import type { Metadata } from "next"

/**
 * サブスク
 * @returns
 */
const PlusPage = async () => {
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

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    robots: { index: false },
    title: { absolute: "Aipictors+" },
  }
}

export const revalidate = 0

export default PlusPage
