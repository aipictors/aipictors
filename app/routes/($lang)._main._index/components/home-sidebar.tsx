import type { FragmentOf } from "gql.tada"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { Skeleton } from "~/components/ui/skeleton"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { HomeNewCreators } from "~/routes/($lang)._main._index/components/home-discovery-links"
import { HomeNewCommentsSection } from "~/routes/($lang)._main._index/components/home-new-comments"
import type { HomeTagFragment } from "~/routes/($lang)._main._index/components/home-tags-section"
import type { HomePageState } from "~/routes/($lang)._main._index/hooks/use-home-page-state"

/**
 * ホームの右カラム（スクロールしても見えるように固定）
 */
export function HomeSidebar(
  props: HomePageState["sidebar"] & {
    /** PC の右カラムに控えめに出す人気タグ */
    recommendedTags?: FragmentOf<typeof HomeTagFragment>[]
    /** R18 のトップ（リンクを /r に） */
    isSensitive?: boolean
  },
) {
  const t = useTranslation()
  const {
    advertisements,
    onClickAdvertisement,
    isSubscriptionUser,
    isHomeSidebarLoading,
    sidebarNewPostedUsers,
    sidebarNewComments,
  } = props

  return (
    <aside
      className="flex w-full flex-col space-y-4 md:sticky md:top-20 md:w-[262px] md:max-w-[262px] md:shrink-0 md:self-start max-md:[contain-intrinsic-height:auto_900px] max-md:[content-visibility:auto]"
      // 見積もりの高さ（スマホだけ。PC は content-visibility なし）。cls_shift の記録で実際の高さと比べる
      data-cih="900"
    >
      <div className="flex w-full flex-col space-y-4">
        {!isSubscriptionUser &&
          advertisements &&
          advertisements.randomCustomerAdvertisement && (
            <div className="relative border">
              <Link
                onClick={onClickAdvertisement}
                target="_blank"
                to={advertisements.randomCustomerAdvertisement.url}
              >
                <img
                  src={advertisements.randomCustomerAdvertisement.imageUrl}
                  alt="Advertisement"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  className="h-auto w-full"
                />
              </Link>
              <div className="absolute top-0 right-0">
                <CrossPlatformTooltip
                  text={t(
                    "提携広告です、広告主様を募集中です。メールまたはDMにてご連絡ください。",
                    "This is a partnered advertisement. We are accepting new advertisers. Please contact us via email or DM.",
                  )}
                />
              </div>
            </div>
          )}
        {!isSubscriptionUser && (
          <Link to="/generation">
            <img
              src="https://assets.aipictors.com/Aipictors_01_640.webp"
              alt="Aipictors Logo"
              width={640}
              height={640}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              className="h-auto w-full"
            />
          </Link>
        )}
        {/* ここから下は PC だけ（スマホはアプリと同じく作品の一覧で終える）。新規クリエイターはスマホでは左の作品の一覧の後ろに出す */}
        {isHomeSidebarLoading && sidebarNewComments.length === 0 && (
          <div className="hidden space-y-3 md:block">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}
        {(props.recommendedTags?.length ?? 0) > 0 && (
          <section className="hidden space-y-2 md:block">
            <h2 className="font-bold text-sm">
              {t("人気タグ", "Popular tags")}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {props.recommendedTags?.map((tag) => {
                // 英語の画面で英語名のないタグは出さない（R18 は訳さないので元の名前）
                const label =
                  t.tag(tag.tagName, tag.enTagName) ??
                  (props.isSensitive ? tag.tagName : null)
                if (label === null) return null
                return (
                  <Link
                    key={tag.tagName}
                    to={`${props.isSensitive ? "/r" : ""}/tags/${encodeURIComponent(tag.tagName)}`}
                    className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground text-xs transition-colors hover:text-foreground"
                  >
                    #{label}
                  </Link>
                )
              })}
            </div>
          </section>
        )}
        <HomeNewCreators
          className="hidden md:block"
          users={sidebarNewPostedUsers}
          isSensitive={props.isSensitive}
          variant="sidebar"
        />
        {sidebarNewComments.length > 0 && (
          <div className="hidden md:block">
            <HomeNewCommentsSection
              comments={sidebarNewComments}
              isSensitive={props.isSensitive}
            />
          </div>
        )}
      </div>
    </aside>
  )
}
