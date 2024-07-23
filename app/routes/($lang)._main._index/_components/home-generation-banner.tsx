import { Link } from "@remix-run/react"
import { graphql, type FragmentOf } from "gql.tada"

type Props = {
  works: FragmentOf<typeof homeGenerationBannerWorkFieldFragment>[]
}

/**
 * ホームの生成機バナー
 */
export const HomeGenerationBanner = (props: Props) => {
  const [workA, workB, workC] = props.works

  return (
    <div className="flex w-full items-center overflow-hidden rounded-md border p-1">
      <div className="m-auto">
        <p className="font-semibold text-md">
          無料で生成して
          <br />
          投稿できる！
        </p>
        <Link to="/generation">
          {/** TODO_2024_07: Buttonに変更する */}
          <button
            type={"button"}
            className="mt-2 mb-2 w-full rounded-full bg-blue-500 px-4 py-1 text-white"
          >
            生成
          </button>
        </Link>
      </div>
      <div className="ml-2 flex">
        {workA && (
          <Link to={`/generation?work=${workA.id}`}>
            <div className="h-32 w-32 overflow-hidden">
              <img
                src={workA.smallThumbnailImageURL}
                alt="Generation Banner"
                className="h-32 w-32 object-cover transition-all hover:scale-110"
              />
            </div>
          </Link>
        )}
        {workB && (
          <Link to={`/generation?work=${workB.id}`}>
            <div className="h-32 w-32 overflow-hidden">
              <img
                src={workB.smallThumbnailImageURL}
                alt="Generation Banner"
                className="h-32 w-32 object-cover transition-all hover:scale-110"
              />
            </div>
          </Link>
        )}
        {workC && (
          <Link to={`/generation?work=${workC.id}`}>
            <div className="h-32 w-32 overflow-hidden">
              <img
                src={workC.smallThumbnailImageURL}
                alt="Generation Banner"
                className="h-32 w-32 object-cover transition-all hover:scale-110"
              />
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}

export const homeGenerationBannerWorkFieldFragment = graphql(
  `fragment HomeGenerationBannerWorkField on WorkNode @_unmask {
    id
    smallThumbnailImageURL
  }`,
)
