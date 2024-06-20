import type { foldersQuery } from "@/_graphql/queries/folder/folders"
import { config } from "@/config"
import type { ResultOf } from "gql.tada"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  folders: NonNullable<ResultOf<typeof foldersQuery>["folders"]> | null
  targetRowHeight?: number
}

/**
 * レスポンシブ対応のフォルダ一覧
 */
export const ResponsiveFoldersList = (props: Props) => {
  if (props.folders === null || props.folders.length === 0) {
    return null
  }

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  return (
    <div className="flex flex-wrap">
      {props.folders.map((folder) => (
        <div
          key={folder.id}
          className="m-2 h-16 w-32 overflow-hidden rounded-md md:h-24 md:w-40"
        >
          <div className="box-border flex flex-col justify-end">
            <a href={`/collections/${folder.id}`} className="relative">
              <img
                className="h-16 w-32 object-cover transition-all md:h-24 md:w-40 hover:scale-110"
                src={folder.thumbnailImageURL ? folder.thumbnailImageURL : ""}
                alt={folder.title}
              />
              <div className="absolute right-0 bottom-0 left-0 box-border h-8 bg-gradient-to-t from-black to-transparent p-4 pb-3 opacity-80">
                <p className="absolute bottom-1 left-1 text-white">
                  {folder.title}
                </p>
              </div>
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}
