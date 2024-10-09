import { UserTabs } from "~/routes/($lang)._main.users.$user._index/components/user-tabs"
import { type FragmentOf, graphql } from "gql.tada"
import { useTranslation } from "~/hooks/use-translation"
import type { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"
import { Link } from "@remix-run/react"

type Props = {
  user: FragmentOf<typeof UserProfileIconFragment>
  folders: FragmentOf<typeof UserUserFoldersItemFragment>[]
}

export function UserCollectionsContentBody(props: Props) {
  const t = useTranslation()

  return (
    <div className="flex flex-col space-y-4">
      <UserTabs
        activeTab={t("コレクション", "Collections")}
        user={props.user}
      />
      <div className="flex min-h-96 flex-col gap-y-4">
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
                    src={
                      folder.thumbnailImageURL ? folder.thumbnailImageURL : ""
                    }
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
      </div>
    </div>
  )
}

export const UserUserFoldersItemFragment = graphql(
  `fragment UserUserFoldersItem on FolderNode @_unmask {
    id
    thumbnailImageURL
    worksCount
    title
    nanoid
    user {
      login
    }
    works(limit: 1, offset: 0) {
      smallThumbnailImageURL
    }
  }`,
)

export const userFoldersQuery = graphql(
  `query Folders($offset: Int!, $limit: Int!, $where: FoldersWhereInput) {
    folders(offset: $offset, limit: $limit, where: $where) {
      id
      ...UserUserFoldersItem
    }
  }`,
  [UserUserFoldersItemFragment],
)
