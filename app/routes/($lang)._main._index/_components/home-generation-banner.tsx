import { Link } from "@remix-run/react"
import { graphql, type FragmentOf } from "gql.tada"

export const homeGenerationBannerWorkFieldFragment = graphql(
  `fragment HomeGenerationBannerWorkField on WorkNode @_unmask {
    id
    smallThumbnailImageURL
  }`,
)

type Props = {
  works: FragmentOf<typeof homeGenerationBannerWorkFieldFragment>[]
}

/**
 * ホームの生成機バナー
 */
export const HomeGenerationBanner = (props: Props) => {
  // ランダムで3つを重複なしで選択
  const works = props?.works || []
  const shuffledWorks = [...works] // .sort(() => 0.5 - Math.random())
  const selectedWorks = shuffledWorks.slice(0, 3)

  const [randomOneWork, randomTwoWork, randomThreeWork] = selectedWorks

  return (
    <div className="flex w-full items-center overflow-hidden rounded-md border p-1">
      <div className="m-auto">
        <p className="font-semibold text-md">
          無料で生成して
          <br />
          投稿できる！
        </p>
        <Link to="/generation">
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button className="mt-2 mb-2 w-full rounded-full bg-blue-500 px-4 py-1 text-white">
            生成
          </button>
        </Link>
      </div>
      <div className="ml-2 flex">
        {randomOneWork && (
          <Link to={`/generation?work=${randomOneWork.id}`}>
            <div className="h-32 w-32 overflow-hidden">
              <img
                src={randomOneWork.smallThumbnailImageURL}
                alt="Generation Banner"
                className="h-32 w-32 object-cover transition-all hover:scale-110"
              />
            </div>
          </Link>
        )}
        {randomTwoWork && (
          <Link to={`/generation?work=${randomTwoWork.id}`}>
            <div className="h-32 w-32 overflow-hidden">
              <img
                src={randomTwoWork.smallThumbnailImageURL}
                alt="Generation Banner"
                className="h-32 w-32 object-cover transition-all hover:scale-110"
              />
            </div>
          </Link>
        )}
        {randomThreeWork && (
          <Link to={`/generation?work=${randomThreeWork.id}`}>
            <div className="h-32 w-32 overflow-hidden">
              <img
                src={randomThreeWork.smallThumbnailImageURL}
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
