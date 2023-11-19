import { PlusForm } from "@/app/[lang]/(beta)/plus/_components/plus-form"
import { PlusNoteList } from "@/app/[lang]/(beta)/plus/_components/plus-note-list"
import { MainCenterPage } from "@/app/_components/page/main-center-page"
import type { Metadata } from "next"

/**
 * サブスク
 * @returns
 */
const PlusPage = async () => {
  return (
    <MainCenterPage className="space-y-8 pb-16 px-4 md:pr-8">
      <div className="flex justify-center text-2xl font-bold">
        <span>{"Aipictors+"}</span>
      </div>
      <PlusForm />
      <div>
        <p>{"この度はAipictorsをご利用いただき、誠にありがとうございます。"}</p>
      </div>
      <div className="space-y-2">
        <p className="font-bold text-lg">注意事項</p>
        <PlusNoteList />
      </div>
    </MainCenterPage>
  )
}

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    robots: { index: false },
    title: { absolute: "Aipictors+" },
  }
}

export const revalidate = 240

export default PlusPage
