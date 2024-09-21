import type { MetaFunction } from "@remix-run/cloudflare"
import { AppPageHeader } from "~/components/app/app-page-header"
import { META } from "~/config"
import { PlusForm } from "~/routes/($lang)._main.plus._index/components/plus-form"
import { PlusNoteList } from "~/routes/($lang)._main.plus._index/components/plus-note-list"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.PLUS, undefined, props.params.lang)
}

/**
 * サブスク
 */
export default function Plus() {
  return (
    <>
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
    </>
  )
}
