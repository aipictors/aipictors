import { useNavigation } from "react-router"
import { Loader2Icon } from "lucide-react"
import { Avatar, AvatarImage } from "~/components/ui/avatar"

/**
 * フッター
 */
export function HomeIcon() {
  const navigation = useNavigation()

  return (
    <Avatar className="flex h-10 w-10 items-center justify-center">
      {navigation.state === "loading" && (
        <Loader2Icon className={"h-8 w-8 animate-spin text-border"} />
      )}
      {navigation.state !== "loading" && (
        <AvatarImage src="/icon.svg" alt="Aipictors" />
      )}
    </Avatar>
  )
}
