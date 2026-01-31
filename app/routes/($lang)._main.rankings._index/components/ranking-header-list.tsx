import { Button } from "~/components/ui/button"

export function RankingHeaderList () {
  return (
    <div className="flex justify-center space-x-2">
      <Button variant="secondary">{"デイリー"}</Button>
      <Button variant="secondary">{"ウィークリー"}</Button>
      <Button variant="secondary">{"マンスリー"}</Button>
    </div>
  )
}
