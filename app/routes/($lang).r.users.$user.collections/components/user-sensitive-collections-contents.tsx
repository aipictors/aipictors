import { Link } from "@remix-run/react"
import type { FragmentOf } from "gql.tada"
import type { UserUserFoldersItemFragment } from "~/routes/($lang)._main.users.$user.collections/components/user-collections-content-body"

type Props = {
  userId: string
  folders: FragmentOf<typeof UserUserFoldersItemFragment>[]
}

export function UserSensitiveCollectionsContents(props: Props) {
  return (
    <>
      <div className="flex flex-wrap gap-4">
        {props.folders.map((folder) => (
          <div
            key={folder.id}
            className="h-16 w-32 overflow-hidden rounded-md md:h-32 md:w-64"
          >
            <div className="box-border flex flex-col justify-end">
              <Link to={`/collections/${folder.nanoid}`} className="relative">
                <img
                  className="h-16 w-32 object-cover transition-all hover:scale-110 md:h-32 md:w-64"
                  src={folder.thumbnailImageURL ? folder.thumbnailImageURL : ""}
                  alt={folder.title}
                />
                <div className="absolute right-0 bottom-0 left-0 box-border h-8 bg-gradient-to-t from-black to-transparent p-4 pb-3 opacity-80">
                  <p className="absolute bottom-1 left-1 text-white">
                    {folder.title}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
