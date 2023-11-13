"use client"

import { HomeNavigationButton } from "@/app/[lang]/(main)/_components/home-navigation-button"
import { Separator } from "@/components/ui/separator"
import { Box, Divider } from "@chakra-ui/react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import {
  TbAlbum,
  TbArrowBackUp,
  TbAward,
  TbBulb,
  TbFolder,
  TbHome,
  TbMoonFilled,
  TbSunFilled,
} from "react-icons/tb"

export const SensitiveNavigationList: React.FC = () => {
  const { setTheme, theme } = useTheme()

  return (
    <div className="flex flex-col space-y-2">
      <HomeNavigationButton href={"/"} leftIcon={<TbArrowBackUp />}>
        {"全年齢"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive"} leftIcon={<TbHome />}>
        {"ホーム"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive/themes"} leftIcon={<TbBulb />}>
        {"創作アイデア"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive/awards"} leftIcon={<TbAward />}>
        {"ランキング"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive/albums"} leftIcon={<TbAlbum />}>
        {"シリーズ"}
      </HomeNavigationButton>
      <HomeNavigationButton
        href={"/sensitive/collections"}
        leftIcon={<TbFolder />}
      >
        {"コレクション"}
      </HomeNavigationButton>
      <Box py={2}>
        <Divider />
      </Box>
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
      <Box py={2}>
        <Divider />
      </Box>
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
        leftIcon={theme === "dark" ? <TbSunFilled /> : <TbMoonFilled />}
      >
        {theme !== "dark" && <Sun className="mr-4 w-4">{"Light"}</Sun>}
        {theme === "dark" && <Moon className="mr-4 w-4">{"Light"}</Moon>}
        {theme === "dark" ? "ライトモード" : "ダークモード"}
      </HomeNavigationButton>
    </div>
  )
}
