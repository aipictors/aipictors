import { UserAlbumsContents } from "~/routes/($lang)._main.users.$user._index/components/user-albums-contents"
import { UserTabs } from "~/routes/($lang)._main.users.$user._index/components/user-tabs"
import { type FragmentOf, graphql } from "gql.tada"
import { useTranslation } from "~/hooks/use-translation"
import type { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"

type Props = {
  user: FragmentOf<typeof UserProfileIconFragment>
  albums: FragmentOf<typeof UserAlbumListItemFragment>[]
}

export function UserAlbumsContent(props: Props) {
  const t = useTranslation()

  return (
    <div className="flex flex-col space-y-4">
      <UserTabs activeTab={t("シリーズ", "Series")} user={props.user} />
      <div className="flex min-h-96 flex-col gap-y-4">
        <UserAlbumsContents userId={props.user.id} albums={props.albums} />
      </div>
    </div>
  )
}

export const UserAlbumListItemFragment = graphql(
  `fragment UserAlbumListItem on AlbumNode @_unmask {
    id
    thumbnailImageURL
    slug
    worksCount
    title
    user {
      login
    }
    works(limit: 1, offset: 0) {
      smallThumbnailImageURL
    }
  }`,
)
