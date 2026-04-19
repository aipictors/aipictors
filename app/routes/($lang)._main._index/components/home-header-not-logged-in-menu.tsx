import { Button } from "~/components/ui/button"
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
} from "~/components/ui/dropdown-menu"
import {
  EllipsisVerticalIcon,
  Languages,
  MoonIcon,
  SettingsIcon,
  SunIcon,
} from "lucide-react"
import { useContext } from "react"
import { useTheme } from "next-themes"
import { AuthContext } from "~/contexts/auth-context"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { useLocale } from "~/hooks/use-locale"
import { useTranslation } from "~/hooks/use-translation"
import { useLocation, useNavigate } from "@remix-run/react"
import { buildLocalePath } from "~/utils/locale-path"

export const HomeHeaderNotLoggedInMenu = () => {
  const authContext = useContext(AuthContext)

  const { theme, setTheme } = useTheme()

  const navigate = useNavigate()
  const location = useLocation()

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
    const suffix = theme?.replace(/(light|dark)-/, "-")
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

  const t = useTranslation()

  const locale = useLocale()

  // const isSensitiveToggleVisible = location.pathname !== "/generation"

  // R18モードの状態を検出
  const _isR18Mode = /\/r($|\/)/.test(location.pathname)

  const setLocale = (locale: string) => {
    document.cookie = `locale=${locale}; path=/; max-age=31536000; SameSite=Lax`

    const newUrl = `${buildLocalePath(
      locale === "en" ? "en" : "ja",
      location.pathname,
    )}${location.search}${location.hash}`

    if (`${location.pathname}${location.search}${location.hash}` !== newUrl) {
      navigate(newUrl)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"} size={"icon"}>
          <EllipsisVerticalIcon className="w-16" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {getThemeIcon()}
            {t("テーマ", "theme")}
          </DropdownMenuSubTrigger>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Languages className="mr-2 inline-block w-4" />
              {t("言語/Language", "言語/Language")}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuLabel>
                  {t("言語変更", "Change Language")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={locale}
                  onValueChange={(newLocale) => {
                    setLocale(newLocale)
                  }}
                >
                  <DropdownMenuRadioItem value="ja">
                    {t("日本語", "日本語")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="en">
                    {t("English", "English")}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
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
        {/* {isSensitiveToggleVisible && <DropdownMenuSeparator />}
        {isSensitiveToggleVisible && (
          <div className="px-2 py-1.5">
            <SensitiveToggle variant="compact" className="w-full" />
          </div>
        )} */}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
