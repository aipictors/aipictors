import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useSearchParams } from "@remix-run/react"
import { META } from "~/config"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { WorksListContainer } from "~/routes/($lang).my._index/components/works-list-container"
import { WorksSetting } from "~/routes/($lang).my._index/components/works-settings"
import type { SortType } from "~/types/sort-type"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.MY_POSTS, undefined, props.params.lang)
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

const WORK_TYPES = ["WORK", "VIDEO", "NOVEL", "COLUMN"]
const ACCESS_TYPES = ["PUBLIC", "SILENT", "LIMITED", "PRIVATE", "DRAFT"]
const RATINGS = ["G", "R15", "R18", "R18G"]

export default function MyPosts() {
  const [searchParams, setSearchParams] = useSearchParams()

  // 条件は URL に持つ（戻る・共有・再読み込みで同じ一覧になる。前の URL もそのまま開ける）
  const page = Math.max(Number(searchParams.get("page")) || 0, 0)
  const perPage = Number(searchParams.get("perPage")) || 50
  const search = searchParams.get("q") ?? ""
  const orderBy = (searchParams.get("WorkOrderby") ??
    "DATE_CREATED") as IntrospectionEnum<"WorkOrderBy">
  const sort: SortType =
    searchParams.get("worksOrderDeskAsc") === "ASC" ? "ASC" : "DESC"

  const pick = <T extends string>(key: string, allowed: string[]) => {
    const value = searchParams.get(key)
    return value !== null && allowed.includes(value) ? (value as T) : null
  }
  const accessType = pick<IntrospectionEnum<"AccessType">>(
    "accessType",
    ACCESS_TYPES,
  )
  const workType = pick<IntrospectionEnum<"WorkType">>("workType", WORK_TYPES)
  const rating = pick<IntrospectionEnum<"Rating">>("rating", RATINGS)

  const isFiltered =
    search.length > 0 ||
    accessType !== null ||
    workType !== null ||
    rating !== null

  /** 条件を変える（page を指定しなければ 1 ページ目へ戻す） */
  const update = (patch: Record<string, string | null>) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (!("page" in patch)) next.delete("page")
        for (const [key, value] of Object.entries(patch)) {
          if (value === null || value === "") next.delete(key)
          else next.set(key, value)
        }
        // 既定値は URL に出さない
        if (next.get("page") === "0") next.delete("page")
        if (next.get("perPage") === "50") next.delete("perPage")
        if (next.get("WorkOrderby") === "DATE_CREATED") {
          next.delete("WorkOrderby")
        }
        if (next.get("worksOrderDeskAsc") === "DESC") {
          next.delete("worksOrderDeskAsc")
        }
        next.delete("albumOrderDeskAsc")
        return next
      },
      { replace: true, preventScrollReset: true },
    )
  }

  const onSort = (
    nextOrderBy: IntrospectionEnum<"WorkOrderBy">,
    nextSort: SortType,
  ) => update({ WorkOrderby: nextOrderBy, worksOrderDeskAsc: nextSort })

  const onClearFilters = () =>
    update({ q: null, accessType: null, workType: null, rating: null })

  return (
    <div className="space-y-3">
      <WorksSetting
        sort={sort}
        orderBy={orderBy}
        accessType={accessType}
        workType={workType}
        rating={rating}
        search={search}
        perPage={perPage}
        isFiltered={isFiltered}
        setSearch={(value) => update({ q: value })}
        setAccessType={(value) => update({ accessType: value })}
        setWorkType={(value) => update({ workType: value })}
        setRating={(value) => update({ rating: value })}
        onSort={onSort}
        onClickPerPageChange={(value) => update({ perPage: String(value) })}
        onClearFilters={onClearFilters}
      />
      <WorksListContainer
        page={page}
        perPage={perPage}
        accessType={accessType}
        workType={workType}
        rating={rating}
        search={search}
        sort={sort}
        orderBy={orderBy}
        isFiltered={isFiltered}
        onClearFilters={onClearFilters}
        setPage={(value) => update({ page: String(value) })}
        onSort={onSort}
      />
    </div>
  )
}
