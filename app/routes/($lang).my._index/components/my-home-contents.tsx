import { EyeIcon, FolderIcon, HeartIcon, MessageCircleIcon } from "lucide-react"
import { DashboardHomeContentContainer } from "~/routes/($lang).my._index/components/my-home-content-container"
import { useSuspenseQuery } from "@apollo/client/index"
import { AuthContext } from "~/contexts/auth-context"
import { useContext } from "react"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"

export function DashboardHomeContents() {
  const appContext = useContext(AuthContext)

  const { data = null } = useSuspenseQuery(viewerUserQuery, {
    skip: appContext.isLoading,
  })

  console.log(data)

  const truncateTitle = (title: string, maxLength: number) => {
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title
  }

  const formatNumberWithCommas = (value: number | undefined | null) => {
    return value?.toLocaleString() || "0"
  }

  const worksResult = useSuspenseQuery(worksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: 0,
      limit: 3,
      where: {
        userId: appContext.userId,
        orderBy: "LIKES_COUNT",
        sort: "DESC",
      },
    },
  })

  const works = worksResult.data?.works

  return (
    <>
      <div className="mb-4 space-y-4">
        <div className="block items-stretch space-x-0 space-y-2 md:flex md:space-x-2 md:space-y-0">
          <div className="h-full w-full items-stretch">
            <DashboardHomeContentContainer title={"合計リアクション数"}>
              <div className="rounded-md md:p-4">
                <div className="mb-4">
                  <div className="flex items-center">
                    <EyeIcon className="mr-2 w-3" />
                    {"閲覧数"}
                  </div>
                  <p className="font-bold font-size-md">
                    {formatNumberWithCommas(
                      data?.viewer?.user.createdViewsCount,
                    )}
                  </p>
                </div>
                <div className="mb-4">
                  <div className="flex items-center">
                    <HeartIcon className="mr-2 w-3" />
                    {"いいね数"}
                  </div>
                  <p className="font-bold font-size-md">
                    {formatNumberWithCommas(
                      data?.viewer?.user.createdLikesCount,
                    )}
                  </p>
                </div>
                <div className="mb-4">
                  <div className="flex items-center">
                    <FolderIcon className="mr-2 w-3" />
                    {"ブックマーク数"}
                  </div>
                  <p className="font-bold font-size-md">
                    {formatNumberWithCommas(
                      data?.viewer?.user.createdBookmarksCount,
                    )}
                  </p>
                </div>
                <div className="mb-4">
                  <div className="flex items-center">
                    <MessageCircleIcon className="mr-2 w-3" />
                    {"コメント数"}
                  </div>
                  <p className="font-bold font-size-md">
                    {formatNumberWithCommas(
                      data?.viewer?.user.createdCommentsCount,
                    )}
                  </p>
                </div>
              </div>
            </DashboardHomeContentContainer>
          </div>

          {works?.length === 0 ? null : (
            <div className="h-full w-full items-stretch">
              <DashboardHomeContentContainer title={"いいねランキングトップ3"}>
                <div className="rounded-md md:p-4">
                  {works?.map((work, index) => (
                    <Link
                      key={work.id}
                      to={`/posts/${work.id}`}
                      className={`mb-4 flex items-center ${
                        index === 0 ? "relative" : ""
                      }`}
                    >
                      {index === 0 ? (
                        <div className="relative w-full">
                          <img
                            src={work.smallThumbnailImageURL}
                            alt={work.title}
                            className="h-auto w-full rounded-md object-cover"
                          />
                          {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
                          {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-30 rounded-md"></div>
                          <div className="absolute bottom-0 left-0 p-4">
                            {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
                            <div className="bg-yellow-500 rounded-full text-white w-8 text-center font-bold px-2 py-1">
                              1
                            </div>
                            {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
                            <p className="font-bold text-white mt-2">
                              {work.title}
                            </p>
                            <p className="text-white opacity-80">
                              {work.likesCount} いいね
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex w-full items-center">
                          <div className="mr-4">
                            <div
                              // biome-ignore lint/nursery/useSortedClasses: <explanation>
                              className={`rounded-full text-white w-8 text-center font-bold px-2 py-1 ${
                                index === 1
                                  ? "bg-gray-400"
                                  : index === 2
                                    ? "bg-orange-300"
                                    : ""
                              }`}
                            >
                              {index + 1}
                            </div>
                          </div>
                          <div className="h-12 w-12 overflow-hidden rounded-md">
                            <img
                              src={work.smallThumbnailImageURL}
                              alt={work.title}
                              className="h-16 w-16 object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <p className="font-bold">
                              {truncateTitle(work.title, 32)}
                            </p>
                            <p className="opacity-80">
                              {work.likesCount} いいね
                            </p>
                          </div>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </DashboardHomeContentContainer>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

const viewerUserQuery = graphql(
  `query ViewerUser {
    viewer {
      id
      user {
        id
        awardsCount
        followersCount
        followCount
        generatedCount
        receivedLikesCount
        receivedViewsCount
        createdLikesCount
        createdViewsCount
        createdCommentsCount
        createdBookmarksCount
      }
    }
  }`,
)

export const MyWorkFragment = graphql(
  `fragment MyWork on WorkNode @_unmask {
    id
    title
    smallThumbnailImageURL
    likesCount
  }`,
)

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...MyWork
    }
  }`,
  [MyWorkFragment],
)
