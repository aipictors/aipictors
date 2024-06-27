import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { SnsIconLink } from "@/_components/sns-icon"
import { Card } from "@/_components/ui/card"
import type { userQuery } from "@/_graphql/queries/user/user"
import { UserAlbumsContents } from "@/routes/($lang)._main.users.$user/_components/user-albums-contents"
import { UserContentsContainer } from "@/routes/($lang)._main.users.$user/_components/user-contents-cotainer"
import { UserFoldersContents } from "@/routes/($lang)._main.users.$user/_components/user-folders-contents"
import { UserPickupContents } from "@/routes/($lang)._main.users.$user/_components/user-pickup-contents"
import { UserStickersContents } from "@/routes/($lang)._main.users.$user/_components/user-stickers-contents"
import { UserNovelsContents } from "@/routes/($lang)._main.users.$user.novels/_components/user-novels-contents"
import { UserTabs } from "@/routes/($lang)._main.users.$user/_components/user-tabs"
import { UserWorksContents } from "@/routes/($lang)._main.users.$user/_components/user-works-contents "
import type { ResultOf } from "gql.tada"
import { Suspense, useState } from "react"

type Props = {
  user: NonNullable<ResultOf<typeof userQuery>["user"]>
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

  return (
    <div className="p-4">
      <UserTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userId={props.user.id}
      />
      <div className="min-h-96">
        <Suspense fallback={<AppLoadingPage />}>
          {activeTab === "ポートフォリオ" && (
            <>
              <div className="p-1">
                <Card className="p-2">
                  <p className="font-bold">プロフィール</p>
                  <p className="text-sm">{props.user.biography}</p>
                  <div className="flex items-center space-x-2.5 p-2">
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
                  userPickupWorks={props.user.featuredWorks}
                  userPickupSensitiveWorks={props.user.featuredSensitiveWorks}
                />
                <Suspense fallback={<AppLoadingPage />}>
                  <UserContentsContainer
                    userId={props.user.id}
                    userLogin={props.user.login}
                  />
                </Suspense>
              </div>
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
