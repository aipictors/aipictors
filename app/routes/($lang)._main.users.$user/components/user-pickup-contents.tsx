import type { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { HomeWorkSection } from "~/routes/($lang)._main._index/components/home-work-section"
import type { FragmentOf } from "gql.tada"

type Props = {
  userPickupWorks: FragmentOf<typeof partialWorkFieldsFragment>[]
  userPickupSensitiveWorks: FragmentOf<typeof partialWorkFieldsFragment>[]
}

export const UserPickupContents = (props: Props) => {
  // 結合
  // const combinedWorks = props.userPickupWorks.concat(
  //   props.userPickupSensitiveWorks,
  // )

  const combinedWorks = props.userPickupWorks

  return (
    <div className="items-center">
      {combinedWorks && combinedWorks.length > 0 && (
        <HomeWorkSection
          title="ピックアップ"
          works={combinedWorks}
          isCropped={false}
        />
      )}
    </div>
  )
}
