import type { CheckedState } from "@radix-ui/react-checkbox" // CheckedStateのインポートが必要かも
import { Search } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
import { useTranslation } from "~/hooks/use-translation"

export const SearchHeader = () => {
  const [searchText, setSearchText] = useState("")

  const [isSensitive, setIsSensitive] = useState(false)

  const [isSearchUser, setIsSearchUser] = useState(false)

  const t = useTranslation()

  const onSearch = () => {
    const trimmedText = searchText.trim()

    // '#' を取り除いた新しい文字列
    const sanitizedText = trimmedText.replace(/#/g, "")

    // 他の禁止文字をチェック
    const invalidChars = ["%", "/", "¥"]
    const hasInvalidChar = invalidChars.some((char) =>
      sanitizedText.includes(char),
    )

    if (hasInvalidChar) {
      toast("入力された検索文字列には使用できない文字が含まれています。")
      return
    }

    if (trimmedText !== "") {
      const baseUrl = isSearchUser
        ? `/users?search=${trimmedText}`
        : isSensitive
          ? `/r/tags/${trimmedText}`
          : `/tags/${trimmedText}`
      window.location.href = baseUrl
    } else {
      toast(t("検索ワードを入力してください", "Please enter a search word"))
    }
  }

  const handleCheckboxChange = (checked: CheckedState) => {
    setIsSensitive(checked === true)
  }

  const handleCheckUserBoxChange = (checked: CheckedState) => {
    setIsSearchUser(checked === true)
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
            placeholder={t(
              "タグや作者名で検索",
              "Search by tag or author name",
            )}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button onClick={onSearch} variant={"ghost"} size={"icon"}>
          <Search className="w-16" />
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="sensitive"
          checked={isSensitive}
          onCheckedChange={handleCheckboxChange}
        />
        <label htmlFor="sensitive" className="font-medium text-sm leading-none">
          {t("センシティブ", "Sensitive")}
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="user"
          checked={isSearchUser}
          onCheckedChange={handleCheckUserBoxChange}
        />
        <label htmlFor="user" className="font-medium text-sm leading-none">
          {t("ユーザを検索", "Search user")}
        </label>
      </div>
    </div>
  )
}
