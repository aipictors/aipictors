import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { XIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { useViewerRatings } from "~/hooks/use-viewer-ratings"
import {
  readSensitiveNewWorksProgress,
  type SensitiveNewWorksProgress,
  toResumePage,
  writeSensitiveNewWorksProgress,
} from "~/utils/sensitive-new-works-progress"

const PER_PAGE = 32

type Props = {
  /** 新着一覧の今のページ（新着タブを見ていないときは null） */
  currentPage: number | null
  onResume: (page: number) => void
}

/**
 * 新着一覧の「前回の続きから」
 * 前回見たときからの新着の数を出し、増えた分だけずらして前回の位置に戻す
 */
export function SensitiveContinueBanner(props: Props): React.ReactNode {
  const t = useTranslation()
  const { isReady, sensitiveRatings } = useViewerRatings()
  const [previous, setPrevious] = useState<SensitiveNewWorksProgress | null>(
    null,
  )
  const [isDismissed, setIsDismissed] = useState(false)
  const isInitialized = useRef(false)

  // サーバーの HTML と合わせるため、読むのは表示のあと
  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true
    setPrevious(readSensitiveNewWorksProgress())
  }, [])

  // 新着を見ているあいだは今の位置と時刻を記録する
  useEffect(() => {
    if (props.currentPage === null || !isInitialized.current) return
    const stored = readSensitiveNewWorksProgress()
    // 前回の位置が残っているうちは、1 ページ目を開いただけでは消さない
    const page =
      props.currentPage === 0 && !isDismissed
        ? Math.max(stored?.page ?? 0, 0)
        : props.currentPage
    writeSensitiveNewWorksProgress({ page, at: Date.now() })
  }, [props.currentPage, isDismissed])

  const { data } = useQuery(newWorksCountQuery, {
    skip: previous === null || !isReady,
    variables: {
      where: {
        ratings: sensitiveRatings,
        accessTypes: ["PUBLIC"],
        createdAtAfter: new Date(previous?.at ?? 0).toISOString(),
      },
    },
  })

  if (previous === null || isDismissed) {
    return null
  }

  const newCount = data?.worksCount ?? 0
  const resumePage = toResumePage(previous.page, newCount, PER_PAGE)

  if (newCount === 0 && previous.page === 0) {
    return null
  }

  // すでに続きの位置にいるなら出さない
  if (props.currentPage !== null && props.currentPage > 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
      <p className="min-w-0 flex-1">
        {newCount > 0
          ? t(
              `前回から ${newCount.toLocaleString()} 件の新着があります`,
              `${newCount.toLocaleString()} new works since your last visit`,
            )
          : t("前回の続きから見られます", "Pick up where you left off")}
      </p>
      <Button
        size="sm"
        variant="secondary"
        className="shrink-0"
        onClick={() => props.onResume(previous.page > 0 ? resumePage : 0)}
      >
        {previous.page > 0
          ? t(
              `続きから（${resumePage + 1}ページ目）`,
              `Resume (page ${resumePage + 1})`,
            )
          : t("新着を見る", "See new works")}
      </Button>
      <button
        type="button"
        aria-label={t("閉じる", "Close")}
        className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted"
        onClick={() => {
          setIsDismissed(true)
          writeSensitiveNewWorksProgress({ page: 0, at: Date.now() })
        }}
      >
        <XIcon className="size-4" />
      </button>
    </div>
  )
}

const newWorksCountQuery = graphql(
  `query SensitiveNewWorksCount($where: WorksWhereInput) {
    worksCount(where: $where)
  }`,
)
