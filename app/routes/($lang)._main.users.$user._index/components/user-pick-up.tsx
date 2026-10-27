import { PlusIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Switch } from "~/components/ui/switch"

export function UserPickUp() {
  return (
    <div className="flex">
      <span>{"Pick Up"}</span>
      <div className="flex">
        <span>{"R18（n）"}</span>
        <Switch />
      </div>
      <div className="flex justify-start">
        <Button aria-label={"追加"} size={"icon"}>
          <PlusIcon />
        </Button>
      </div>
    </div>
  )
}
