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
import { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { CalendarHeartIcon } from "lucide-react"

type Props = {
  user: FragmentOf<typeof userProfileFragment>
}

export const UserContents = (props: Props) => {
  const [activeTab, setActiveTab] = useState("ポートフォリオ")

  const [workPage, setWorkPage] = useState(0)

  const [novelPage, setNovelPage] = useState(0)

  const [columnPage, setColumnPage] = useState(0)

  const [videoPage, setVideoPage] = useState(0)

  const [albumsPage, setAlbumsPage] = useState(0)

  const [foldersPage, setFoldersPage] = useState(0)

  const [stickersPage, setStickersPage] = useState(0)

  console.log(props.user.createdAt)

  return (
    <div className="flex flex-col space-y-4">
      <UserTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userId={props.user.id}
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
                  <p className="text-sm">{props.user.biography}</p>
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
                userPickupWorks={props.user.featuredWorks ?? []}
                userPickupSensitiveWorks={
                  props.user.featuredSensitiveWorks ?? []
                }
              />
              <Suspense fallback={<AppLoadingPage />}>
                <UserContentsContainer
                  userId={props.user.id}
                  userLogin={props.user.login}
                />
              </Suspense>
            </>
          )}
          {activeTab === "画像" && (
            <UserWorksContents
              userId={props.user.id}
              page={workPage}
              setPage={setWorkPage}
              workType="WORK"
            />
          )}
          {activeTab === "小説" && (
            <UserNovelsContents
              userId={props.user.id}
              page={novelPage}
              setPage={setNovelPage}
              workType="NOVEL"
            />
          )}
          {activeTab === "動画" && (
            <UserWorksContents
              userId={props.user.id}
              page={videoPage}
              setPage={setVideoPage}
              workType="VIDEO"
            />
          )}
          {activeTab === "コラム" && (
            <UserNovelsContents
              userId={props.user.id}
              page={columnPage}
              setPage={setColumnPage}
              workType="COLUMN"
            />
          )}
          {activeTab === "シリーズ" && (
            <UserAlbumsContents
              userId={props.user.id}
              page={albumsPage}
              setPage={setAlbumsPage}
              orderBy="DATE_CREATED"
              rating={null}
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

export const userProfileFragment = graphql(
  `fragment UserProfile on UserNode @_unmask {
    id
    biography
    login
    name
    headerImageUrl
    headerImageUrl
    createdAt
    biography
    instagramAccountId
    twitterAccountId
    githubAccountId
    mailAddress
    featuredSensitiveWorks {
      ...PartialWorkFields
    }
    featuredWorks {
      ...PartialWorkFields
    }
  }`,
  [partialWorkFieldsFragment],
)
