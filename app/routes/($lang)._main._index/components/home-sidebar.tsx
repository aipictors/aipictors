import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { Skeleton } from "~/components/ui/skeleton"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { HomeNewCommentsSection } from "~/routes/($lang)._main._index/components/home-new-comments"
import { HomeNewUsersSection } from "~/routes/($lang)._main._index/components/home-new-users-section"
import type { HomePageState } from "~/routes/($lang)._main._index/hooks/use-home-page-state"

/**
 * ホームの右カラム（スクロールしても見えるように固定）
 */
export function HomeSidebar(props: HomePageState["sidebar"]) {
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
    <aside className="flex w-full flex-col space-y-4 max-md:[contain-intrinsic-height:auto_1700px] max-md:[content-visibility:auto] md:sticky md:top-20 md:w-[262px] md:max-w-[262px] md:shrink-0 md:self-start">
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
        {isHomeSidebarLoading &&
          sidebarNewPostedUsers.length === 0 &&
          sidebarNewComments.length === 0 && (
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-16 w-full" />
            </div>
          )}
        {sidebarNewPostedUsers.length > 0 && (
          <HomeNewUsersSection users={sidebarNewPostedUsers} />
        )}
        {sidebarNewComments.length > 0 && (
          <HomeNewCommentsSection comments={sidebarNewComments} />
        )}
      </div>
    </aside>
  )
}
