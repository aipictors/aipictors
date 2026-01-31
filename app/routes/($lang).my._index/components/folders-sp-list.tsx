import type { FragmentOf } from "gql.tada"
import type { MobileFolderListItemFragment } from "~/routes/($lang).my._index/components/folders-sp-list-item"
import { FoldersSpListItem } from "~/routes/($lang).my._index/components/folders-sp-list-item"

type Props = {
  folders: FragmentOf<typeof MobileFolderListItemFragment>[]
}

/**
 * スマホ向けシリーズ一覧
 */
export function FoldersSpList (props: Props) {
  return (
    <>
      {props.folders.map((folder, _index) => (
        <div key={folder.id}>
          <FoldersSpListItem folder={folder} />
        </div>
      ))}
    </>
  )
}
