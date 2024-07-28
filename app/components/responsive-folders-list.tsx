import type { partialFolderFieldsFragment } from "~/graphql/fragments/partial-folder-fields"
import type { partialUserFieldsFragment } from "~/graphql/fragments/partial-user-fields"
import { Link } from "@remix-run/react"
import type { FragmentOf } from "gql.tada"

type Props = {
  folder: FragmentOf<typeof partialFolderFieldsFragment>
  user: FragmentOf<typeof partialUserFieldsFragment> | null
  targetRowHeight?: number
}

/**
 * レスポンシブ対応のフォルダ一覧
 */
export const ResponsiveFoldersList = (props: Props) => {
  return (
    <div
      key={props.folder.id}
      className="m-2 h-16 w-32 overflow-hidden rounded-md md:h-32 md:w-64"
    >
      <div className="box-border flex flex-col justify-end">
        <Link to={`/collections/${props.folder.id}`} className="relative">
          <img
            className="h-16 w-32 object-cover transition-all hover:scale-110 md:h-32 md:w-64"
            src={
              props.folder.thumbnailImageURL
                ? props.folder.thumbnailImageURL
                : ""
            }
            alt={props.folder.title}
          />
          <div className="absolute right-0 bottom-0 left-0 box-border h-8 bg-gradient-to-t from-black to-transparent p-4 pb-3 opacity-80">
            <p className="absolute bottom-1 left-1 text-white">
              {props.folder.title}
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}
