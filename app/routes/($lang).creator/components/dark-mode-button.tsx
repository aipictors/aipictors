import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "~/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
} from "~/components/ui/tooltip"

export function DarkModeButton() {
  const { theme, setTheme } = useTheme()

  const modeText = theme === "dark" ? "画面を明るく" : "画面を暗く"

  const Icon = theme === "light" ? SunIcon : MoonIcon

  return (
    <TooltipProvider>
      <Tooltip>
        <Button
          variant={"secondary"}
          size={"icon"}
          aria-label={modeText}
          onClick={() => {
            setTheme(theme === "dark" ? "light" : "dark")
          }}
        >
          <Icon className="w-4" />
        </Button>
        <TooltipContent>
          <p>{modeText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
