"use client"
import { Box, Divider, Stack, useColorMode } from "@chakra-ui/react"
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
import { HomeNavigationButton } from "app/(main)/components/HomeNavigationButton"

export const SensitiveNavigation: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Box
      as={"nav"}
      position={"sticky"}
      top={"64px"}
      h={"calc(100svh - 64px)"}
      minW={"12rem"}
      overflowY={"auto"}
    >
      <Stack py={4} pl={4}>
        <HomeNavigationButton href={"/"} leftIcon={TbArrowBackUp}>
          {"全年齢"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/sensitive"} leftIcon={TbHome}>
          {"ホーム"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/sensitive/themes"} leftIcon={TbBulb}>
          {"創作アイデア"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/sensitive/ranking"} leftIcon={TbAward}>
          {"ランキング"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/sensitive/albums"} leftIcon={TbAlbum}>
          {"シリーズ"}
        </HomeNavigationButton>
        <HomeNavigationButton
          href={"/sensitive/collections"}
          leftIcon={TbFolder}
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
        <Box py={2}>
          <Divider />
        </Box>
        <HomeNavigationButton
          onClick={() => {
            toggleColorMode()
          }}
          leftIcon={colorMode === "dark" ? TbSunFilled : TbMoonFilled}
        >
          {colorMode === "dark" ? "ライトモード" : "ダークモード"}
        </HomeNavigationButton>
      </Stack>
    </Box>
  )
}
