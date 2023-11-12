"use client"

import {
  Avatar,
  Icon,
  IconButton,
  Link as ChakraLink,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react"
import { LoginModal } from "app/[lang]/(main)/_components/login-modal"
import { LogoutModal } from "app/[lang]/(main)/_components/logout-modal"
import { AppContext } from "app/_contexts/app-context"

import Link from "next/link"
import { useContext } from "react"
import {
  TbLogin,
  TbLogout,
  TbMoonFilled,
  TbSettings,
  TbSparkles,
  TbSunFilled,
  TbUserCircle,
  TbUserCog,
} from "react-icons/tb"

export const BetaUserNavigationButton: React.FC = () => {
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
            icon={<Icon as={TbUserCircle} fontSize={"lg"} />}
            href={`https://www.aipictors.com/users/?id=${appContext.userId}`}
          >
            {"マイページ"}
          </MenuItem>
        )}
        {appContext.isLoggedIn && (
          <MenuItem
            as={Link}
            icon={<Icon as={TbUserCog} fontSize={"lg"} />}
            href={"/account"}
          >
            {"アカウント"}
          </MenuItem>
        )}
        {appContext.isLoggedIn && (
          <MenuItem
            isDisabled={true}
            as={Link}
            icon={<Icon as={TbSettings} fontSize={"lg"} />}
            href={"/settings"}
          >
            {"設定"}
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
        {/* {appContext.isLoggedIn && (
          <MenuItem
            as={Link}
            icon={<Icon as={TbSettings} fontSize={"lg"} />}
            href={"/settings/login"}
          >
            {"設定"}
          </MenuItem>
        )} */}
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
