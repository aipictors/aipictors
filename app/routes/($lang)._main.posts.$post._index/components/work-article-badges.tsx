import type { FragmentOf } from "gql.tada"
import { BadgeCheck } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { useWorkOriginalJudgment } from "~/lib/work-original-judgment"
import type { workArticleFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-article-fragments"
import {
  toAiRankingPath,
  toDateTextUrl,
} from "~/routes/($lang)._main.posts.$post._index/components/work-article-utils"
import { toRatingText } from "~/utils/work/to-rating-text"
import { toStyleText } from "~/utils/work/to-style-text"

/**
 * オリジナル（運営の判定）、モデル、対象年齢、スタイル、入賞のバッジ
 */
export function WorkArticleBadges(props: {
  work: FragmentOf<typeof workArticleFragment>
}) {
  const t = useTranslation()
  const originalJudgment = useWorkOriginalJudgment(props.work.id)

  return (
    <div className="flex flex-wrap items-center gap-2">
      {originalJudgment === "ORIGINAL" && (
        <Link to="/fan-works-policy">
          <Badge
            className="flex items-center gap-1"
            title={t(
              "運営がオリジナル作品と確認した作品です",
              "Confirmed as an original work by Aipictors",
            )}
          >
            <BadgeCheck className="size-4" />
            <span className="text-md">
              {t("オリジナル（運営確認）", "Original (verified)")}
            </span>
          </Badge>
        </Link>
      )}
      {props.work.model !== undefined &&
        props.work.model !== null &&
        props.work.model?.length !== 0 && (
          <Link to={`/models/${props.work.model}`}>
            <Badge variant="secondary" className="flex items-center space-x-2">
              <span className="text-md">
                {t("使用モデル名", "model name used")}
                {":"}
              </span>
              <span className="text-md">{props.work.model}</span>
            </Badge>
          </Link>
        )}
      {props.work.rating !== null && (
        <Badge variant="secondary" className="flex items-center space-x-2">
          <span className="text-md">
            {t("対象年齢", "target age")}
            {":"}
          </span>
          {toRatingText(props.work.rating)}
        </Badge>
      )}
      <Badge variant="secondary" className="flex items-center space-x-2">
        <span className="text-md">
          {t("スタイル", "style")}
          {":"}
        </span>
        {toStyleText(props.work.style)}
      </Badge>

      {props.work.isPromotion === true && (
        <Badge variant="secondary" className="flex items-center space-x-2">
          <span className="text-md">{t("宣伝作品", "Promoted")}</span>
        </Badge>
      )}
      {props.work.dailyRanking && (
        <Link
          to={`/rankings/${toDateTextUrl(props.work.createdAt, "yyyy/MM/dd")}`}
        >
          <Badge variant="secondary" className="flex items-center space-x-2">
            {t("デイリー入賞", "Daily Rank")} {props.work.dailyRanking}{" "}
            {t("位", "Rank")}
          </Badge>
        </Link>
      )}
      {props.work.weeklyRanking && (
        <Badge variant="secondary" className="flex items-center space-x-2">
          {t("ウィークリー入賞", "Weekly Rank")} {props.work.weeklyRanking}{" "}
          {t("位", "Rank")}
        </Badge>
      )}
      {props.work.monthlyRanking && (
        <Link
          to={`/rankings/${toDateTextUrl(props.work.createdAt, "yyyy/MM")}`}
        >
          <Badge variant="secondary" className="flex items-center space-x-2">
            {t("マンスリー入賞", "Monthly Rank")} {props.work.monthlyRanking}{" "}
            {t("位", "Rank")}
          </Badge>
        </Link>
      )}
      {props.work.aiDailyRanking && (
        <Link to={toAiRankingPath(props.work.aiDailyRanking) ?? "/ai-rankings"}>
          <Badge variant="secondary" className="flex items-center space-x-2">
            {t("AIデイリー入賞", "AI Daily Rank")}{" "}
            {props.work.aiDailyRanking.rank} {t("位", "Rank")}
          </Badge>
        </Link>
      )}
      {props.work.aiWeeklyRanking && (
        <Link
          to={toAiRankingPath(props.work.aiWeeklyRanking) ?? "/ai-rankings"}
        >
          <Badge variant="secondary" className="flex items-center space-x-2">
            {t("AIウィークリー入賞", "AI Weekly Rank")}{" "}
            {props.work.aiWeeklyRanking.rank} {t("位", "Rank")}
          </Badge>
        </Link>
      )}
      {props.work.aiMonthlyRanking && (
        <Link
          to={toAiRankingPath(props.work.aiMonthlyRanking) ?? "/ai-rankings"}
        >
          <Badge variant="secondary" className="flex items-center space-x-2">
            {t("AIマンスリー入賞", "AI Monthly Rank")}{" "}
            {props.work.aiMonthlyRanking.rank} {t("位", "Rank")}
          </Badge>
        </Link>
      )}
    </div>
  )
}
