import type { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { HomeWorkSection } from "@/routes/($lang)._main._index/_components/home-work-section"
import type { FragmentOf } from "gql.tada"

type Props = {
  userPickupWorks: FragmentOf<typeof partialWorkFieldsFragment>[]
  userPickupSensitiveWorks: FragmentOf<typeof partialWorkFieldsFragment>[]
}

export const UserPickupContents = (props: Props) => {
  return (
    <div className="flex flex-col items-center space-x-4 space-y-4 md:flex-row md:space-y-0">
      {props.userPickupWorks && props.userPickupWorks.length > 0 && (
        <HomeWorkSection
          title="ピックアップ"
          works={props.userPickupWorks}
          isCropped={false}
          targetRowHeight={96}
        />
      )}
      {props.userPickupSensitiveWorks &&
        props.userPickupSensitiveWorks.length > 0 && (
          <HomeWorkSection
            title="ピックアップセンシティブ"
            works={props.userPickupSensitiveWorks}
            isCropped={false}
            targetRowHeight={96}
          />
        )}
    </div>
  )
}
