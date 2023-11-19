"use client"

import { HomeNavigationButton } from "@/app/[lang]/(main)/_components/home-navigation-button"
import { Separator } from "@/components/ui/separator"
import {
  Award,
  Folder,
  Home,
  LibraryBig,
  Lightbulb,
  Moon,
  Sun,
  Undo2,
} from "lucide-react"
import { useTheme } from "next-themes"

export const SensitiveNavigationList = () => {
  const { setTheme, theme } = useTheme()

  return (
    <div className="flex flex-col space-y-2">
      <HomeNavigationButton href={"/"} icon={Undo2}>
        {"全年齢"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive"} icon={Home}>
        {"ホーム"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive/themes"} icon={Lightbulb}>
        {"創作アイデア"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive/awards"} icon={Award}>
        {"ランキング"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive/albums"} icon={LibraryBig}>
        {"シリーズ"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive/collections"} icon={Folder}>
        {"コレクション"}
      </HomeNavigationButton>
      <div className="py-2">
        <Separator />
      </div>
      <HomeNavigationButton href={"/sensitive/works/3d"}>
        {"フォト"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive/works/3d/a"}>
        {"フォトA"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive/works/3d/b"}>
        {"フォトB"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive/works/3d/c"}>
        {"フォトC"}
      </HomeNavigationButton>
      <div className="py-2">
        <Separator />
      </div>
      <HomeNavigationButton href={"/sensitive/works/2d"}>
        {"イラスト"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive/works/2d/a"}>
        {"イラストA"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive/works/2d/b"}>
        {"イラストB"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive/works/2d/c"}>
        {"イラストC"}
      </HomeNavigationButton>
      <div className="py-2">
        <Separator />
      </div>
      <HomeNavigationButton
        onClick={() => {
          setTheme(theme === "light" ? "dark" : "light")
        }}
        icon={theme === "dark" ? Sun : Moon}
      >
        {theme !== "dark" && <Sun className="mr-4 w-4">{"Light"}</Sun>}
        {theme === "dark" && <Moon className="mr-4 w-4">{"Light"}</Moon>}
        {theme === "dark" ? "ライトモード" : "ダークモード"}
      </HomeNavigationButton>
    </div>
  )
}
