"use client"

import { AuthContext } from "@/app/_contexts/auth-context"
import { Button } from "@/components/ui/button"
import { MoonIcon, SunIcon } from "lucide-react"
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
      {theme !== "dark" && <SunIcon className="mr-4 w-4">{"Light"}</SunIcon>}
      {theme === "dark" && <MoonIcon className="mr-4 w-4">{"Light"}</MoonIcon>}
      <span>{theme === "dark" ? "ライトモード" : "ダークモード"}</span>
    </Button>
  )
}
