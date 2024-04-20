import { Card } from "@/_components/ui/card"

type Props = {
  title?: string
  imageURL: string | null
  // work: {
  //   user: {
  //     name: string
  //     iconImage: {
  //       downloadURL: string | null
  //     } | null
  //   }
  // }
}

export const RankingCard = (props: Props) => (
  <Card>
    <img src={props.imageURL ?? ""} alt={props.title ?? "no title"} />
    <div className="flex flex-col">
      <p className="text-sm">{props.title ?? ""}</p>
      {/* <UserAvatarLink
        userName={props.work.user.name}
        userIconImageURL={props.work.user.iconImage?.downloadURL ?? null}
      /> */}
    </div>
  </Card>
)
