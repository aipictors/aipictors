import { Card, CardHeader, CardTitle } from "@/_components/ui/card"

export const NovelCard = () => {
  return (
    <Card slot="article">
      <CardHeader slot={"header"}>
        <CardTitle>{"タイトル"}</CardTitle>
      </CardHeader>
    </Card>
  )
}
