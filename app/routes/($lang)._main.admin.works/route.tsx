import { useQuery } from "@apollo/client/index"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { useSearchParams } from "@remix-run/react"
import { ImageIcon } from "lucide-react"
import { useContext, useEffect, useMemo, useState } from "react"
import { AdminPageShell } from "~/components/admin-page-shell"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { AuthContext } from "~/contexts/auth-context"
import { useToast } from "~/hooks/use-toast"
import { WorkModerationCard } from "~/routes/($lang)._main.admin.works/components/admin-work-moderation-card"
import { AdminWorksFilterCard } from "~/routes/($lang)._main.admin.works/components/admin-works-filter-card"
import {
  adminWorksQuery,
  viewerQuery,
} from "~/routes/($lang)._main.admin.works/components/admin-works-queries"
import {
  buildAdminWorksWhere,
  getJstDateString,
  PAGE_SIZE,
  type WorkItem,
} from "~/routes/($lang)._main.admin.works/utils/admin-works-utils"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(
    {
      title: "作品管理",
      enTitle: "Work Moderation",
      description: "モデレーター向け作品管理ページ",
      enDescription: "Moderator work moderation page",
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )
}

export async function loader(_props: LoaderFunctionArgs) {
  return json({})
}

export default function AdminWorksPage() {
  const { toast } = useToast()
  const authContext = useContext(AuthContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const [workIdFilter, setWorkIdFilter] = useState(
    searchParams.get("workId") ?? "",
  )
  const [titleFilter, setTitleFilter] = useState(
    searchParams.get("title") ?? "",
  )
  const [ownerFilter, setOwnerFilter] = useState(
    searchParams.get("owner") ?? "",
  )

  const page = Math.max(
    Number.parseInt(searchParams.get("page") ?? "0", 10) || 0,
    0,
  )
  const dateFilter = searchParams.get("date") ?? ""
  const ratingFilter = searchParams.get("rating") ?? "ALL"

  useEffect(() => {
    setWorkIdFilter(searchParams.get("workId") ?? "")
    setTitleFilter(searchParams.get("title") ?? "")
    setOwnerFilter(searchParams.get("owner") ?? "")
  }, [searchParams])

  const worksWhere = useMemo(() => {
    return buildAdminWorksWhere({
      dateFilter,
      ownerFilter,
      ratingFilter,
      titleFilter,
      workIdFilter,
    })
  }, [dateFilter, ownerFilter, ratingFilter, titleFilter, workIdFilter])

  const hasActiveFilters = useMemo(() => {
    return (
      workIdFilter.trim().length > 0 ||
      titleFilter.trim().length > 0 ||
      ownerFilter.trim().length > 0 ||
      dateFilter.length > 0 ||
      ratingFilter !== "ALL"
    )
  }, [dateFilter, ownerFilter, ratingFilter, titleFilter, workIdFilter])

  const updateSearchParams = (mutator: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams)
    mutator(next)
    next.delete("page")
    setSearchParams(next)
  }

  const applyFilters = () => {
    updateSearchParams((next) => {
      if (workIdFilter.trim()) {
        next.set("workId", workIdFilter.trim())
      } else {
        next.delete("workId")
      }

      if (titleFilter.trim()) {
        next.set("title", titleFilter.trim())
      } else {
        next.delete("title")
      }

      if (ownerFilter.trim()) {
        next.set("owner", ownerFilter.trim())
      } else {
        next.delete("owner")
      }
    })
  }

  const clearFilters = () => {
    setWorkIdFilter("")
    setTitleFilter("")
    setOwnerFilter("")
    const next = new URLSearchParams(searchParams)
    next.delete("page")
    next.delete("workId")
    next.delete("title")
    next.delete("owner")
    next.delete("date")
    next.delete("rating")
    setSearchParams(next)
  }

  const applyDateShortcut = (offsetDays: number) => {
    const date = new Date()
    date.setDate(date.getDate() + offsetDays)
    updateSearchParams((next) => {
      next.set("date", getJstDateString(date))
    })
  }

  const { data: viewerData, loading: viewerLoading } = useQuery(viewerQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const {
    data: worksData,
    loading: worksLoading,
    refetch,
  } = useQuery(adminWorksQuery, {
    variables: {
      offset: page * PAGE_SIZE,
      limit: PAGE_SIZE,
      where: worksWhere,
    },
    skip:
      authContext.isLoading ||
      authContext.isNotLoggedIn ||
      !viewerData?.viewer?.isModerator,
    fetchPolicy: "cache-and-network",
  })

  const works = (worksData?.works ?? []) as WorkItem[]
  const worksCount = worksData?.worksCount ?? 0
  const maxPage = Math.max(Math.ceil(worksCount / PAGE_SIZE) - 1, 0)

  const pageDescription = "作品の確認、非公開化、投稿者通知を行います。"

  const onMovePage = (nextPage: number) => {
    const targetPage = Math.max(0, Math.min(nextPage, maxPage))
    const next = new URLSearchParams(searchParams)
    next.set("page", String(targetPage))
    setSearchParams(next)
  }

  if (authContext.isLoading || viewerLoading) {
    return (
      <AdminPageShell
        title="作品管理"
        description={pageDescription}
        icon={ImageIcon}
      >
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardContent className="py-8 text-sm text-slate-400">
            読み込み中...
          </CardContent>
        </Card>
      </AdminPageShell>
    )
  }

  if (authContext.isNotLoggedIn) {
    return (
      <AdminPageShell
        title="作品管理"
        description={pageDescription}
        icon={ImageIcon}
      >
        <Alert className="rounded-[28px] border-white/10 bg-white/5 text-slate-100">
          <AlertDescription className="text-slate-300">
            このページにアクセスするにはログインが必要です。
          </AlertDescription>
        </Alert>
      </AdminPageShell>
    )
  }

  if (!viewerData?.viewer?.isModerator) {
    return (
      <AdminPageShell
        title="作品管理"
        description={pageDescription}
        icon={ImageIcon}
      >
        <Alert className="rounded-[28px] border-white/10 bg-white/5 text-slate-100">
          <AlertDescription className="text-slate-300">
            このページにアクセスする権限がありません。
          </AlertDescription>
        </Alert>
      </AdminPageShell>
    )
  }
  return (
    <AdminPageShell
      title="作品管理"
      description={pageDescription}
      icon={ImageIcon}
    >
      <AdminWorksFilterCard
        applyDateShortcut={applyDateShortcut}
        applyFilters={applyFilters}
        clearFilters={clearFilters}
        dateFilter={dateFilter}
        hasActiveFilters={hasActiveFilters}
        ownerFilter={ownerFilter}
        ratingFilter={ratingFilter}
        setOwnerFilter={setOwnerFilter}
        setTitleFilter={setTitleFilter}
        setWorkIdFilter={setWorkIdFilter}
        titleFilter={titleFilter}
        updateSearchParams={updateSearchParams}
        workIdFilter={workIdFilter}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {hasActiveFilters ? "絞り込み後" : "全"} {worksCount} 件 / {page + 1}{" "}
          ページ目
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
            disabled={page <= 0}
            onClick={() => onMovePage(page - 1)}
          >
            前へ
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
            disabled={page >= maxPage}
            onClick={() => onMovePage(page + 1)}
          >
            次へ
          </Button>
        </div>
      </div>

      {worksLoading ? (
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardContent className="py-8 text-sm text-slate-400">
            読み込み中...
          </CardContent>
        </Card>
      ) : works.length === 0 ? (
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardContent className="py-8 text-sm text-slate-400">
            対象の作品はありません。
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {works.map((work) => (
            <WorkModerationCard
              key={work.id}
              work={work}
              onDone={async () => {
                await refetch()
                toast({
                  title: "更新しました",
                  description: `作品 #${work.id} の状態を更新しました。`,
                })
              }}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
          disabled={page <= 0}
          onClick={() => onMovePage(page - 1)}
        >
          前へ
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
          disabled={page >= maxPage}
          onClick={() => onMovePage(page + 1)}
        >
          次へ
        </Button>
      </div>
    </AdminPageShell>
  )
}
