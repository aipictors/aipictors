"use client"
import {
  Avatar,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  Link as ChakraLink,
  MenuItem,
  MenuList,
  useColorMode,
} from "@chakra-ui/react"
import Link from "next/link"
import { useContext } from "react"
import {
  TbAlbum,
  TbDashboard,
  TbLogout,
  TbMoonFilled,
  TbMug,
  TbSettings,
  TbSparkles,
  TbSunFilled,
  TbUser,
  TbUserDown,
  TbUserUp,
} from "react-icons/tb"
import { AppContext } from "app/contexts/appContext"

export const HomeUserNavigationButton: React.FC = () => {
  const appContext = useContext(AppContext)

  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label={"Account"}
        icon={<Avatar src={""} size={"sm"} />}
        variant={"ghost"}
        size={"sm"}
        borderRadius={"full"}
      />
      <MenuList>
        {appContext.isLoggedIn && (
          <MenuItem
            as={ChakraLink}
            isExternal
            icon={<Icon as={TbUser} fontSize={"lg"} />}
            href={`https://www.aipictors.com/users/?id=${appContext.userId}`}
          >
            {"マイページ"}
          </MenuItem>
        )}
        {appContext.isLoggedIn && (
          <MenuItem
            as={ChakraLink}
            isExternal
            icon={<Icon as={TbDashboard} fontSize={"lg"} />}
            href={"https://www.aipictors.com/dashboard"}
          >
            {"ダッシュボード"}
          </MenuItem>
        )}
        {appContext.isLoggedIn && (
          <MenuItem
            as={Link}
            icon={<Icon as={TbAlbum} fontSize={"lg"} />}
            href={"/viewer/albums"}
          >
            {"シリーズ"}
          </MenuItem>
        )}
        {appContext.isLoggedIn && (
          <MenuItem
            as={Link}
            icon={<Icon as={TbUserDown} fontSize={"lg"} />}
            href={"/viewer/followers"}
          >
            {"フォロワー"}
          </MenuItem>
        )}
        {appContext.isLoggedIn && (
          <MenuItem
            as={Link}
            icon={<Icon as={TbUserUp} fontSize={"lg"} />}
            href={"/viewer/followees"}
          >
            {"フォロー"}
          </MenuItem>
        )}
        {appContext.isLoggedIn && (
          <MenuItem isDisabled icon={<Icon as={TbMug} fontSize={"lg"} />}>
            {"支援管理"}
          </MenuItem>
        )}
        {appContext.isLoggedIn && (
          <MenuItem
            as={Link}
            icon={<Icon as={TbSparkles} fontSize={"lg"} />}
            href={"/plus"}
          >
            {"Aipictors+"}
          </MenuItem>
        )}
        {appContext.isLoggedIn && (
          <MenuItem
            as={Link}
            icon={<Icon as={TbSettings} fontSize={"lg"} />}
            href={"/settings/login"}
          >
            {"設定"}
          </MenuItem>
        )}
        <MenuItem
          icon={
            <Icon
              as={colorMode === "dark" ? TbSunFilled : TbMoonFilled}
              fontSize={"lg"}
            />
          }
          onClick={toggleColorMode}
        >
          {colorMode === "dark" ? "ライトモード" : "ダークモード"}
        </MenuItem>
        <MenuItem icon={<Icon as={TbLogout} fontSize={"lg"} />}>
          {"ログアウト"}
        </MenuItem>
      </MenuList>
    </Menu>
  )
}
