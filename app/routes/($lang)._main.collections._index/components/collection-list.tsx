import { Separator } from "~/components/ui/separator"
import { CollectionCard } from "~/routes/($lang)._main.collections._index/components/collection-card"
import { CollectionsHeader } from "~/routes/($lang)._main.collections._index/components/collections-header"

export const CollectionList = () => {
  return (
    <div className="flex flex-col">
      <CollectionsHeader />
      <Separator />
      <div className="flex">
        <CollectionCard />
        <CollectionCard />
        <CollectionCard />
      </div>
    </div>
  )
}
