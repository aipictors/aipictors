import { Card, CardHeader, CardTitle } from "~/components/ui/card"

export function NovelCard () {
  return (
    <Card slot="article">
      <CardHeader slot={"header"}>
        <CardTitle>{"タイトル"}</CardTitle>
      </CardHeader>
    </Card>
  )
}
