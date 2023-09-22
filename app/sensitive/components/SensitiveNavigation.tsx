"use client"
import { Box, Divider, Stack, useColorMode } from "@chakra-ui/react"
import {
  TbAlbum,
  TbArrowBackUp,
  TbAward,
  TbBulb,
  TbCamera,
  TbFolder,
  TbHome,
  TbMoonFilled,
  TbPhoto,
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
          {"全年齢に戻る"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/sensitive"} leftIcon={TbHome}>
          {"ホーム"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/themes"} leftIcon={TbBulb}>
          {"創作アイデア"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/ranking"} leftIcon={TbAward}>
          {"ランキング"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/series"} leftIcon={TbAlbum}>
          {"シリーズ"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/collections"} leftIcon={TbFolder}>
          {"コレクション"}
        </HomeNavigationButton>
        <Box py={2}>
          <Divider />
        </Box>
        <HomeNavigationButton
          href={"/sensitive/works/3d/a"}
          leftIcon={TbCamera}
        >
          {"フォトA"}
        </HomeNavigationButton>
        <HomeNavigationButton
          href={"/sensitive/works/3d/b"}
          leftIcon={TbCamera}
        >
          {"フォトB"}
        </HomeNavigationButton>
        <HomeNavigationButton
          href={"/sensitive/works/3d/c"}
          leftIcon={TbCamera}
        >
          {"フォトC"}
        </HomeNavigationButton>
        <Box py={2}>
          <Divider />
        </Box>
        <HomeNavigationButton href={"/sensitive/works/2d/a"} leftIcon={TbPhoto}>
          {"イラストA"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/sensitive/works/2d/b"} leftIcon={TbPhoto}>
          {"イラストB"}
        </HomeNavigationButton>
        <HomeNavigationButton href={"/sensitive/works/2d/c"} leftIcon={TbPhoto}>
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
