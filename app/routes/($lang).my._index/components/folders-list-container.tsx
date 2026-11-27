import { skipToken, useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { FolderIcon } from "lucide-react"
import { useContext, useEffect } from "react"
import { ResponsivePagination } from "~/components/responsive-pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import {
  FolderListItemFragment,
  FoldersList,
} from "~/routes/($lang).my._index/components/folders-list"
import type { SortType } from "~/types/sort-type"

const PER_PAGE = 16

type Props = {
  page: number
  sort: SortType
  orderBy: IntrospectionEnum<"FolderOrderBy">
  setFolderPage: (page: number) => void
  onSort: (orderBy: IntrospectionEnum<"FolderOrderBy">, sort: SortType) => void
}

/**
 * フォルダ一覧コンテナ
 * 件数は一覧と同じ viewer から取る（以前は foldersCount を別に数えていて、年齢制限の絞り込みの違いで一覧と数が合わず、削除しても減らなかった）
 */
export function FoldersListContainer(props: Props) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)

  const isReady =
    !authContext.isLoading &&
    !authContext.isNotLoggedIn &&
    Boolean(authContext.userId)

  // ログインの確認が終わる前に早く return するとフックの数が変わってしまうので、skipToken で待つ
  const { data, refetch } = useSuspenseQuery(
    viewerFoldersQuery,
    isReady
      ? {
          variables: {
            offset: PER_PAGE * props.page,
            limit: PER_PAGE,
            where: {
              orderBy: props.orderBy,
              sort: props.sort,
            },
          },
          fetchPolicy: "cache-and-network",
        }
      : skipToken,
  )

  const folders = data?.viewer?.folders ?? []
  const maxCount = data?.viewer?.folderCount ?? 0
  const bookmarkFolderId = data?.viewer?.bookmarkFolderId ?? null
  const { page, setFolderPage } = props

  // 最後のページの最後の 1 件を消したときは、1 つ前のページへ
  useEffect(() => {
    if (data && folders.length === 0 && page > 0 && maxCount > 0) {
      setFolderPage(Math.max(0, Math.ceil(maxCount / PER_PAGE) - 1))
    }
  }, [data, folders.length, page, maxCount, setFolderPage])

  if (!isReady) {
    return null
  }

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm tabular-nums">
          {t(
            `${maxCount.toLocaleString()}件のコレクション`,
            `${maxCount.toLocaleString()} collections`,
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
      {folders.length === 0 ? (
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
        <FoldersList
          folders={folders}
          bookmarkFolderId={bookmarkFolderId}
          refetch={() => void refetch()}
        />
      )}
      {maxCount > PER_PAGE && (
        <div className="sticky bottom-0 z-10 mt-3 flex justify-center border-t bg-background/95 py-2 backdrop-blur">
          <ResponsivePagination
            perPage={PER_PAGE}
            maxCount={maxCount}
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
      id
      bookmarkFolderId
      folderCount
      folders(offset: $offset, limit: $limit, where: $where) {
        ...FolderListItem
      }
    }
  }`,
  [FolderListItemFragment],
)
