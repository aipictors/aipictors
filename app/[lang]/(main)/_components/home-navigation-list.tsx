"use client"

import { HomeNavigationButton } from "@/app/[lang]/(main)/_components/home-navigation-button"
import { AppContext } from "@/app/_contexts/app-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Config } from "@/config"
import { Box, Divider } from "@chakra-ui/react"
import { Home, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useContext } from "react"
import {
  TbAlbum,
  TbAlertTriangle,
  TbAward,
  TbBolt,
  TbBox,
  TbBrandDiscordFilled,
  TbBrandThreads,
  TbBrandX,
  TbBrandYoutubeFilled,
  TbBulb,
  TbCamera,
  TbFolder,
  TbLogin,
  TbLogout,
  TbPhoto,
  TbPhotoPlus,
  TbRubberStamp,
  TbSettings,
} from "react-icons/tb"

type Props = {
  onLogin(): void
  onLogout(): void
}

export const HomeNavigationList = (props: Props) => {
  const appContext = useContext(AppContext)

  const { setTheme } = useTheme()

  return (
    <div className="flex flex-col space-y-2">
      <HomeNavigationButton href={"/"} leftIcon={<Home className="w-4" />}>
        {"ホーム"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/themes"}
        leftIcon={<TbBulb />}
      >
        {"創作アイデア"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/stickers"} leftIcon={<TbRubberStamp />}>
        {"スタンプ広場"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/awards"}
        leftIcon={<TbAward />}
      >
        {"ランキング"}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={"https://www.aipictors.com/generate/"}
        leftIcon={<TbBolt />}
      >
        {"画像生成"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/series"}
        leftIcon={<TbAlbum />}
      >
        {"シリーズ"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/collections"}
        leftIcon={<TbFolder />}
      >
        {"コレクション"}
      </HomeNavigationButton>
      <Box py={2}>
        <Divider />
      </Box>
      <HomeNavigationButton href={"/works/2d"} leftIcon={<TbPhoto />}>
        {"イラスト"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/works/2.5d"} leftIcon={<TbPhotoPlus />}>
        {"セミリアル"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/works/3d"} leftIcon={<TbCamera />}>
        {"フォト"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/models"} leftIcon={<TbBox />}>
        {"モデル"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive"} leftIcon={<TbAlertTriangle />}>
        {"センシティブ"}
      </HomeNavigationButton>
      <Box py={2}>
        <Divider />
      </Box>
      {appContext.isLoggedIn && (
        <HomeNavigationButton
          href={"/settings/login"}
          leftIcon={<TbSettings />}
        >
          {"設定"}
        </HomeNavigationButton>
      )}
      {appContext.isLoggedIn && (
        <HomeNavigationButton
          onClick={() => {
            props.onLogout()
          }}
          leftIcon={<TbLogout />}
        >
          {"ログアウト"}
        </HomeNavigationButton>
      )}
      {appContext.isNotLoggedIn && (
        <HomeNavigationButton
          onClick={() => {
            props.onLogin()
          }}
          leftIcon={<TbLogin />}
        >
          {"ログイン"}
        </HomeNavigationButton>
      )}
      <Button
        className="w-full justify-start"
        size={"sm"}
        variant={"ghost"}
        onClick={() => setTheme("light")}
      >
        <Sun className="mr-4 w-4">{"Light"}</Sun>
        <span>{"ライトモード"}</span>
      </Button>
      <Button
        className="w-full justify-start"
        size={"sm"}
        variant={"ghost"}
        onClick={() => setTheme("dark")}
      >
        <Moon className="mr-4 w-4">{"Dark"}</Moon>
        <span>{"ダークモード"}</span>
      </Button>
      <div className="py-2">
        <Separator />
      </div>
      <div className="flex flex-col space-y-2">
        <HomeNavigationButton
          leftIcon={<TbBrandX fontSize={16} />}
          href={"https://twitter.com/Aipictors"}
        >
          {"Twitter"}
        </HomeNavigationButton>
        <HomeNavigationButton
          leftIcon={<TbBrandDiscordFilled fontSize={16} />}
          href={"https://discord.gg/CsSbTHYY"}
        >
          {"Discord"}
        </HomeNavigationButton>
        <HomeNavigationButton
          href={"https://www.threads.net/@aipictors"}
          leftIcon={<TbBrandThreads fontSize={16} />}
        >
          {"Threads"}
        </HomeNavigationButton>
        <HomeNavigationButton
          href={"https://www.youtube.com/@aipictors"}
          leftIcon={<TbBrandYoutubeFilled fontSize={16} />}
        >
          {"YouTube"}
        </HomeNavigationButton>
      </div>
      <div className="py-2">
        <Separator />
      </div>
      <div className="flex flex-col space-y-2 pl-3">
        <Link href={"/about"} className={"text-xs"}>
          {"このサイトについて"}
        </Link>
        <Link href={"/about/us"} className={"text-xs"}>
          {"運営会社"}
        </Link>
        <Link href={"/terms"} className={"text-xs"}>
          {"利用規約"}
        </Link>
        <Link href={"/privacy"} className={"text-xs"}>
          {"プライバシーポリシー"}
        </Link>
        <Link
          href={"/specified-commercial-transaction-act"}
          className={"text-xs"}
        >
          {"特定商取引法に基づく表記"}
        </Link>
      </div>
    </div>
  )
}
