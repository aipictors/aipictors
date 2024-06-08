import type {
  WorkCommentsQuery,
  WorkQuery,
  WorksQuery,
} from "@/_graphql/__generated__/graphql"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { WorkArticle } from "@/routes/($lang)._main.works.$work/_components/work-article"
import { WorkCommentList } from "@/routes/($lang)._main.works.$work/_components/work-comment-list"
import { WorkNextAndPrevious } from "@/routes/($lang)._main.works.$work/_components/work-next-and-previous"
import { WorkRelatedList } from "@/routes/($lang)._main.works.$work/_components/work-related-list"
import { WorkUser } from "@/routes/($lang)._main.works.$work/_components/work-user"
import { Suspense } from "react"
import PhotoAlbum from "react-photo-album"
import { WorkAlbum } from "@/_components/work-album"

type Props = {
  work: NonNullable<WorkQuery>["work"]
  tagWorksResp: NonNullable<WorksQuery>["works"]
  newWorks: NonNullable<WorksQuery>["works"]
  comments: NonNullable<WorkCommentsQuery["work"]>["comments"]
}

/**
 * 作品詳細情報
 */
export const WorkContainer = (props: Props) => {
  const work = props.work

  if (!work) {
    return null
  }

  const relatedWorks = work.user.works.map((work) => ({
    smallThumbnailImageURL: work.smallThumbnailImageURL,
    thumbnailImagePosition: work.thumbnailImagePosition ?? 0,
    smallThumbnailImageWidth: work.smallThumbnailImageWidth,
    smallThumbnailImageHeight: work.smallThumbnailImageHeight,
    id: work.id,
    userId: work.userId,
    isLiked: false,
  }))

  const newPhotos = props.newWorks.map((work) => ({
    src: work.largeThumbnailImageURL,
    width: work.largeThumbnailImageWidth,
    height: work.largeThumbnailImageHeight,
    workId: work.id, // 各作品のID
    userId: work.user.id, // 作品の所有者のID
    userIcon:
      work.user?.iconImage?.downloadURL ??
      "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/no-profile.jpg", // 作品の所有者のアイコン
    userName: work.user.name, // 作品の所有者の名前
    workOwnerUserId: work.user.id,
    isLiked: work.isLiked,
  }))

  const tagPhotos = props.tagWorksResp.map((work) => ({
    src: work.largeThumbnailImageURL,
    width: work.largeThumbnailImageWidth,
    height: work.largeThumbnailImageHeight,
    workId: work.id, // 各作品のID
    userId: work.user.id, // 作品の所有者のID
    userIcon:
      work.user?.iconImage?.downloadURL ??
      "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/no-profile.jpg", // 作品の所有者のアイコン
    userName: work.user.name, // 作品の所有者の名前
    workOwnerUserId: work.user.id,
    isLiked: work.isLiked,
  }))

  return (
    <div className="flex w-full overflow-hidden p-0 md:p-4">
      <div className="flex flex-col items-center justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-screen-lg">
          <Suspense fallback={<AppLoadingPage />}>
            <WorkArticle work={work} />
          </Suspense>
          <WorkRelatedList works={relatedWorks} />
          <Suspense fallback={<AppLoadingPage />}>
            <WorkCommentList workId={work.id} comments={props.comments} />
          </Suspense>
          <div className="mt-2 block md:mt-0 lg:hidden">
            <Suspense>
              <WorkUser
                userId={work.user.id}
                userName={work.user.name}
                userIconImageURL={work.user.iconImage?.downloadURL}
                userFollowersCount={work.user.followersCount}
                userBiography={work.user.biography}
                userPromptonId={work.user.promptonUser?.id}
                userWorksCount={work.user.worksCount}
              />
            </Suspense>
          </div>
          <section className="space-y-4">
            <div className="flex justify-between">
              <h2 className="items-center space-x-2 font-bold text-md">
                {"関連"}
              </h2>
            </div>
            <PhotoAlbum
              layout="rows"
              columns={3}
              photos={newPhotos}
              renderPhoto={(photoProps) => (
                // @ts-ignore 後で考える
                <WorkAlbum
                  {...photoProps}
                  userId={photoProps.photo.userId}
                  userName={photoProps.photo.userName}
                  userIcon={photoProps.photo.userIcon}
                  workId={photoProps.photo.workId}
                  workOwnerUserId={photoProps.photo.workOwnerUserId}
                  isLiked={photoProps.photo.isLiked}
                  isShowLikeButton={false}
                />
              )}
              defaultContainerWidth={1200}
              sizes={{
                size: "calc(100vw - 240px)",
                sizes: [{ viewport: "(max-width: 960px)", size: "100vw" }],
              }}
            />
            {/* <div className="flex justify-between">
              <h2 className="items-center space-x-2 font-bold text-md">
                {"新着"}
              </h2>
            </div>
            <PhotoAlbum
              layout="rows"
              columns={3}
              photos={tagPhotos}
              renderPhoto={(photoProps) => (
                // @ts-ignore 後で考える
                <WorkAlbum
                  {...photoProps}
                  userId={photoProps.photo.userId}
                  userName={photoProps.photo.userName}
                  userIcon={photoProps.photo.userIcon}
                  workId={photoProps.photo.workId}
                  workOwnerUserId={photoProps.photo.workOwnerUserId}
                  isLiked={photoProps.photo.isLiked}
                />
              )}
              defaultContainerWidth={1200}
              sizes={{
                size: "calc(100vw - 240px)",
                sizes: [{ viewport: "(max-width: 960px)", size: "100vw" }],
              }}
            /> */}
          </section>
        </div>
      </div>
      <div className="mt-2 hidden w-full items-start pl-4 md:mt-0 lg:block lg:max-w-xs">
        <div className="mt-2 md:mt-0">
          <Suspense>
            <WorkUser
              userId={work.user.id}
              userName={work.user.name}
              userIconImageURL={work.user.iconImage?.downloadURL}
              userFollowersCount={work.user.followersCount}
              userBiography={work.user.biography}
              userPromptonId={work.user.promptonUser?.id}
              userWorksCount={work.user.worksCount}
            />
          </Suspense>
        </div>
        <WorkNextAndPrevious work={work} />
      </div>
    </div>
  )
}
