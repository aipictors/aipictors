import { type FragmentOf, graphql } from "gql.tada"
import { PenLine } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { UserBiography } from "~/routes/($lang)._main.users.$user._index/components/user-biography"

type Props = {
  user: FragmentOf<typeof UserAboutCardFragment>
}

export function UserAboutCard(props: Props) {
  const t = useTranslation()

  const startedAtText = new Date(
    props.user.createdAt * 1000,
  ).toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
  })

  const biographyText = t(
    props.user.biography ?? "",
    props.user.enBiography && props.user.enBiography.length > 0
      ? props.user.enBiography
      : (props.user.biography ?? ""),
  ).trim()

  const isBiographyEmpty = biographyText.length === 0
  const isBiographyShort = biographyText.length > 0 && biographyText.length < 24

  return (
    <section className="hidden space-y-3 md:block">
      <div className="text-muted-foreground text-xs">
        <span>
          {startedAtText} {t("開始", "Started")}
        </span>
        <span className="mx-2">•</span>
        <span>
          {t("ID", "ID")}: <span className="font-mono">{props.user.id}</span>
        </span>
      </div>

      <div className="space-y-2">
        {!isBiographyEmpty && (
          <p className="text-sm leading-relaxed">
            <UserBiography text={biographyText} />
          </p>
        )}

        {(isBiographyEmpty || isBiographyShort) && (
          <div className="text-muted-foreground">
            <div className="flex items-start gap-2 text-sm">
              <PenLine className="mt-0.5 size-4 text-muted-foreground" />
              <p className="whitespace-pre-line text-muted-foreground text-sm">
                {t(
                  "この作家さんの\n・作風\n・得意ジャンル\n・活動内容\nなどを紹介できます",
                  "You can introduce\n• style\n• genres\n• activities\nand more",
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export const UserAboutCardFragment = graphql(
  `fragment UserAboutCard on UserNode @_unmask {
    id
    createdAt
    biography
    enBiography
    twitterAccountId
    instagramAccountId
    githubAccountId
    mailAddress
  }`,
)
