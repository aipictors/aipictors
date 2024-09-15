import type { CheckedState } from "@radix-ui/react-checkbox" // CheckedStateのインポートが必要かも
import { Search } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"

export const SearchHeader = () => {
  const [searchText, setSearchText] = useState("")

  const [isSensitive, setIsSensitive] = useState(false)

  const onSearch = () => {
    const trimmedText = searchText.trim()
    if (trimmedText !== "") {
      const baseUrl = isSensitive
        ? `/porn/tags/${trimmedText}`
        : `/tags/${trimmedText}`
      window.location.href = baseUrl
    } else {
      toast("検索ワードを入力してください")
    }
  }

  const handleCheckboxChange = (checked: CheckedState) => {
    setIsSensitive(checked === true)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      onSearch()
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-2">
        <div className="w-full flex-1">
          <Input
            placeholder={"タグで作品を検索"}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button onClick={onSearch} variant={"ghost"} size={"icon"}>
          <Search className="w-16" />
        </Button>
      </div>
      <div className="flex items-center space-x-2 opacity-50">
        <Checkbox
          id="sensitive"
          checked={isSensitive}
          onCheckedChange={handleCheckboxChange}
        />
        <label htmlFor="sensitive" className="font-medium text-sm leading-none">
          センシティブ
        </label>
      </div>
    </div>
  )
}
