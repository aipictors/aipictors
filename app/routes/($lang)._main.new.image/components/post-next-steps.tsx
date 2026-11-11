import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Heart, Sparkles, Trophy } from "lucide-react"
import { useEffect } from "react"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { trackGrowthEvent } from "~/utils/track-growth-event"

type Props = {
  workId: string
}

/**
 * 投稿完了画面の「次の一手」
 * 初投稿なら、おすすめでの優先表示と公式botからの反応が届くことを伝える。ほかの人の作品への反応・お題への参加を案内する
 */
export function PostNextSteps(props: Props) {
  const t = useTranslation()

  const { data, refetch } = useQuery(postNextStepsWorkQuery, {
    variables: { id: props.workId },
    fetchPolicy: "network-only",
  })

  const work = data?.work ?? null

  // 投稿直後は読み取り用の DB にまだ無いことがあるので、少し待って 1 回だけ読み直す
  useEffect(() => {
    if (work !== null) return
    const timer = setTimeout(() => {
      refetch().catch(() => {})
    }, 3000)
    return () => clearTimeout(timer)
  }, [work, refetch])

  const isFirstPost = work?.isFirstPost === true

  useEffect(() => {
    if (isFirstPost) trackGrowthEvent("first_post_complete", "post_dialog")
  }, [isFirstPost])

  const onClick = (step: string) => {
    trackGrowthEvent("post_next_step", step)
  }

  return (
    <div className="space-y-3">
      {isFirstPost && (
        <div className="rounded-md border border-pink-300 bg-pink-50 p-3 text-sm dark:border-pink-900 dark:bg-pink-950/40">
          <p className="font-bold">
            {t(
              "🎉 はじめての投稿おめでとうございます！",
              "🎉 Congratulations on your first post!",
            )}
          </p>
          <p className="mt-1 opacity-80">
            {t(
              "これから48時間、新人さんの作品として「おすすめ」で優先して表示されます。公式botのぴくたーちゃんからも、いいねと歓迎のコメントが届きます。",
              "For the next 48 hours, your work will be featured in the For you feed as a newcomer's work. Our official bot Pictor-chan will also send a like and a welcome comment.",
            )}
          </p>
        </div>
      )}
      <div className="space-y-1">
        <p className="font-bold text-sm">
          {t("次にやってみよう", "What to do next")}
        </p>
        <Link
          to="/new-works"
          onClick={() => onClick("new_works")}
          className="flex items-start gap-2 rounded-md p-2 text-sm hover:bg-muted"
        >
          <Heart className="mt-0.5 size-4 shrink-0 text-pink-500" />
          <span>
            {t(
              "ほかの人の新着作品にいいね・コメントする",
              "Like and comment on other new works",
            )}
            <span className="block text-xs opacity-70">
              {t(
                "反応すると、あなたの作品を見に来てもらえるきっかけになります",
                "Reacting to others is a great way to get them to visit your works",
              )}
            </span>
          </span>
        </Link>
        <Link
          to="/themes"
          onClick={() => onClick("themes")}
          className="flex items-start gap-2 rounded-md p-2 text-sm hover:bg-muted"
        >
          <Sparkles className="mt-0.5 size-4 shrink-0 text-amber-500" />
          <span>
            {t("今日のお題に参加する", "Join today's theme")}
            <span className="block text-xs opacity-70">
              {t(
                "お題の作品はお題のページにまとめて表示されます",
                "Theme works are listed together on the theme page",
              )}
            </span>
          </span>
        </Link>
        {isFirstPost && (
          <Link
            to="/rankings/rookie"
            onClick={() => onClick("rookie_ranking")}
            className="flex items-start gap-2 rounded-md p-2 text-sm hover:bg-muted"
          >
            <Trophy className="mt-0.5 size-4 shrink-0 text-sky-500" />
            <span>
              {t("ルーキーランキングを見る", "See the rookie ranking")}
              <span className="block text-xs opacity-70">
                {t(
                  "新人さんだけの毎日のランキングです",
                  "A daily ranking just for newcomers",
                )}
              </span>
            </span>
          </Link>
        )}
      </div>
    </div>
  )
}

const postNextStepsWorkQuery = graphql(
  `query PostNextStepsWork($id: ID!) {
    work(id: $id) {
      id
      isFirstPost
    }
  }`,
)
