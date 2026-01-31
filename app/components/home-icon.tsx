import { useNavigation } from "@remix-run/react"
import { Loader2Icon } from "lucide-react"
import { Avatar, AvatarImage } from "~/components/ui/avatar"

/**
 * フッター
 */
export function HomeIcon (): React.ReactNode {
  const navigation = useNavigation()

  return (
    <Avatar className="flex size-10 items-center justify-center">
      {navigation.state === "loading" && (
        <Loader2Icon className={"size-8 animate-spin text-border"} />
      )}
      {navigation.state !== "loading" && (
        <AvatarImage src="/icon.svg" alt="Aipictors" />
      )}
    </Avatar>
  )
}
