import { CollectionCard } from "@/[lang]/(main)/collections/_components/collection-card"
import { CollectionsHeader } from "@/[lang]/(main)/collections/_components/collections-header"
import { Separator } from "@/_components/ui/separator"

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
