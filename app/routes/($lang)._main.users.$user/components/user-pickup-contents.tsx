import type { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { HomeWorkSection } from "~/routes/($lang)._main._index/components/home-work-section"
import type { FragmentOf } from "gql.tada"

type Props = {
  userPickupWorks: FragmentOf<typeof partialWorkFieldsFragment>[]
}

export function UserPickupContents(props: Props) {
  return (
    <div className="items-center">
      {props.userPickupWorks && props.userPickupWorks.length > 0 && (
        <HomeWorkSection
          title="ピックアップ"
          works={props.userPickupWorks}
          isCropped={false}
        />
      )}
    </div>
  )
}
