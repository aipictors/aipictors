import { useNavigation } from "@remix-run/react"
import { Loader2Icon } from "lucide-react"
import { Avatar, AvatarImage } from "~/components/ui/avatar"

/**
 * フッター
 */
export function HomeIcon() {
  const navigation = useNavigation()

  return (
    <Avatar className="h-10 w-10">
      {navigation.state === "loading" && (
        <div className="flex h-8 w-8 items-center justify-center">
          <Loader2Icon className={"h-10 w-10 animate-spin"} />
        </div>
      )}
      {navigation.state !== "loading" && (
        <AvatarImage src="/icon.svg" alt="Aipictors" />
      )}
    </Avatar>
  )
}
