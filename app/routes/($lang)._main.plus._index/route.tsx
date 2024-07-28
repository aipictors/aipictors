import { AppPage } from "~/components/app/app-page"
import { AppPageHeader } from "~/components/app/app-page-header"
import { PlusForm } from "~/routes/($lang)._main.plus._index/components/plus-form"
import { PlusNoteList } from "~/routes/($lang)._main.plus._index/components/plus-note-list"

/**
 * サブスク
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
