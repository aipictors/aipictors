import { Button } from "@/_components/ui/button"
import { Input } from "@/_components/ui/input"
import { SearchIcon } from "lucide-react"

export const UserWorkListActions = () => (
  <div className="space-y-4">
    <div className="flex space-x-4">
      <Input
        placeholder="Select Date and Time"
        className="w-48 text-sm"
        type="datetime-local"
      />
      <p>{"～"}</p>
      <Input
        placeholder="Select Date and Time"
        className="w-48 text-sm"
        type="datetime-local"
      />
      <Button aria-label={"メニュー"} className="rounded-full text-sm">
        <SearchIcon />
      </Button>
      <Button className="rounded-full text-sm">{"タイルモードON"}</Button>
      <Button className="rounded-full text-sm">
        {"いいね順（現在新しい順）"}
      </Button>
    </div>
  </div>
)
