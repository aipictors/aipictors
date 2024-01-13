"use client"

import { AuthContext } from "@/app/_contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useContext } from "react"

export const ThemeModeButton = () => {
  const appContext = useContext(AuthContext)

  const { setTheme, theme } = useTheme()

  /**
   * Hydrationを回避する為
   */
  if (appContext.isLoading) {
    return null
  }

  return (
    <Button
      onClick={() => {
        setTheme(theme === "dark" ? "light" : "dark")
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
