import type { worksQuery } from "@/_graphql/queries/work/works"
import { config } from "@/config"
import { HomeWorkSection } from "@/routes/($lang)._main._index/_components/home-work-section"
import type { ResultOf } from "gql.tada"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  userPickupWorks: NonNullable<ResultOf<typeof worksQuery>["works"]> | null
  userPickupSensitiveWorks: NonNullable<
    ResultOf<typeof worksQuery>["works"]
  > | null
}

export const UserPickupContents = (props: Props) => {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  return (
    <div className="mt-4 block items-center space-x-0 md:flex md:space-x-4">
      {props.userPickupWorks && props.userPickupWorks.length > 0 && (
        <HomeWorkSection
          title="ピックアップ"
          works={props.userPickupWorks}
          isCropped={!isDesktop}
          targetRowHeight={96}
        />
      )}
      {props.userPickupSensitiveWorks &&
        props.userPickupSensitiveWorks.length > 0 && (
          <HomeWorkSection
            title="ピックアップセンシティブ"
            works={props.userPickupSensitiveWorks}
            isCropped={!isDesktop}
            targetRowHeight={96}
          />
        )}
    </div>
  )
}
