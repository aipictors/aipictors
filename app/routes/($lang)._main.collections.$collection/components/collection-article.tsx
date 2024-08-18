import React from "react"
import { CollectionHeader } from "./collection-header"
import { graphql, type FragmentOf } from "gql.tada"
import { IconUrl } from "~/components/icon-url"
import {
  CollectionWorkList,
  CollectionWorkListItemFragment,
} from "~/routes/($lang)._main.collections.$collection/components/collection-works-list"

type Props = {
  collection: FragmentOf<typeof FolderArticleFragment>
}

export function CollectionArticle(props: Props) {
  if (!props.collection.user) {
    return null
  }

  const [page, setPage] = React.useState(0)

  return (
    <div className="flex flex-col">
      <CollectionHeader
        thumbnailImageURL={props.collection.thumbnailImageURL ?? ""}
        userId={props.collection.user.id ?? ""}
        userName={props.collection.user.name ?? ""}
        userIconURL={IconUrl(props.collection.user.iconUrl)}
        collectionName={props.collection.title}
        collectionDescription={props.collection.description}
        isFollow={false}
        workCount={props.collection.worksCount ?? 0}
        tags={props.collection.tags ?? []}
        login={props.collection.user.login ?? ""}
      />
      <CollectionWorkList
        works={props.collection.works ?? []}
        page={page}
        setPage={setPage}
        maxCount={props.collection.worksCount ?? 0}
      />
    </div>
  )
}

export const FolderArticleFragment = graphql(
  `fragment FolderArticle on FolderNode @_unmask {
      id
      thumbnailImageURL
      title
      description
      tags
      user {
        id
        name
        iconUrl
        login
      }
      worksCount
      works(offset: 0, limit: 16) {
        ...CollectionWorkListItem
      }
  }`,
  [CollectionWorkListItemFragment],
)
