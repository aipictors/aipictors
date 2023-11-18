import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export const UserWorkListActions = () => (
  <div className="space-y-4">
    <div className="flex space-x-4">
      <Input
        placeholder="Select Date and Time"
        className="text-sm w-48"
        type="datetime-local"
      />
      <p>{"～"}</p>
      <Input
        placeholder="Select Date and Time"
        className="text-sm w-48"
        type="datetime-local"
      />
      <Button aria-label={"メニュー"} className="rounded-full text-sm">
        <Search />
      </Button>
      <Button className="rounded-full text-sm">{"タイルモードON"}</Button>
      <Button className="rounded-full text-sm">
        {"いいね順（現在新しい順）"}
      </Button>
    </div>
  </div>
)
