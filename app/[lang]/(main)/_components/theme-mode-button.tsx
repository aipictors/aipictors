import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export const ThemeModeButton = () => {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      onClick={() => {
        setTheme(theme === "light" ? "dark" : "light")
      }}
      variant={"ghost"}
      className="w-full justify-start"
      size={"sm"}
    >
      {theme !== "dark" && <Sun className="mr-4 w-4">{"Light"}</Sun>}
      {theme === "dark" && <Moon className="mr-4 w-4">{"Light"}</Moon>}
      <span>{theme === "dark" ? "ライトモード" : "ダークモード"}</span>
    </Button>
  )
}
