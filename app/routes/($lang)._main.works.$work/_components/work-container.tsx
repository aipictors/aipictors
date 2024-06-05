import type {
  WorkCommentsQuery,
  WorkQuery,
} from "@/_graphql/__generated__/graphql"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { WorkArticle } from "@/routes/($lang)._main.works.$work/_components/work-article"
import { WorkCommentList } from "@/routes/($lang)._main.works.$work/_components/work-comment-list"
import { WorkNextAndPrevious } from "@/routes/($lang)._main.works.$work/_components/work-next-and-previous"
import { WorkRelatedList } from "@/routes/($lang)._main.works.$work/_components/work-related-list"
import { WorkUser } from "@/routes/($lang)._main.works.$work/_components/work-user"
import { Suspense } from "react"

type Props = {
  work: NonNullable<WorkQuery>["work"]
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

  return (
    <div className="flex w-full overflow-hidden p-4">
      <div className="flex flex-col items-center justify-center">
        <div className="mx-auto w-full max-w-screen-lg">
          <Suspense fallback={<AppLoadingPage />}>
            <WorkArticle work={work} />
          </Suspense>
          <WorkRelatedList works={work.user.works} />
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
