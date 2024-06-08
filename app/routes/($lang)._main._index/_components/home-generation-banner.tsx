import { worksQuery } from "@/_graphql/queries/work/works"
import { useSuspenseQuery } from "@apollo/client/index"

/**
 * ホームの生成機バナー
 */
export const HomeGenerationBanner = () => {
  const { data: worksResp } = useSuspenseQuery(worksQuery, {
    variables: {
      limit: 32,
      offset: 0,
      where: {
        isFeatured: true,
        ratings: ["G"],
        orderBy: "LIKES_COUNT",
      },
    },
  })

  // ランダムで3つを重複なしで選択
  const works = worksResp?.works || []
  const shuffledWorks = [...works].sort(() => 0.5 - Math.random())
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
        <a href="/generation">
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button className="mt-2 mb-2 w-full rounded-full bg-blue-500 px-4 py-1 text-white">
            生成
          </button>
        </a>
      </div>
      <div className="ml-2 flex">
        {randomOneWork && (
          <a href={`/generation?work=${randomOneWork.id}`}>
            <div className="h-32 w-32 overflow-hidden">
              <img
                src={randomOneWork.smallThumbnailImageURL}
                alt="Generation Banner"
                className="h-32 w-32 object-cover transition-all hover:scale-110"
              />
            </div>
          </a>
        )}
        {randomTwoWork && (
          <a href={`/generation?work=${randomTwoWork.id}`}>
            <div className="h-32 w-32 overflow-hidden">
              <img
                src={randomTwoWork.smallThumbnailImageURL}
                alt="Generation Banner"
                className="h-32 w-32 object-cover transition-all hover:scale-110"
              />
            </div>
          </a>
        )}
        {randomThreeWork && (
          <a href={`/generation?work=${randomThreeWork.id}`}>
            <div className="h-32 w-32 overflow-hidden">
              <img
                src={randomThreeWork.smallThumbnailImageURL}
                alt="Generation Banner"
                className="h-32 w-32 object-cover transition-all hover:scale-110"
              />
            </div>
          </a>
        )}
      </div>
    </div>
  )
}
