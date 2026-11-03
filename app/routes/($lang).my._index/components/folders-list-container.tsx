import { FolderIcon } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { useTranslation } from "~/hooks/use-translation"
import { AuthContext } from "~/contexts/auth-context"
import { useContext } from "react"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import type { SortType } from "~/types/sort-type"
import {
  FolderListItemFragment,
  FoldersList,
} from "~/routes/($lang).my._index/components/folders-list"

type Props = {
  page: number
  foldersMaxCount: number
  sort: SortType
  orderBy: IntrospectionEnum<"FolderOrderBy">
  setFolderPage: (page: number) => void
  onSort: (orderBy: IntrospectionEnum<"FolderOrderBy">, sort: SortType) => void
}

/**
 * フォルダ一覧コンテナ
 */
export function FoldersListContainer(props: Props) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)

  if (
    authContext.isLoading ||
    authContext.isNotLoggedIn ||
    authContext.userId === undefined ||
    !authContext.userId
  ) {
    return null
  }

  const { data: FoldersResp, refetch } = useSuspenseQuery(viewerFoldersQuery, {
    skip:
      authContext.isLoading || authContext.isNotLoggedIn || !authContext.userId,
    variables: {
      offset: 16 * props.page,
      limit: 16,
      where: {
        orderBy: props.orderBy,
        sort: props.sort,
      },
    },
  })

  const Folders = FoldersResp?.viewer?.folders ?? []

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm tabular-nums">
          {t(
            `${props.foldersMaxCount.toLocaleString()}件のコレクション`,
            `${props.foldersMaxCount.toLocaleString()} collections`,
          )}
        </p>
        <Select
          value={`${props.orderBy}:${props.sort}`}
          onValueChange={(value) => {
            const [orderBy, sort] = value.split(":")
            props.onSort(
              orderBy as IntrospectionEnum<"FolderOrderBy">,
              sort as SortType,
            )
          }}
        >
          <SelectTrigger
            aria-label={t("並び順", "Sort")}
            className="h-9 w-40 rounded-lg text-xs md:text-sm"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DATE_CREATED:DESC">
              {t("新しい順", "Newest")}
            </SelectItem>
            <SelectItem value="DATE_CREATED:ASC">
              {t("古い順", "Oldest")}
            </SelectItem>
            <SelectItem value="NAME:ASC">{t("タイトル順", "Title")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {Folders.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-14 text-center">
          <FolderIcon className="size-8 text-muted-foreground" />
          <p className="font-semibold">
            {t("コレクションはまだありません", "No collections yet")}
          </p>
          <p className="text-muted-foreground text-sm">
            {t(
              "作品ページのフォルダのボタンから、好きな作品をまとめられます。",
              "Use the folder button on a work page to collect works.",
            )}
          </p>
        </div>
      ) : (
        <FoldersList folders={Folders} refetch={() => void refetch()} />
      )}
      {props.foldersMaxCount > 16 && (
        <div className="sticky bottom-0 z-10 mt-3 flex justify-center border-t bg-background/95 py-2 backdrop-blur">
          <ResponsivePagination
            perPage={16}
            maxCount={props.foldersMaxCount}
            currentPage={props.page}
            onPageChange={(page: number) => {
              props.setFolderPage(page)
              window.scrollTo({ top: 0 })
            }}
          />
        </div>
      )}
    </>
  )
}

const viewerFoldersQuery = graphql(
  `query ViewerFolders($offset: Int!, $limit: Int!, $where: ViewerFoldersWhereInput) {
    viewer {
      folders(offset: $offset, limit: $limit, where: $where) {
        ...FolderListItem
      }
    }
  }`,
  [FolderListItemFragment],
)
