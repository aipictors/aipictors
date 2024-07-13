import {} from "@/_components/ui/avatar"
import { Button } from "@/_components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/_components/ui/dropdown-menu"
import {} from "@/_components/ui/sheet"
import {
  EllipsisVerticalIcon,
  MoonIcon,
  SettingsIcon,
  SunIcon,
} from "lucide-react"
import { useContext } from "react"
import { useTheme } from "next-themes"
import { AuthContext } from "@/_contexts/auth-context"
import { LoginDialogButton } from "@/_components/login-dialog-button"

const HomeHeaderNotLoggedInMenu = () => {
  const authContext = useContext(AuthContext)

  const { theme, setTheme } = useTheme()

  const setColorTheme = (newMode: string) => {
    if (newMode === "system") {
      setTheme(newMode)
      return
    }
    if ((theme === "system" || theme === "dark") && newMode === "light") {
      setTheme(newMode)
      return
    }
    if ((theme === "system" || theme === "light") && newMode === "dark") {
      setTheme(newMode)
      return
    }
    // テーマ適用中→"light-blue"、"dark-blue"等同色でのダーク、ライト切り替え
    const suffix = theme?.replace(/(light|dark)\-/, "-")
    const colorSuffix = suffix ?? ""
    setTheme(newMode + colorSuffix)
  }
  const setMode = (theme: string) => {
    if (theme === "system" || theme === "light" || theme === "dark") {
      return theme
    }
    if (theme.startsWith("light-")) {
      return "light"
    }
    if (theme.startsWith("dark-")) {
      return "dark"
    }
    return "system"
  }
  const mode = setMode(theme ? theme?.toString() : "system")

  const getThemeIcon = () => {
    return theme?.endsWith("dark") ? (
      <MoonIcon className="mr-2 inline-block w-4" />
    ) : (
      <SunIcon className="mr-2 inline-block w-4" />
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"} size={"icon"}>
          <EllipsisVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {getThemeIcon()}
            {"テーマ"}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuLabel>{"テーマ変更"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={mode}
                onValueChange={(newMode) => {
                  setColorTheme(newMode)
                }}
              >
                <DropdownMenuRadioItem value="system">
                  デバイスモード使用
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="light">
                  ライト
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  ダーク
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <LoginDialogButton
                label="カラーの設定"
                isLoading={authContext.isLoading || authContext.isLoggedIn}
                isWidthFull={true}
                description={"ログインして、カラーの設定を変更してみましょう！"}
                triggerChildren={
                  <div className="cursor-pointer px-2">
                    <SettingsIcon className="mr-2 inline-block w-4" />
                    <span>{"その他のカラー"}</span>
                  </div>
                }
              />
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default HomeHeaderNotLoggedInMenu
