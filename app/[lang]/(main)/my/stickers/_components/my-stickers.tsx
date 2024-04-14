import { Button } from "@/_components/ui/button"
import { PlusIcon } from "lucide-react"

export const MyStickers = () => {
  return (
    <div className="flex">
      <div className="flex flex-col">
        <p className="text-2xl">{"作成済みスタンプ"}</p>
        <div className="flex">
          <Button>
            <PlusIcon />
            <p>{"新しいスタンプ"}</p>
          </Button>
        </div>
      </div>
    </div>
  )
}
