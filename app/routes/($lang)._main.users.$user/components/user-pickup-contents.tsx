import {
  type HomeWorkFragment,
  HomeWorkSection,
} from "~/routes/($lang)._main._index/components/home-work-section"
import type { FragmentOf } from "gql.tada"

type Props = {
  userPickupWorks: FragmentOf<typeof HomeWorkFragment>[]
}

export function UserPickupContents(props: Props) {
  return (
    <div className="items-center">
      {props.userPickupWorks && props.userPickupWorks.length > 0 && (
        <HomeWorkSection
          title="ピックアップ"
          works={props.userPickupWorks}
          isCropped={true}
        />
      )}
    </div>
  )
}
