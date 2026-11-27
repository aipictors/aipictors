import { MyCollectionGridSkeleton } from "~/routes/($lang).my._index/components/my-collection-card"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import React from "react"
import { Suspense } from "react"
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"
import { FoldersListContainer } from "~/routes/($lang).my._index/components/folders-list-container"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import type { SortType } from "~/types/sort-type"

export const meta: MetaFunction = (props) => {
  return createMeta(META.MY_FOLDERS, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  return {}
}

export const headers: HeadersFunction = () => ({
  // キャッシュ不要
  // "Cache-Control": config.cacheControl.oneHour,
})

export default function MyFolders() {
  const [folderPage, setFolderPage] = React.useState(0)

  const [folderOrderDeskAsc, setFolderOrderDeskAsc] =
    React.useState<SortType>("DESC")

  const [FolderOrderby, setFolderOrderby] =
    React.useState<IntrospectionEnum<"FolderOrderBy">>("DATE_CREATED")

  return (
    <Suspense fallback={<MyCollectionGridSkeleton />}>
      <FoldersListContainer
        page={folderPage}
        sort={folderOrderDeskAsc}
        orderBy={FolderOrderby}
        setFolderPage={setFolderPage}
        onSort={(orderBy, sort) => {
          setFolderPage(0)
          setFolderOrderby(orderBy)
          setFolderOrderDeskAsc(sort)
        }}
      />
    </Suspense>
  )
}
