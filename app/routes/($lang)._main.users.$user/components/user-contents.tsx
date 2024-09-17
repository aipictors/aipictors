import { AppLoadingPage } from "~/components/app/app-loading-page"
import { SnsIconLink } from "~/components/sns-icon"
import { Card } from "~/components/ui/card"
import { UserAlbumsContents } from "~/routes/($lang)._main.users.$user/components/user-albums-contents"
import { UserContentsContainer } from "~/routes/($lang)._main.users.$user/components/user-contents-cotainer"
import { UserFoldersContents } from "~/routes/($lang)._main.users.$user/components/user-folders-contents"
import { UserPickupContents } from "~/routes/($lang)._main.users.$user/components/user-pickup-contents"
import { UserStickersContents } from "~/routes/($lang)._main.users.$user/components/user-stickers-contents"
import { UserNovelsContents } from "~/routes/($lang)._main.users.$user.novels/components/user-novels-contents"
import { UserTabs } from "~/routes/($lang)._main.users.$user/components/user-tabs"
import { UserWorksContents } from "~/routes/($lang)._main.users.$user/components/user-works-contents "
import { type FragmentOf, graphql } from "gql.tada"
import { Suspense, useState } from "react"
import { CalendarHeartIcon } from "lucide-react"
import { Link } from "@remix-run/react"
import { HomeWorkFragment } from "~/routes/($lang)._main._index/components/home-work-section"
import type { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user/components/user-profile-name-icon"
import type { HomeNovelsWorkListItemFragment } from "~/routes/($lang)._main._index/components/home-novels-works-section"
import type { HomeVideosWorkListItemFragment } from "~/routes/($lang)._main._index/components/home-video-works-section"

type Props = {
  user: FragmentOf<typeof UserProfileIconFragment>
  isSensitive?: boolean
  works?: FragmentOf<typeof HomeWorkFragment>[]
  novelWorks?: FragmentOf<typeof HomeNovelsWorkListItemFragment>[]
  columnWorks?: FragmentOf<typeof HomeWorkFragment>[]
  videoWorks?: FragmentOf<typeof HomeVideosWorkListItemFragment>[]
  worksCount?: number
  novelWorksCount?: number
  columnWorksCount?: number
  videoWorksCount?: number
}

export function UserContents(props: Props) {
  const [activeTab, setActiveTab] = useState("ポートフォリオ")

  const [workPage, setWorkPage] = useState(0)

  const [novelPage, setNovelPage] = useState(0)

  const [columnPage, setColumnPage] = useState(0)

  const [videoPage, setVideoPage] = useState(0)

  const [albumsPage, setAlbumsPage] = useState(0)

  const [foldersPage, setFoldersPage] = useState(0)

  const [stickersPage, setStickersPage] = useState(0)

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
      <UserTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userId={props.user.id}
        isSensitive={props.isSensitive}
      />
      <div className="flex min-h-96 flex-col gap-y-4">
        <Suspense fallback={<AppLoadingPage />}>
          {activeTab === "ポートフォリオ" && (
            <>
              <Card className="flex flex-col gap-y-4 p-4">
                <p className="flex items-center space-x-2 text-sm opacity-80">
                  <CalendarHeartIcon className="h-4 w-4" />
                  {props.user.createdAt < 1672953307 ? (
                    <>
                      <p>
                        {new Date(1672953307 * 1000).toLocaleDateString(
                          "ja-JP",
                          {
                            timeZone: "Asia/Tokyo",
                            year: "numeric",
                            month: "2-digit",
                          },
                        )}
                      </p>
                      <p>以前開始</p>
                    </>
                  ) : (
                    <>
                      <p>
                        {new Date(1672953307 * 1000).toLocaleDateString(
                          "ja-JP",
                          {
                            timeZone: "Asia/Tokyo",
                            year: "numeric",
                            month: "2-digit",
                          },
                        )}
                      </p>
                      <p>頃開始</p>
                    </>
                  )}
                </p>
                {props.user.biography && (
                  <p className="text-sm">
                    {formatBiography(props.user.biography)}
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
              {props.isSensitive ? (
                <UserPickupContents
                  userPickupWorks={props.user.featuredSensitiveWorks ?? []}
                  userId={props.user.id}
                  isSensitive={true}
                />
              ) : (
                <UserPickupContents
                  userPickupWorks={props.user.featuredWorks ?? []}
                  userId={props.user.id}
                  isSensitive={false}
                />
              )}
              <UserContentsContainer
                userId={props.user.id}
                userLogin={props.user.login}
                isSensitive={props.isSensitive}
                works={props.works ?? []}
                novelWorks={props.novelWorks ?? []}
                columnWorks={props.columnWorks ?? []}
                videoWorks={props.videoWorks ?? []}
                worksCount={props.worksCount ?? 0}
                novelWorksCount={props.novelWorksCount ?? 0}
                columnWorksCount={props.columnWorksCount ?? 0}
                videoWorksCount={props.videoWorksCount ?? 0}
              />
            </>
          )}
          {activeTab === "画像" && (
            <UserWorksContents
              userId={props.user.id}
              page={workPage}
              setPage={setWorkPage}
              workType="WORK"
              isSensitive={props.isSensitive}
            />
          )}
          {activeTab === "小説" && (
            <UserNovelsContents
              userId={props.user.id}
              page={novelPage}
              setPage={setNovelPage}
              workType="NOVEL"
              isSensitive={props.isSensitive}
            />
          )}
          {activeTab === "動画" && (
            <UserWorksContents
              userId={props.user.id}
              page={videoPage}
              setPage={setVideoPage}
              workType="VIDEO"
              isSensitive={props.isSensitive}
            />
          )}
          {activeTab === "コラム" && (
            <UserNovelsContents
              userId={props.user.id}
              page={columnPage}
              setPage={setColumnPage}
              workType="COLUMN"
              isSensitive={props.isSensitive}
            />
          )}
          {activeTab === "シリーズ" && (
            <UserAlbumsContents
              userId={props.user.id}
              page={albumsPage}
              setPage={setAlbumsPage}
              orderBy="DATE_CREATED"
              rating={props.isSensitive ? "R18" : "G"}
              sort="DESC"
            />
          )}
          {activeTab === "コレクション" && (
            <UserFoldersContents
              userId={props.user.id}
              page={foldersPage}
              setPage={setFoldersPage}
              orderBy="DATE_CREATED"
              rating={null}
              sort="DESC"
              isSensitive={props.isSensitive}
            />
          )}
          {activeTab === "スタンプ" && (
            <UserStickersContents
              userId={props.user.id}
              page={stickersPage}
              setPage={setStickersPage}
            />
          )}
        </Suspense>
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
  }`,
  [HomeWorkFragment],
)
