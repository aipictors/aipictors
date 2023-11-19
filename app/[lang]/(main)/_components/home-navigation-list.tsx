"use client"

import { HomeNavigationButton } from "@/app/[lang]/(main)/_components/home-navigation-button"
import { AppContext } from "@/app/_contexts/app-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Config } from "@/config"
import {
  AlertTriangle,
  Award,
  BookImage,
  Box,
  Camera,
  Folder,
  Home,
  Image,
  LibraryBig,
  Lightbulb,
  LogIn,
  LogOut,
  Moon,
  Settings,
  Sparkles,
  Stamp,
  Sun,
  User,
} from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useContext } from "react"
import {
  TbBrandDiscordFilled,
  TbBrandThreads,
  TbBrandX,
  TbBrandYoutubeFilled,
} from "react-icons/tb"

type Props = {
  onLogin(): void
  onLogout(): void
}

export const HomeNavigationList = (props: Props) => {
  const appContext = useContext(AppContext)

  const { setTheme, theme } = useTheme()

  return (
    <div className="flex flex-col space-y-1">
      <HomeNavigationButton href={"/"} icon={Home}>
        {"ホーム"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/themes"}
        icon={Lightbulb}
      >
        {"創作アイデア"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/stickers"} icon={Stamp}>
        {"スタンプ広場"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/awards"}
        icon={Award}
      >
        {"ランキング"}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={"https://www.aipictors.com/generate/"}
        icon={Sparkles}
      >
        {"画像生成"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/series"}
        icon={LibraryBig}
      >
        {"シリーズ"}
      </HomeNavigationButton>
      <HomeNavigationButton
        isDisabled={Config.isReleaseMode}
        href={"/collections"}
        icon={Folder}
      >
        {"コレクション"}
      </HomeNavigationButton>
      <div className={"py-2"}>
        <Separator />
      </div>
      <HomeNavigationButton href={"/works/2d"} icon={Image}>
        {"イラスト"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/works/2.5d"} icon={BookImage}>
        {"セミリアル"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/works/3d"} icon={Camera}>
        {"フォト"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/models"} icon={Box}>
        {"モデル"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive"} icon={AlertTriangle}>
        {"センシティブ"}
      </HomeNavigationButton>
      <div className={"py-2"}>
        <Separator />
      </div>
      {appContext.isLoggedIn && (
        <HomeNavigationButton href={"/accounts/login"} icon={User}>
          {"アカウント"}
        </HomeNavigationButton>
      )}
      {appContext.isLoggedIn && (
        <HomeNavigationButton href={"/settings/restriction"} icon={Settings}>
          {"設定"}
        </HomeNavigationButton>
      )}
      {theme !== "light" && (
        <Button
          className="w-full justify-start"
          size={"sm"}
          variant={"ghost"}
          onClick={() => setTheme("light")}
        >
          <Sun className="mr-4 w-4">{"Light"}</Sun>
          <span>{"ライトモード"}</span>
        </Button>
      )}
      {theme !== "dark" && (
        <Button
          className="w-full justify-start"
          size={"sm"}
          variant={"ghost"}
          onClick={() => setTheme("dark")}
        >
          <Moon className="mr-4 w-4">{"Dark"}</Moon>
          <span>{"ダークモード"}</span>
        </Button>
      )}
      {appContext.isLoggedIn && (
        <HomeNavigationButton
          onClick={() => {
            props.onLogout()
          }}
          icon={LogOut}
        >
          {"ログアウト"}
        </HomeNavigationButton>
      )}
      {appContext.isNotLoggedIn && (
        <HomeNavigationButton
          onClick={() => {
            props.onLogin()
          }}
          icon={LogIn}
        >
          {"ログイン"}
        </HomeNavigationButton>
      )}
      <div className="py-2">
        <Separator />
      </div>
      <div className="flex flex-col space-y-2">
        <HomeNavigationButton
          icon={TbBrandX}
          href={"https://twitter.com/Aipictors"}
        >
          {"Twitter"}
        </HomeNavigationButton>
        <HomeNavigationButton
          icon={TbBrandDiscordFilled}
          href={"https://discord.gg/CsSbTHYY"}
        >
          {"Discord"}
        </HomeNavigationButton>
        <HomeNavigationButton
          href={"https://www.threads.net/@aipictors"}
          icon={TbBrandThreads}
        >
          {"Threads"}
        </HomeNavigationButton>
        <HomeNavigationButton
          href={"https://www.youtube.com/@aipictors"}
          icon={TbBrandYoutubeFilled}
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
