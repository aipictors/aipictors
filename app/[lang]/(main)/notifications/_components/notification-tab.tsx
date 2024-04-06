import { Button } from "@/_components/ui/button"

export const NotificationTab = () => {
  return (
    <div>
      <div className="flex">
        <Button>{"すべて"}</Button>
        <Button>{"いいね"}</Button>
        <Button>{"コメント"}</Button>
        <Button>{"返信"}</Button>
        <Button>{"フォロー"}</Button>
        <Button>{"ランキング"}</Button>
      </div>
    </div>
  )
}
