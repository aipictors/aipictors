import { Card } from "~/components/ui/card"

type Props = {
  title?: string
  imageURL: string | null
  work: {
    user: {
      name: string
      iconImage: {
        downloadURL: string | null
      } | null
    }
  }
}

export function RankingCard(props: Props) {
  return (
    <Card>
      <img
        src={props.imageURL ? props.imageURL : ""}
        alt={props.title ? props.title : "no title"}
      />
    </Card>
  )
}
