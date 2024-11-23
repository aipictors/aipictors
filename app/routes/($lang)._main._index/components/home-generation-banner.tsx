import { Link } from "react-router";
import { graphql, readFragment, type FragmentOf } from "gql.tada"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  works: FragmentOf<typeof HomeGenerationBannerWorkFragment>[]
}

/**
 * ホームの生成機バナー
 */
export function HomeGenerationBanner(props: Props) {
  const works = props.works.map((work) => {
    return readFragment(HomeGenerationBannerWorkFragment, work)
  })

  const t = useTranslation()

  const [workA, workB, workC] = works

  return (
    <div className="flex w-full items-center overflow-hidden rounded-md border p-4">
      <div className="w-64">
        <p className="font-semibold text-md">
          {t(
            "無料で生成して投稿できる！",
            "You can generate and post for free!",
          )}
        </p>
        <Link to="/generation">
          <Button variant={"secondary"}>{t("生成", "Generation")}</Button>
        </Link>
      </div>
      <div className="ml-2 flex justify-center rounded">
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

export const HomeGenerationBannerWorkFragment = graphql(
  `fragment HomeGenerationBannerWork on WorkNode {
    id
    smallThumbnailImageURL
  }`,
)
