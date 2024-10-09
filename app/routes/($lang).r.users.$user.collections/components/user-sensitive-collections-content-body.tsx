import { type FragmentOf, graphql } from "gql.tada"
import { useTranslation } from "~/hooks/use-translation"
import type { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"
import { UserSensitiveTabs } from "~/routes/($lang).r.users.$user._index/components/user-sensitive-tabs"
import { UserSensitiveCollectionsContents } from "~/routes/($lang).r.users.$user.collections/components/user-sensitive-collections-contents"

type Props = {
  user: FragmentOf<typeof UserProfileIconFragment>
  folders: FragmentOf<typeof UserUserFoldersItemFragment>[]
}

export function UserSensitiveCollectionsContentBody(props: Props) {
  const t = useTranslation()

  return (
    <div className="flex flex-col space-y-4">
      <UserSensitiveTabs
        activeTab={t("コレクション", "Collections")}
        user={props.user}
      />
      <div className="flex min-h-96 flex-col gap-y-4">
        <UserSensitiveCollectionsContents
          userId={props.user.id}
          folders={props.folders}
        />
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
