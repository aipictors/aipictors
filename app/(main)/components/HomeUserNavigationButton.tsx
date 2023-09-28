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
  useDisclosure,
} from "@chakra-ui/react"
import Link from "next/link"
import { useContext } from "react"
import {
  TbAlbum,
  TbDashboard,
  TbLogin,
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
import { LoginModal } from "app/(main)/components/LoginModal"
import { LogoutModal } from "app/(main)/components/LogoutModal"
import { AppContext } from "app/contexts/appContext"
import { Config } from "config"

export const HomeUserNavigationButton: React.FC = () => {
  const appContext = useContext(AppContext)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const { colorMode, toggleColorMode } = useColorMode()

  const {
    isOpen: isOpenLogout,
    onOpen: onOpenLogout,
    onClose: onCloseLogout,
  } = useDisclosure()

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
            isDisabled={Config.isReleaseMode}
            as={Link}
            icon={<Icon as={TbAlbum} fontSize={"lg"} />}
            href={"/viewer/collections"}
          >
            {"コレクション"}
          </MenuItem>
        )}
        {appContext.isLoggedIn && (
          <MenuItem
            isDisabled={Config.isReleaseMode}
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
        {appContext.isLoggedIn && (
          <MenuItem
            icon={<Icon as={TbLogout} fontSize={"lg"} />}
            onClick={onOpenLogout}
          >
            {"ログアウト"}
          </MenuItem>
        )}
        {appContext.isNotLoggedIn && (
          <MenuItem
            icon={<Icon as={TbLogin} fontSize={"lg"} />}
            onClick={() => {
              onOpen()
            }}
          >
            {"ログイン"}
          </MenuItem>
        )}
        <LoginModal isOpen={isOpen} onClose={onClose} />
        <LogoutModal
          isOpen={isOpenLogout}
          onClose={onCloseLogout}
          onOpen={onOpenLogout}
        />
      </MenuList>
    </Menu>
  )
}
