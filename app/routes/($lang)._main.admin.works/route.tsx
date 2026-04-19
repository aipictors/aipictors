import { useLazyQuery, useMutation, useQuery, gql } from "@apollo/client/index"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { Link, useSearchParams } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext, useEffect, useMemo, useState } from "react"
import {
  BookText,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Lock,
  LockOpen,
  MessageSquare,
  ThumbsUp,
  Video,
} from "lucide-react"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { AdminPageShell } from "~/components/admin-page-shell"
import { Badge } from "~/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import { Textarea } from "~/components/ui/textarea"
import { LikeButton } from "~/components/like-button"
import { AuthContext } from "~/contexts/auth-context"
import { useToast } from "~/hooks/use-toast"
import { ReportDialog } from "~/routes/($lang)._main.posts.$post._index/components/report-dialog"
import {
  CommentListItemFragment,
  WorkCommentList,
} from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"
import { WorkImageView } from "~/routes/($lang)._main.posts.$post._index/components/work-image-view"
import { createMeta } from "~/utils/create-meta"
import { toDateTimeText } from "~/utils/to-date-time-text"

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

const PAGE_SIZE = 12

const RATING_OPTIONS = [
  { value: "ALL", label: "全年齢区分すべて" },
  { value: "G", label: "全年齢" },
  { value: "R15", label: "R-15" },
  { value: "R18", label: "R-18" },
  { value: "R18G", label: "R-18G" },
] as const

const NOTIFY_TEMPLATES = [
  {
    key: "EMPTY",
    label: "空欄",
    text: "",
  },
  {
    key: "UNEDITED_IMAGE_LINE",
    label: "無修正（画像用・スジ指摘）",
    text: "無修正のため、一時非公開とさせていただきました。規約を参考に、モザイク加工をお願い致します。男性器は陰茎～睾丸、女性器は子宮口、ひだを含め、大陰唇の内側まで、輪郭線まで隠れるように加工が必要です。また、スジのみの表現でもモザイクが必要となります。ピクターズのモザイクツールを利用して修正いただくか、新しく再投稿をお願い致します。モザイクツール利用の場合は、ダッシュボードの「運営からのお知らせ」＞「公開申請または修正」を選んで修正をかけていただき、再下段のコメント欄で「修正しました」と記入いただければ一時非公開は解除されます。よろしくお願いいたします。",
  },
  {
    key: "UNEDITED_IMAGE",
    label: "無修正（画像用）",
    text: "無修正のため、一時非公開とさせていただきました。規約を参考に、モザイク加工をお願い致します。男性器は陰茎～睾丸、女性器は子宮口、ひだを含め、大陰唇の内側まで、輪郭線まで隠れるように加工が必要です。ピクターズのモザイクツールを利用して修正いただくか、新しく再投稿をお願い致します。モザイクツール利用の場合は、ダッシュボードの「運営からのお知らせ」＞「公開申請または修正」を選んで修正をかけていただき、再下段のコメント欄で「修正しました」と記入いただければ一時非公開は解除されます。よろしくお願いいたします。",
  },
  {
    key: "UNEDITED_TEXT",
    label: "無修正（小説・コラム用）",
    text: "無修正のため、一時非公開とさせていただきました。規約を参考に、モザイク加工をお願い致します。男性器は陰茎～睾丸、女性器は子宮口、ひだを含め、大陰唇の内側まで、輪郭線まで隠れるように加工が必要です。小説・コラムでは編集時にモザイクツールが使えないため、お手数ですが新しく再投稿をお願い致します。よろしくお願いいたします。",
  },
  {
    key: "MOSAIC_JOIN",
    label: "モザイク不足（結合部）",
    text: "モザイクの範囲が足りておりませんため、一時非公開とさせていただきました。結合部は輪郭が隠れるようにモザイク加工をお願い致します。ピクターズのモザイクツールを利用して修正いただくか、新しく再投稿をお願い致します。モザイクツール利用の場合は、ダッシュボードの「運営からのお知らせ」＞「公開申請または修正」を選んで修正をかけていただき、再下段のコメント欄で「修正しました」と記入いただければ一時非公開は解除されます。よろしくお願いいたします。",
  },
  {
    key: "MOSAIC_SIZE",
    label: "モザイク不足（モザイクサイズ小さい）",
    text: "モザイク加工が足りておりませんため、一時非公開とさせていただきました。モザイクサイズは画像の長辺の1/100以上のピクセルサイズが必要となります。規定のサイズより小さいモザイクをご利用されているようです。ピクターズのモザイクツールを利用して修正いただくか、新しく再投稿をお願い致します。モザイクツール利用の場合は、ダッシュボードの「運営からのお知らせ」＞「公開申請または修正」を選んで修正をかけていただき、再下段のコメント欄で「修正しました」と記入いただければ一時非公開は解除されます。よろしくお願いいたします。",
  },
  {
    key: "MOSAIC_LINE_ROOT",
    label: "モザイク不足（スジ、付け根）",
    text: "モザイク加工が足りておりませんため、一時非公開とさせていただきました。女性器はスジのみの表現でもモザイクが必要となります。男性器は陰茎～睾丸まで必要となりますが、付け根部分などにモザイク加工がされておりません。ピクターズのモザイクツールを利用して修正いただくか、新しく再投稿をお願い致します。モザイクツール利用の場合は、ダッシュボードの「運営からのお知らせ」＞「公開申請または修正」を選んで修正をかけていただき、再下段のコメント欄で「修正しました」と記入いただければ一時非公開は解除されます。よろしくお願いいたします。",
  },
  {
    key: "MOSAIC_RANGE",
    label: "モザイク不足（範囲不足）",
    text: "モザイク加工が足りておりませんため、一時非公開とさせていただきました。規約を参考に、モザイク加工をお願い致します。男性器は陰茎～睾丸、女性器は子宮口、ひだを含め、大陰唇の内側まで、輪郭線まで隠れるように加工が必要です。性器全体をおおうようにモザイク加工していただければと思います。ピクターズのモザイクツールを利用して修正いただくか、新しく再投稿をお願い致します。モザイクツール利用の場合は、ダッシュボードの「運営からのお知らせ」＞「公開申請または修正」を選んで修正をかけていただき、再下段のコメント欄で「修正しました」と記入いただければ一時非公開は解除されます。よろしくお願いいたします。",
  },
  {
    key: "MOSAIC_BLACK",
    label: "モザイク不足（黒塗り等）",
    text: "モザイク加工が足りておりませんため、一時非公開とさせていただきました。規約を参考に、モザイク加工をお願い致します。男性器は陰茎～睾丸、女性器は子宮口、ひだを含め、大陰唇の内側まで、輪郭線まで隠れるように加工が必要です。黒塗り等で修正する場合、モザイク対象範囲すべてが、不透明に塗りつぶされている場合のみOKとなります。ピクターズのモザイクツールを利用して修正いただくか、新しく再投稿をお願い致します。モザイクツール利用の場合は、ダッシュボードの「運営からのお知らせ」＞「公開申請または修正」を選んで修正をかけていただき、再下段のコメント欄で「修正しました」と記入いただければ一時非公開は解除されます。よろしくお願いいたします。",
  },
  {
    key: "MOSAIC_HALF",
    label: "モザイク不足（半透明のモザイク）",
    text: "モザイク加工が足りておりませんため、一時非公開とさせていただきました。規約を参考に、モザイク加工をお願い致します。男性器は陰茎～睾丸、女性器は子宮口、ひだを含め、大陰唇の内側まで、輪郭線まで隠れるように加工が必要です。また、モザイクは単色で塗りつぶされている必要があります。半透明のモザイクは使用しないでください。ピクターズのモザイクツールを利用して修正いただくか、新しく再投稿をお願い致します。モザイクツール利用の場合は、ダッシュボードの「運営からのお知らせ」＞「公開申請または修正」を選んで修正をかけていただき、再下段のコメント欄で「修正しました」と記入いただければ一時非公開は解除されます。よろしくお願いいたします。",
  },
  {
    key: "MOSAIC_HALF_LINE",
    label: "モザイク不足（半透明のモザイクで輪郭透け）",
    text: "モザイク加工が足りておりませんため、一時非公開とさせていただきました。モザイクは単色で塗りつぶされている必要があります。半透明のモザイクで、輪郭が透けて見えております。ピクターズのモザイクツールを利用して修正いただくか、新しく再投稿をお願い致します。モザイクツール利用の場合は、ダッシュボードの「運営からのお知らせ」＞「公開申請または修正」を選んで修正をかけていただき、再下段のコメント欄で「修正しました」と記入いただければ一時非公開は解除されます。よろしくお願いいたします。",
  },
  {
    key: "MOSAIC_HALF_SIZE",
    label: "モザイク不足（半透明のモザイクでモザイクサイズ違い）",
    text: "モザイク加工が足りておりませんため、一時非公開とさせていただきました。モザイクサイズは画像の長辺の1/100以上のピクセルサイズが必要となります。規定のサイズより小さいモザイクをご利用されているようです。また、モザイクは単色で塗りつぶされている必要があります。半透明のモザイクで、輪郭が透けて見えております。輪郭が見えないように、単色で塗りつぶされたモザイクで加工をお願いいたします。ピクターズのモザイクツールを利用して修正いただくか、新しく再投稿をお願い致します。モザイクツール利用の場合は、ダッシュボードの「運営からのお知らせ」＞「公開申請または修正」を選んで修正をかけていただき、再下段のコメント欄で「修正しました」と記入いただければ一時非公開は解除されます。よろしくお願いいたします。",
  },
  {
    key: "MOSAIC_FORGOT",
    label: "モザイク不足（〇枚目モザイク加工忘れ）",
    text: "〇枚目モザイク加工をお忘れのようです。一時非公開とさせていただきました。ピクターズのモザイクツールを利用して修正いただくか、新しく再投稿をお願い致します。モザイクツール利用の場合は、ダッシュボードの「運営からのお知らせ」＞「公開申請または修正」を選んで修正をかけていただき、再下段のコメント欄で「修正しました」と記入いただければ一時非公開は解除されます。よろしくお願いいたします。",
  },
  {
    key: "UNEDITED_DRAFT",
    label: "無修正（下書き・アーカイブ用）",
    text: "無修正のため、一時非公開とさせていただきました。アーカイブや下書きでの投稿でも、モザイク加工を行ってからの投稿が必要となりますので、加工を行ってからの投稿をお願い致します。（対応いただけない場合、一定期間後に非公開とさせていただきます）サーバ上に無修正画像をおくことができないため、ご協力をよろしくお願いいたします。",
  },
  {
    key: "MOSAIC_DRAFT",
    label: "モザイク不足（下書き・アーカイブ用）",
    text: "モザイク加工が足りておりませんため、一時非公開とさせていただきました。アーカイブや下書きでの投稿でも、モザイク加工を行ってからの投稿が必要となりますので、加工を行ってからの投稿をお願い致します。（対応いただけない場合、一定期間後に非公開とさせていただきます）サーバ上に適切に加工されていない画像をおくことができないため、ご協力をよろしくお願いいたします。ピクターズのモザイクツールを利用して修正いただくか、新しく再投稿をお願い致します。モザイクツール利用の場合は、ダッシュボードの「運営からのお知らせ」＞「公開申請または修正」を選んで修正をかけていただき、再下段のコメント欄で「修正しました」と記入いただければ一時非公開は解除されます。よろしくお願いいたします。",
  },
  {
    key: "GENERATED_R18",
    label: "生成R18",
    text: "ピクターズ生成機能を利用してのR18画像の生成・投稿は規約違反となりますので、非公開とさせていただきました。",
  },
  {
    key: "PROMO_LINK",
    label: "宣伝NG（リンク）",
    text: "投稿において、スタンダード、プレミアムプランで利用できる広告枠以外では、メンバーシップ等の有料ページの宣伝はできません。プロフィール欄にリンクを記載することは問題ありませんが、投稿からは削除をお願いいたします。",
  },
  {
    key: "PROMO_PART",
    label: "宣伝NG（一部画像）",
    text: "投稿において、スタンダード、プレミアムプランで利用できる広告枠以外では、メンバーシップ等の有料ページの宣伝はできません。有料商品・サブスクへの宣伝・勧誘を目的とし、商品の一部分（複数画像の一部や、画像を一部隠す等の加工をしたもの）もしくは全てを投稿する行為を禁止となっております。よろしくお願いいたします。",
  },
  {
    key: "RED_CROSS",
    label: "赤十字",
    text: "白地系に赤色系の赤十字はご利用いただけません。ピンク色など、赤系の色も使えませんので、お手数ですがモザイク加工いただくか、色を変更しての再投稿をお願いいたします。",
  },
] as const

type TemplateKey = (typeof NOTIFY_TEMPLATES)[number]["key"]

type WorkItem = {
  id: string
  title: string
  description: string | null
  type: "WORK" | "VIDEO" | "NOVEL" | "COLUMN" | string
  accessType: string
  adminAccessType: "PUBLIC" | "PRIVATE" | "TEMPORARY_PRIVATE" | string
  isDeleted: boolean
  createdAt: number
  likesCount: number
  commentsCount: number
  subWorksCount: number
  imageURL: string | null
  isCommentsEditable: boolean
  isLiked: boolean
  isSensitive: boolean
  smallThumbnailImageURL: string | null
  subWorks: Array<{
    id: string
    imageUrl: string | null
  }>
  user: {
    id: string
    name: string
    login: string
    iconUrl: string | null
    isBlocked: boolean
  } | null
}

const toAccessTypeText = (accessType: string) => {
  switch (accessType) {
    case "PUBLIC":
      return "公開"
    case "PRIVATE":
      return "非公開"
    case "DRAFT":
      return "下書き"
    case "LIMITED":
      return "限定公開"
    case "SILENT":
      return "サイレント"
    default:
      return accessType
  }
}

const toAdminAccessTypeText = (accessType: WorkItem["adminAccessType"]) => {
  switch (accessType) {
    case "PUBLIC":
      return "運営公開"
    case "PRIVATE":
      return "運営非公開"
    case "TEMPORARY_PRIVATE":
      return "一時非公開"
    default:
      return accessType
  }
}

const toWorkTypeText = (type: WorkItem["type"]) => {
  switch (type) {
    case "WORK":
      return "イラスト"
    case "VIDEO":
      return "動画"
    case "NOVEL":
      return "小説"
    case "COLUMN":
      return "コラム"
    default:
      return type
  }
}

const getJstDateString = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  return formatter.format(date)
}

const getJstDateRange = (dateString: string) => {
  if (!dateString) {
    return null
  }

  return {
    createdAtAfter: new Date(`${dateString}T00:00:00+09:00`).toISOString(),
    beforeCreatedAt: new Date(`${dateString}T23:59:59.999+09:00`).toISOString(),
  }
}

const parseWorkIds = (value: string) => {
  return value
    .split(/[\s,、]+/)
    .map((item) => Number.parseInt(item.trim(), 10))
    .filter((item) => Number.isFinite(item) && item > 0)
    .map((item) => String(item))
}

export default function AdminWorksPage() {
  const { toast } = useToast()
  const authContext = useContext(AuthContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const [workIdFilter, setWorkIdFilter] = useState(searchParams.get("workId") ?? "")
  const [titleFilter, setTitleFilter] = useState(searchParams.get("title") ?? "")
  const [ownerFilter, setOwnerFilter] = useState(searchParams.get("owner") ?? "")

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
    const where: Record<string, unknown> = {
      isIncludePrivate: true,
      ratings: ["G", "R15", "R18", "R18G"],
    }

    const ids = parseWorkIds(workIdFilter)
    if (ids.length > 0) {
      where.ids = ids
    }

    if (titleFilter.trim().length > 0) {
      where.search = titleFilter.trim()
    }

    if (ownerFilter.trim().length > 0) {
      where.ownerName = ownerFilter.trim()
    }

    if (ratingFilter !== "ALL") {
      where.ratings = [ratingFilter]
    }

    const dateRange = getJstDateRange(dateFilter)
    if (dateRange) {
      where.createdAtAfter = dateRange.createdAtAfter
      where.beforeCreatedAt = dateRange.beforeCreatedAt
    }

    return where
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

  const { data: worksData, loading: worksLoading, refetch } = useQuery(
    adminWorksQuery,
    {
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
    },
  )

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
          <CardContent className="py-8 text-sm text-slate-400">読み込み中...</CardContent>
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
      <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
        <CardHeader className="space-y-2">
          <CardTitle className="text-base">絞り込み</CardTitle>
          <p className="text-sm text-slate-400">
            読み込み量を減らすため、日付や年齢種別、作品ID、作品名、作者名で絞り込めます。
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
              onClick={() => applyDateShortcut(0)}
            >
              本日
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
              onClick={() => applyDateShortcut(-1)}
            >
              昨日
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-2 xl:col-span-1">
              <Label htmlFor="admin-works-date">日付</Label>
              <Input
                id="admin-works-date"
                type="date"
                value={dateFilter}
                onChange={(event) => {
                  updateSearchParams((next) => {
                    if (event.target.value) {
                      next.set("date", event.target.value)
                    } else {
                      next.delete("date")
                    }
                  })
                }}
                className="border-white/10 bg-white/5 text-slate-100"
              />
            </div>

            <div className="space-y-2 xl:col-span-1">
              <Label>年齢種別</Label>
              <Select
                value={ratingFilter}
                onValueChange={(value) => {
                  updateSearchParams((next) => {
                    if (value === "ALL") {
                      next.delete("rating")
                    } else {
                      next.set("rating", value)
                    }
                  })
                }}
              >
                <SelectTrigger className="border-white/10 bg-white/5 text-slate-100">
                  <SelectValue placeholder="年齢種別を選択" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-950/95 text-slate-100">
                  {RATING_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 xl:col-span-1">
              <Label htmlFor="admin-works-id">作品ID</Label>
              <Input
                id="admin-works-id"
                value={workIdFilter}
                onChange={(event) => setWorkIdFilter(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    applyFilters()
                  }
                }}
                placeholder="12345 または 123,456"
                className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2 xl:col-span-1">
              <Label htmlFor="admin-works-title">作品名</Label>
              <Input
                id="admin-works-title"
                value={titleFilter}
                onChange={(event) => setTitleFilter(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    applyFilters()
                  }
                }}
                placeholder="作品名で検索"
                className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2 xl:col-span-1">
              <Label htmlFor="admin-works-owner">作者名</Label>
              <Input
                id="admin-works-owner"
                value={ownerFilter}
                onChange={(event) => setOwnerFilter(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    applyFilters()
                  }
                }}
                placeholder="作者名で検索"
                className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="bg-cyan-600 text-white hover:bg-cyan-500"
              onClick={applyFilters}
            >
              絞り込む
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
            >
              条件をクリア
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {hasActiveFilters ? "絞り込み後" : "全"} {worksCount} 件 / {page + 1} ページ目
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

type WorkModerationCardProps = {
  work: WorkItem
  onDone: () => Promise<void>
}

function WorkModerationCard(props: WorkModerationCardProps) {
  const { toast } = useToast()
  const [expanded, setExpanded] = useState(false)
  const [templateKey, setTemplateKey] = useState<TemplateKey>("EMPTY")
  const [notifyMessage, setNotifyMessage] = useState("")
  const [shouldNotify, setShouldNotify] = useState(true)
  const [markdown, setMarkdown] = useState("")
  const [isMarkdownLoading, setIsMarkdownLoading] = useState(false)

  const [loadWorkDetail, { data: detailData, loading: detailLoading }] =
    useLazyQuery(adminWorkDetailQuery, {
      fetchPolicy: "cache-first",
    })

  const [changeWorkSettingsWithAdmin, { loading: isUpdating }] = useMutation(
    changeWorkAccessTypeMutation,
  )
  const [createMessage, { loading: isSendingMessage }] = useMutation(
    createModeratorMessageMutation,
  )
  const { data: commentsData, loading: commentsLoading } = useQuery(
    adminWorkCommentsQuery,
    {
      skip: !expanded || !props.work.isCommentsEditable,
      fetchPolicy: "network-only",
      variables: {
        workId: props.work.id,
      },
    },
  )

  const selectedTemplate = useMemo(
    () => NOTIFY_TEMPLATES.find((item) => item.key === templateKey),
    [templateKey],
  )

  useEffect(() => {
    if (!expanded) {
      return
    }
    if (props.work.type === "WORK") {
      return
    }
    if (detailData?.work || detailLoading) {
      return
    }

    loadWorkDetail({
      variables: {
        id: props.work.id,
      },
    })
  }, [expanded, detailData, detailLoading, loadWorkDetail, props.work.id])

  useEffect(() => {
    const detail = detailData?.work
    if (!expanded || !detail) {
      return
    }
    if (!(detail.type === "NOVEL" || detail.type === "COLUMN") || !detail.mdUrl) {
      return
    }

    let cancelled = false
    setIsMarkdownLoading(true)

    fetch(detail.mdUrl)
      .then((res) => res.text())
      .then((text) => {
        if (!cancelled) {
          setMarkdown(text)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMarkdown("")
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsMarkdownLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [detailData, expanded])

  const resolvedReason = selectedTemplate?.text ?? ""

  const defaultNotice = resolvedReason
    ? `作品を非公開にしました。理由: ${resolvedReason}`
    : "作品を非公開にしました。"

  useEffect(() => {
    if (!selectedTemplate) {
      return
    }
    setNotifyMessage(selectedTemplate.text)
  }, [selectedTemplate])

  const onChangeAccessType = async (target: "PRIVATE" | "PUBLIC") => {
    try {
      await changeWorkSettingsWithAdmin({
        variables: {
          input: {
            workId: props.work.id,
            accessType: target,
            moderationMessage:
              target === "PRIVATE"
                ? notifyMessage.trim().length > 0
                  ? notifyMessage.trim()
                  : defaultNotice
                : undefined,
          },
        },
      })

      const ownerId = props.work.user?.id
      if (target === "PRIVATE" && shouldNotify && ownerId) {
        await createMessage({
          variables: {
            input: {
              targetUserId: ownerId,
              text:
                notifyMessage.trim().length > 0
                  ? notifyMessage.trim()
                  : defaultNotice,
            },
          },
        })
      }

      await props.onDone()
    } catch (error) {
      toast({
        title: "更新に失敗しました",
        description: error instanceof Error ? error.message : "不明なエラー",
      })
    }
  }

  const detail = detailData?.work
  const mediaImages = [props.work.imageURL, ...props.work.subWorks.map((item) => item.imageUrl)]
    .filter(Boolean) as string[]
  const comments =
    (commentsData?.work?.comments ?? []) as FragmentOf<typeof CommentListItemFragment>[]
  const isReachableOnPublicPostPage =
    !props.work.isDeleted &&
    props.work.adminAccessType === "PUBLIC" &&
    props.work.accessType !== "PRIVATE" &&
    props.work.accessType !== "DRAFT"

  return (
    <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="break-all text-base">
              {props.work.title || "(無題)"}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <Badge variant="outline" className="border-white/20 bg-slate-950/50 text-slate-100">
                #{props.work.id}
              </Badge>
              <Badge variant="secondary" className="bg-white/10 text-slate-100">
                {toWorkTypeText(props.work.type)}
              </Badge>
              <Badge variant={props.work.accessType === "PRIVATE" ? "destructive" : "default"}>
                {toAccessTypeText(props.work.accessType)}
              </Badge>
              <Badge
                variant={props.work.adminAccessType === "PUBLIC" ? "secondary" : "destructive"}
                className={props.work.adminAccessType === "PUBLIC" ? "bg-white/10 text-slate-100" : undefined}
              >
                {toAdminAccessTypeText(props.work.adminAccessType)}
              </Badge>
              {props.work.isDeleted && (
                <Badge variant="destructive">削除済み</Badge>
              )}
              <Badge
                variant={isReachableOnPublicPostPage ? "secondary" : "outline"}
                className={isReachableOnPublicPostPage ? "bg-emerald-500/15 text-emerald-100" : "border-amber-400/30 bg-amber-500/10 text-amber-100"}
              >
                {isReachableOnPublicPostPage ? "公開URLで表示可" : "公開URLでは404想定"}
              </Badge>
              <span>投稿者: {props.work.user?.name ?? "-"}</span>
              <span>@{props.work.user?.login ?? "-"}</span>
              <span>{toDateTimeText(props.work.createdAt, true)}</span>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? (
              <>
                <ChevronUp className="mr-1 size-4" /> 折りたたむ
              </>
            ) : (
              <>
                <ChevronDown className="mr-1 size-4" /> 展開
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(320px,560px)_minmax(420px,1fr)]">
          {props.work.type === "WORK" && (props.work.imageURL || props.work.subWorks.length > 0) ? (
            <div className="overflow-hidden rounded-[32px] border border-white/10 bg-black/20 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <WorkImageView
                workImageURL={props.work.imageURL ?? undefined}
                subWorkImageURLs={props.work.subWorks
                  .map((subWork) => subWork.imageUrl)
                  .filter(Boolean) as string[]}
                mode="dialog"
              />
            </div>
          ) : props.work.smallThumbnailImageURL ? (
            <img
              src={props.work.smallThumbnailImageURL}
              alt={props.work.title}
              loading="lazy"
              className="h-32 w-full rounded-2xl border border-white/10 object-cover"
            />
          ) : (
            <div className="flex h-32 items-center justify-center rounded-2xl border border-white/10 text-slate-400 text-xs">
              サムネイルなし
            </div>
          )}

          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-slate-950/25 p-4">
              <p className="line-clamp-3 text-sm leading-7 text-slate-200">
                {props.work.description || "説明文なし"}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span>複数画像: {props.work.subWorksCount}</span>
                <span className="inline-flex items-center gap-1">
                <ThumbsUp className="size-3" /> {props.work.likesCount}
                </span>
                <span className="inline-flex items-center gap-1">
                <MessageSquare className="size-3" /> {props.work.commentsCount}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="sm"
                variant="secondary"
                className="h-12 rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-5 text-base text-cyan-100 hover:bg-cyan-500/25"
              >
                <Link to={`/posts/${props.work.id}`} target="_blank" rel="noreferrer noopener">
                  {isReachableOnPublicPostPage ? "作品ページ" : "作品ページ(404確認用)"}
                </Link>
              </Button>

              {props.work.user && (
                <div className="[&_button]:!rounded-2xl [&_button]:!border [&_button]:!border-white/10 [&_button]:!bg-white/5 [&_button]:!px-4 [&_button]:!text-slate-100 [&_button:hover]:!bg-white/10 [&_button>span]:!text-slate-100">
                  <LikeButton
                    size={48}
                    text={`いいね ${props.work.likesCount}`}
                    defaultLiked={props.work.isLiked}
                    defaultLikedCount={props.work.likesCount}
                    isSensitive={props.work.isSensitive}
                    targetWorkId={props.work.id}
                    targetWorkOwnerUserId={props.work.user.id}
                    isTargetUserBlocked={props.work.user.isBlocked}
                  />
                </div>
              )}

              <Button
                size="sm"
                variant="outline"
                className="h-12 rounded-2xl border-emerald-400/30 bg-emerald-500/15 px-5 text-base text-emerald-100 hover:bg-emerald-500/25"
                onClick={() => setExpanded((prev) => !prev)}
              >
                <MessageSquare className="mr-1 size-4" />
                コメント {props.work.commentsCount}
              </Button>

              <ReportDialog
                postId={props.work.id}
                buttonClassName="flex h-12 items-center gap-2 rounded-2xl border-amber-400/30 bg-amber-500/15 px-5 text-base text-amber-100 hover:bg-amber-500/25"
              />
            </div>

            <div className="rounded-[28px] border border-rose-400/20 bg-[linear-gradient(180deg,rgba(76,29,57,0.92)_0%,rgba(59,24,52,0.92)_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-base text-rose-50">非公開処理</p>
                  <p className="text-sm text-rose-100/70">テンプレートを選んで理由文を確認してから実行します。</p>
                </div>
                <Badge className="border border-rose-300/20 bg-rose-500/15 text-rose-50 hover:bg-rose-500/15">
                  モデレーター操作
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>通知テンプレート</Label>
                  <Select
                    value={templateKey}
                    onValueChange={(value) => setTemplateKey(value as TemplateKey)}
                  >
                    <SelectTrigger className="h-12 border-rose-300/20 bg-slate-950/40 text-slate-100">
                      <SelectValue placeholder="テンプレートを選択" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-slate-950/95 text-slate-100 backdrop-blur">
                      {NOTIFY_TEMPLATES.map((reason) => (
                        <SelectItem
                          key={reason.key}
                          value={reason.key}
                          className="text-slate-100 focus:bg-white/10 focus:text-white"
                        >
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>利用者に見せる理由文</Label>
                  <Textarea
                    value={notifyMessage}
                    onChange={(event) => setNotifyMessage(event.target.value)}
                    placeholder={defaultNotice}
                    rows={8}
                    className="min-h-[220px] w-full resize-y border-rose-300/20 bg-slate-950/40 text-sm leading-7 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  size="sm"
                  className="h-12 rounded-2xl bg-rose-600 px-5 text-base text-white hover:bg-rose-500"
                  disabled={isUpdating || isSendingMessage}
                  onClick={() => onChangeAccessType("PRIVATE")}
                >
                  <Lock className="mr-1 size-4" />
                  理由付きで非公開
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-12 rounded-2xl border-sky-400/30 bg-sky-500/15 px-5 text-base text-sky-100 hover:bg-sky-500/25"
                  disabled={isUpdating || isSendingMessage}
                  onClick={() => onChangeAccessType("PUBLIC")}
                >
                  <LockOpen className="mr-1 size-4" />
                  公開へ戻す
                </Button>
              </div>
            </div>
          </div>
        </div>

        {expanded && (
          <>
            <Separator className="bg-white/10" />

            <div className="space-y-2">
              <p className="font-medium text-sm">作品詳細</p>
              {detailLoading && (
                <p className="text-slate-400 text-sm">詳細を読み込み中...</p>
              )}

              {props.work.type === "WORK" && mediaImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {mediaImages.map((url, index) => (
                    <img
                      key={`${url}-${index}`}
                      src={url}
                      alt={`work-${index}`}
                      loading="lazy"
                      className="h-28 w-full rounded-2xl border border-white/10 object-cover"
                    />
                  ))}
                </div>
              )}

              {!detailLoading && detail?.type === "VIDEO" && (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 text-sm">
                    <Video className="size-4" /> 動画
                  </div>
                  {detail.url ? (
                    <video
                      controls
                      preload="none"
                      src={detail.url}
                      className="max-h-80 w-full rounded-2xl border border-white/10 bg-black"
                    />
                  ) : (
                    <p className="text-slate-400 text-sm">動画URLがありません。</p>
                  )}
                </div>
              )}

              {!detailLoading && (detail?.type === "NOVEL" || detail?.type === "COLUMN") && (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 text-sm">
                    <BookText className="size-4" />
                    {detail.type === "NOVEL" ? "小説" : "テキスト"}
                  </div>
                  {isMarkdownLoading ? (
                    <p className="text-slate-400 text-sm">本文を読み込み中...</p>
                  ) : markdown.length > 0 ? (
                    <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-slate-950/40 p-3 text-xs text-slate-200">
                      {markdown.slice(0, 2000)}
                    </pre>
                  ) : (
                    <p className="text-slate-400 text-sm">本文を取得できませんでした。</p>
                  )}
                </div>
              )}

              {!detailLoading && !detail && (
                props.work.type !== "WORK" ? (
                  <p className="text-slate-400 text-sm">詳細データが取得できませんでした。</p>
                ) : null
              )}
            </div>

            <Separator className="bg-white/10" />

            {props.work.isCommentsEditable ? (
              <div className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/35 p-4 [&_button]:border-white/10 [&_button]:!bg-white/5 [&_button]:!text-slate-100 [&_button:hover]:!bg-white/10 [&_button:hover]:!text-white [&_button>span]:!text-slate-100 [&_.text-muted-foreground]:!text-slate-400 [&_.text-foreground]:!text-slate-100">
                <p className="font-medium text-sm">コメント</p>
                <WorkCommentList
                  workId={props.work.id}
                  comments={comments}
                  isLoadingComments={commentsLoading}
                  workOwnerIconImageURL={props.work.user?.iconUrl ?? undefined}
                  isWorkOwnerBlocked={props.work.user?.isBlocked ?? false}
                  defaultShowCommentCount={6}
                />
              </div>
            ) : (
              <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-400">
                この作品はコメント不可です。
              </div>
            )}

            <Separator className="bg-white/10" />

            <div className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
              <p className="font-medium text-sm">通知の詳細設定</p>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>通知メッセージ（空ならテンプレートを自動使用）</Label>
                  <Textarea
                    value={notifyMessage}
                    onChange={(event) => setNotifyMessage(event.target.value)}
                    placeholder={defaultNotice}
                    rows={5}
                    className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id={`notify-owner-${props.work.id}`}
                  checked={shouldNotify}
                  onCheckedChange={(checked) => setShouldNotify(Boolean(checked))}
                />
                <Label htmlFor={`notify-owner-${props.work.id}`}>
                  追加でダイレクトメッセージも送る
                </Label>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

const viewerQuery = gql`
  query AdminWorksViewer {
    viewer {
      id
      isModerator
    }
  }
`

const adminWorksQuery = gql`
  query AdminWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      id
      title
      description
      type
      accessType
      adminAccessType
      isDeleted
      createdAt
      likesCount
      commentsCount
      subWorksCount
      imageURL
      isCommentsEditable
      isLiked
      isSensitive
      smallThumbnailImageURL
      subWorks {
        id
        imageUrl
      }
      user {
        id
        name
        login
        iconUrl
        isBlocked
      }
    }
    worksCount(where: $where)
  }
`

const adminWorkDetailQuery = gql`
  query AdminWorkDetail($id: ID!) {
    work(id: $id) {
      id
      type
      url
      mdUrl
      imageURL
      subWorks {
        id
        imageUrl
      }
    }
  }
`

const adminWorkCommentsQuery = graphql(
  `query AdminWorkComments($workId: ID!) {
    work(id: $workId) {
      id
      comments(offset: 0, limit: 128) {
        ...Comment
      }
    }
  }`,
  [CommentListItemFragment],
)

const changeWorkAccessTypeMutation = gql`
  mutation AdminChangeWorkAccessType($input: WorkSettingsWithAdminInput!) {
    changeWorkSettingsWithAdmin(input: $input)
  }
`

const createModeratorMessageMutation = gql`
  mutation AdminCreateModeratorMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      id
    }
  }
`
