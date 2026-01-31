import { Separator } from "~/components/ui/separator"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Checkbox } from "~/components/ui/checkbox"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select"
import { UserSearchItem } from "~/routes/($lang)._main.users._index/components/user-search-item"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useState, useId } from "react"
import { useSearchParams } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"
import {
  UserSearchListItemFragment,
  UserSearchListItemWorkFragment,
} from "~/routes/($lang)._main.users._index/components/user-search-item"

export function UserSearchList () {
  const t = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const hasWorksFilterId = useId()

  // URLパラメータから状態を取得
  const search = searchParams.get("q") ?? ""
  const page = Number.parseInt(searchParams.get("page") ?? "0", 10)
  const perPage = Number.parseInt(searchParams.get("perPage") ?? "20", 10)
  const hasWorksFilter = searchParams.get("hasWorks") !== "false" // デフォルトはtrue

  const { data, refetch } = useSuspenseQuery(usersSearchQuery, {
    variables: {
      offset: perPage * page,
      limit: perPage,
      where: {
        search: search || undefined,
      },
    },
  })

  const [refreshing, setRefreshing] = useState(false)

  // フィルタリングされたユーザーリスト
  const filteredUsers = hasWorksFilter
    ? (data?.users.filter((user) => user.works && user.works.length > 0) ?? [])
    : (data?.users ?? [])

  // 検索ハンドラ
  const handleSearch = (newSearch: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.set("q", newSearch)
    newSearchParams.set("page", "0") // 検索時はページをリセット
    setSearchParams(newSearchParams)
  }

  // ページ変更ハンドラ
  const handlePageChange = (newPage: number) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.set("page", newPage.toString())
    setSearchParams(newSearchParams)
  }

  // perPage変更ハンドラ
  const handlePerPageChange = (newPerPage: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.set("perPage", newPerPage)
    newSearchParams.set("page", "0") // perPage変更時はページをリセット
    setSearchParams(newSearchParams)
  }

  // hasWorksフィルター変更ハンドラ
  const handleHasWorksFilterChange = (checked: boolean) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.set("hasWorks", checked.toString())
    newSearchParams.set("page", "0") // フィルター変更時はページをリセット
    setSearchParams(newSearchParams)
  }

  // リフレッシュハンドラ
  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        {/* 検索フォーム */}
        <form
          method="get"
          className="flex space-x-2"
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const newSearch = formData.get("q") as string
            handleSearch(newSearch)
          }}
        >
          <Input
            type="text"
            name="q"
            placeholder={t("ユーザ名で検索", "Search by username")}
            defaultValue={search}
            className="rounded border px-2 py-1"
          />
          <Button type="submit">{t("検索", "Search")}</Button>
        </form>{" "}
        {/* 表示設定 */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* 表示件数 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm">{t("表示件数", "Items per page")}:</span>
            <Select
              value={perPage.toString()}
              onValueChange={handlePerPageChange}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">{t("10件", "10 items")}</SelectItem>
                <SelectItem value="20">{t("20件", "20 items")}</SelectItem>
                <SelectItem value="50">{t("50件", "50 items")}</SelectItem>
                <SelectItem value="100">{t("100件", "100 items")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 作品フィルター */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id={hasWorksFilterId}
              checked={hasWorksFilter}
              onCheckedChange={handleHasWorksFilterChange}
            />
            <label htmlFor={hasWorksFilterId} className="text-sm">
              {t(
                "作品を投稿しているユーザのみ",
                "Users with posted works only",
              )}
            </label>
          </div>

          {/* リフレッシュボタン */}
          <Button onClick={onRefresh} disabled={refreshing} variant="outline">
            {refreshing
              ? t("更新中...", "Refreshing...")
              : t("更新", "Refresh")}
          </Button>
        </div>
      </div>

      {/* ユーザリスト */}
      <div>
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <div key={user.id} className="space-y-2">
              <UserSearchItem user={user} works={user.works} />
              <Separator />
            </div>
          ))}
        </div>
        <div className="h-8" />
        {/* ページネーション */}
        <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
          <div className="flex justify-between">
            <Button
              onClick={() => handlePageChange(Math.max(0, page - 1))}
              disabled={page === 0}
              variant="outline"
            >
              {t("前へ", "Previous")}
            </Button>
            <span className="flex items-center px-4 text-sm">
              {t("ページ", "Page")} {page + 1}
            </span>
            <Button
              onClick={() => handlePageChange(page + 1)}
              disabled={!filteredUsers || filteredUsers.length < perPage}
              variant="outline"
            >
              {t("次へ", "Next")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

const usersSearchQuery = graphql(
  `query UsersSearch(
    $offset: Int!,
    $limit: Int!,
    $where: UsersWhereInput
  ) {
    users(offset: $offset, limit: $limit, where: $where) {
      id
      ...UserSearchListItem
      works(offset: 0, limit: 8) {
        ...UserSearchListItemWork
      }
    }   
  }`,
  [UserSearchListItemFragment, UserSearchListItemWorkFragment],
)
