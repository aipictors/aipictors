import { SnsIconLink } from "~/components/sns-icon"
import { Card } from "~/components/ui/card"
import { type FragmentOf, graphql } from "gql.tada"
import { CalendarHeartIcon } from "lucide-react"
import { Link } from "@remix-run/react"
import { HomeWorkFragment } from "~/routes/($lang)._main._index/components/home-work-section"
import type { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"
import type { HomeNovelsWorkListItemFragment } from "~/routes/($lang)._main._index/components/home-novels-works-section"
import type { HomeVideosWorkListItemFragment } from "~/routes/($lang)._main._index/components/home-video-works-section"
import { useTranslation } from "~/hooks/use-translation"
import { UserSensitiveTabs } from "~/routes/($lang).r.users.$user._index/components/user-sensitive-tabs"
import { UserContentsContainer } from "~/routes/($lang)._main.users.$user._index/components/user-contents-cotainer"
import { UserPickupContents } from "~/routes/($lang)._main.users.$user._index/components/user-pickup-contents"

type Props = {
  user: FragmentOf<typeof UserProfileIconFragment>
  works?: FragmentOf<typeof HomeWorkFragment>[]
  novelWorks?: FragmentOf<typeof HomeNovelsWorkListItemFragment>[]
  columnWorks?: FragmentOf<typeof HomeWorkFragment>[]
  videoWorks?: FragmentOf<typeof HomeVideosWorkListItemFragment>[]
  worksCount?: number
}

export function UserSensitiveContentBody(props: Props) {
  const t = useTranslation()

  const formatBiography = (biography: string): (string | JSX.Element)[] => {
    // URLを検出する正規表現
    const urlPattern = /https?:\/\/[^\s]+/g
    const parts: string[] = biography.split(urlPattern)
    const urls: string[] | null = biography.match(urlPattern)

    const elements: (string | JSX.Element)[] = []

    parts.forEach((part, index) => {
      // 改行に対応するために、各パートを改行で分割
      const splitByLineBreaks = part.split("\n")

      splitByLineBreaks.forEach((line, lineIndex) => {
        elements.push(line)
        if (lineIndex < splitByLineBreaks.length - 1) {
          // 改行を挿入
          elements.push(
            <br key={`line-break-${index}-${lineIndex.toString()}`} />,
          )
        }
      })

      if (urls?.[index]) {
        elements.push(
          <Link
            key={index.toString()}
            to={urls[index]}
            target="_blank"
            rel="noopener noreferrer"
          >
            {urls[index]}
          </Link>,
        )
      }
    })

    return elements
  }

  return (
    <div className="flex flex-col space-y-4">
      <UserSensitiveTabs
        activeTab={t("ポートフォリオ", "Portfolio")}
        user={props.user}
      />
      <div className="flex min-h-96 flex-col gap-y-4">
        <Card className="flex flex-col gap-y-4 p-4">
          <p className="flex items-center space-x-2 text-sm opacity-80">
            <CalendarHeartIcon className="h-4 w-4" />
            {props.user.createdAt < 1672953307 ? (
              <>
                <p>
                  {new Date(1672953307 * 1000).toLocaleDateString("ja-JP", {
                    timeZone: "Asia/Tokyo",
                    year: "numeric",
                    month: "2-digit",
                  })}
                </p>
                <p>{t("以前開始", "Started before")}</p>
              </>
            ) : (
              <>
                <p>
                  {new Date(1672953307 * 1000).toLocaleDateString("ja-JP", {
                    timeZone: "Asia/Tokyo",
                    year: "numeric",
                    month: "2-digit",
                  })}
                </p>
                <p>{t("頃開始", "Started around")}</p>
              </>
            )}
          </p>
          {props.user.biography && (
            <p className="text-sm">
              {formatBiography(
                t(
                  props.user.biography,
                  props.user.enBiography && props.user.enBiography.length > 0
                    ? props.user.enBiography
                    : (props.user.biography ?? ""),
                ),
              )}
            </p>
          )}
          <div className="flex items-center gap-x-4">
            {props.user.twitterAccountId && (
              <SnsIconLink
                url={`https://twitter.com/${props.user.twitterAccountId}`}
              />
            )}
            {props.user.instagramAccountId && (
              <SnsIconLink
                url={`https://www.instagram.com/${props.user.instagramAccountId}`}
              />
            )}
            {props.user.githubAccountId && (
              <SnsIconLink
                url={`https://www.github.com/${props.user.githubAccountId}`}
              />
            )}
            {props.user.mailAddress && (
              <SnsIconLink url={`mailto:${props.user.mailAddress}`} />
            )}
          </div>
        </Card>
        <UserPickupContents
          userPickupWorks={props.user.featuredSensitiveWorks ?? []}
          userId={props.user.id}
          isSensitive={true}
        />
        <UserContentsContainer
          userId={props.user.id}
          userLogin={props.user.login}
          isSensitive={true}
          works={props.works ?? []}
          novelWorks={props.novelWorks ?? []}
          columnWorks={props.columnWorks ?? []}
          videoWorks={props.videoWorks ?? []}
        />
      </div>
    </div>
  )
}

export const UserProfileFragment = graphql(
  `fragment UserProfile on UserNode @_unmask {
    id
    biography
    login
    name
    headerImageUrl
    headerImageUrl
    createdAt
    instagramAccountId
    twitterAccountId
    githubAccountId
    mailAddress
    featuredWorks {
      ...HomeWork
    }
    featuredSensitiveWorks {
      ...HomeWork
    }
    pass {
      type
    }
    isModerator
  }`,
  [HomeWorkFragment],
)
