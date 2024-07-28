import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const CollectionsHeader = () => {
  return (
    <div className="flex flex-col">
      <p>{"コレクション一覧"}</p>
      <div className="flex">
        <Input placeholder={"コレクション名"} />
        <Button>{"検索"}</Button>
      </div>
    </div>
  )
}
