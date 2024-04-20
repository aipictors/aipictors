import { Separator } from "@/_components/ui/separator"
import { CollectionCard } from "@/routes/($lang)._main.collections._index/_components/collection-card"
import { CollectionsHeader } from "@/routes/($lang)._main.collections._index/_components/collections-header"

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
