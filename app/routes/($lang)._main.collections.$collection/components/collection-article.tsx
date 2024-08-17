import React from "react"
import { CollectionHeader } from "./collection-header"
import type { FragmentOf } from "gql.tada"
import { IconUrl } from "~/components/icon-url"
import { CollectionWorkList } from "~/routes/($lang)._main.collections.$collection/components/collection-works-list"
import type { partialFolderFieldsFragment } from "~/routes/($lang)._main.collections.$collection/route"

type Props = {
  collection: FragmentOf<typeof partialFolderFieldsFragment>
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
