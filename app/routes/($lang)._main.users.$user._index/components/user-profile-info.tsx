import { RiEye2Line, RiHeartLine } from "@remixicon/react"
import type React from "react"
import { useContext, useState } from "react"
import { SupportButton } from "~/components/support-button"
import { AuthContext } from "~/contexts/auth-context"
import { useCoinBalance } from "~/hooks/use-coin-balance"
import { useTranslation } from "~/hooks/use-translation"
import { hasViewerRequestSession } from "~/lib/viewer-request-headers"
import { cn } from "~/lib/utils"

type UserProfileInfoProps = {
  userId: string
  userIconUrl?: string | null
  name: string
  receivedLikesCount: number
  receivedViewsCount: number
  awardsCount: number
  followersCount: number
  biography: string
}

const UserProfileInfo: React.FC<UserProfileInfoProps> = ({
  userId,
  userIconUrl,
  name,
  receivedLikesCount,
  receivedViewsCount,
  awardsCount,
  followersCount,
  biography,
}) => {
  const [showFullBiography, setShowFullBiography] = useState(false)
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const { balance } = useCoinBalance()
  const hasViewerSession = hasViewerRequestSession()

  const toggleBiography = () => {
    setShowFullBiography(!showFullBiography)
  }

  const truncatedBiography = showFullBiography
    ? biography
    : biography.slice(0, 100)

  const canShowSupportButton =
    (!authContext.isLoading || hasViewerSession) &&
    (!authContext.isNotLoggedIn || hasViewerSession) &&
    authContext.userId !== userId

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="font-bold text-2xl">{name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center text-base">
              <RiHeartLine className="mr-1 fill-red-500" />
              {receivedLikesCount}
            </span>
            <span className="flex items-center text-base">
              <RiEye2Line className="mr-1" />
              {receivedViewsCount}
            </span>
            <span className="text-base">
              {t("入賞回数", "Awards")} {awardsCount} {t("回", "times")}
            </span>
          </div>
          <div className="text-base mt-2">
            <span>
              {followersCount} {t("フォロワー", "followers")}
            </span>
          </div>
        </div>

        {canShowSupportButton && (
          <SupportButton
            targetUserId={userId}
            targetUserName={name}
            targetUserIconUrl={userIconUrl}
            freeCoinBalance={balance?.freeCoinsBalance ?? 0}
            premiumCoinBalance={balance?.premiumCoinsBalance ?? 0}
          />
        )}

        {biography && (
          <div>
            <p
              className={cn("text-gray", {
                truncate: !showFullBiography,
              })}
            >
              {truncatedBiography}
              {!showFullBiography && biography.length > 100 && (
                // biome-ignore lint/a11y/useKeyWithClickEvents: Legacy UI (click-only)
                <span
                  className="cursor-pointer text-blue-500"
                  onClick={toggleBiography}
                >
                  {t(" 続きを読む", "Read More")}
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfileInfo
