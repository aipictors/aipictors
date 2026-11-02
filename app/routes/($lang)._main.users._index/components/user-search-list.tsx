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
import { skipToken, useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useState, useId } from "react"
import { Link, useSearchParams } from "@remix-run/react"
import { PictorChanSays } from "~/components/pictor-chan-says"
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

  // 検索語がないと登録の新しい順に返り、作品のある人がほとんどいないので、聞きに行かない
  const isWaitingForSearch = search === "" && hasWorksFilter

  const { data, refetch } = useSuspenseQuery(
    usersSearchQuery,
    isWaitingForSearch
      ? skipToken
      : {
          variables: {
            offset: perPage * page,
            limit: perPage,
            where: {
              search: search || undefined,
            },
          },
        },
  )

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
            placeholder={t("ユーザー名で検索", "Search by username")}
            aria-label={t("ユーザー名で検索", "Search by username")}
            defaultValue={search}
            className="h-11 rounded-full px-4 text-base md:text-sm"
          />
          <Button type="submit" className="h-11 rounded-full px-5">
            {t("検索", "Search")}
          </Button>
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
              <SelectTrigger
                className="h-11 w-24"
                aria-label={t("表示件数", "Items per page")}
              >
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
          <div className="flex min-h-11 items-center space-x-2">
            <Checkbox
              id={hasWorksFilterId}
              checked={hasWorksFilter}
              onCheckedChange={handleHasWorksFilterChange}
            />
            <label htmlFor={hasWorksFilterId} className="text-sm">
              {t(
                "作品を投稿しているユーザーのみ",
                "Users with posted works only",
              )}
            </label>
          </div>

          {/* リフレッシュボタン */}
          {!isWaitingForSearch && (
            <Button
              onClick={onRefresh}
              disabled={refreshing}
              variant="outline"
              className="h-11 self-start md:self-auto"
            >
              {refreshing
                ? t("更新中...", "Refreshing...")
                : t("更新", "Refresh")}
            </Button>
          )}
        </div>
      </div>

      {/* ユーザリスト */}
      <div>
        {isWaitingForSearch ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed p-6">
            <PictorChanSays>
              {t(
                "会いたいクリエーターのお名前を入れてみてくださいね。名前の一部だけでも探せますよ！",
                "Enter the name of a creator you'd like to meet. Part of the name works too!",
              )}
            </PictorChanSays>
            <Button asChild variant="outline" className="h-11 rounded-full">
              <Link to="/rankings?type=users">
                {t("人気のクリエーターをランキングで見る", "See popular creators")}
              </Link>
            </Button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed p-6">
            <PictorChanSays>
              {t(
                `「${search}」さんは見つかりませんでした。名前の一部だけでも探せますよ！`,
                `I couldn't find "${search}". Try just part of the name!`,
              )}
            </PictorChanSays>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <div key={user.id} className="space-y-2">
                <UserSearchItem user={user} works={user.works} />
                <Separator />
              </div>
            ))}
          </div>
        )}
        {/* ページネーション */}
        {!isWaitingForSearch && (
        <div className="flex items-center justify-between gap-2 pt-4">
          <Button
            onClick={() => handlePageChange(Math.max(0, page - 1))}
            disabled={page === 0}
            variant="outline"
            className="h-11"
          >
            {t("前へ", "Previous")}
          </Button>
          <span className="px-4 text-sm">
            {t("ページ", "Page")} {page + 1}
          </span>
          <Button
            onClick={() => handlePageChange(page + 1)}
            disabled={
              data === undefined || (data.users?.length ?? 0) < perPage
            }
            variant="outline"
            className="h-11"
          >
            {t("次へ", "Next")}
          </Button>
        </div>
        )}
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
