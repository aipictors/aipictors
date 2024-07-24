import type { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { HomeWorkSection } from "@/routes/($lang)._main._index/_components/home-work-section"
import type { FragmentOf } from "gql.tada"

type Props = {
  userPickupWorks: FragmentOf<typeof partialWorkFieldsFragment>[]
  userPickupSensitiveWorks: FragmentOf<typeof partialWorkFieldsFragment>[]
}

export const UserPickupContents = (props: Props) => {
  return (
    <div className="mt-4 block items-center space-x-0 md:flex md:space-x-4">
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
