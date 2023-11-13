"use client"

import { LoginModal } from "@/app/[lang]/(main)/_components/login-modal"
import { LogoutModal } from "@/app/[lang]/(main)/_components/logout-modal"
import { AppContext } from "@/app/_contexts/app-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDisclosure } from "@chakra-ui/react"
import Link from "next/link"
import { useContext } from "react"
import {
  TbLogin,
  TbLogout,
  TbSettings,
  TbSparkles,
  TbUserCircle,
  TbUserCog,
} from "react-icons/tb"

export const BetaUserNavigationButton: React.FC = () => {
  const appContext = useContext(AppContext)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    isOpen: isOpenLogout,
    onOpen: onOpenLogout,
    onClose: onCloseLogout,
  } = useDisclosure()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarFallback>{"Y"}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {appContext.isLoggedIn && (
          <DropdownMenuItem>
            <a
              href={`https://www.aipictors.com/users/?id=${appContext.userId}`}
            >
              <TbUserCircle className="inline-block mr-2" /> マイページ
            </a>
          </DropdownMenuItem>
        )}
        {appContext.isLoggedIn && (
          <Link href={"/account"}>
            <DropdownMenuItem>
              <TbUserCog className="inline-block mr-2" /> アカウント
            </DropdownMenuItem>
          </Link>
        )}
        {appContext.isLoggedIn && (
          <Link href={"/settings"}>
            <DropdownMenuItem>
              <TbSettings className="inline-block mr-2" /> 設定
            </DropdownMenuItem>
          </Link>
        )}
        {appContext.isLoggedIn && (
          <Link href={"/plus"}>
            <DropdownMenuItem>
              <TbSparkles className="inline-block mr-2" /> Aipictors+
            </DropdownMenuItem>
          </Link>
        )}
        {/* <button
            type="button"
            className="text-gray-700 block w-full text-left px-4 py-2 text-sm"
            role="menuitem"
            id="menu-item-4"
            onClick={toggleColorMode}
          >
            {colorMode === "dark" ? (
              <TbSunFilled className="inline-block mr-2" />
            ) : (
              <TbMoonFilled className="inline-block mr-2" />
            )}
            {colorMode === "dark" ? "ライトモード" : "ダークモード"}
          </button> */}
        {appContext.isLoggedIn && (
          <DropdownMenuItem onClick={onOpenLogout}>
            <TbLogout className="inline-block mr-2" /> ログアウト
          </DropdownMenuItem>
        )}
        {appContext.isNotLoggedIn && (
          <DropdownMenuItem onClick={onOpen}>
            <TbLogin className="inline-block mr-2" /> ログイン
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
      <LoginModal isOpen={isOpen} onClose={onClose} />
      <LogoutModal
        isOpen={isOpenLogout}
        onClose={onCloseLogout}
        onOpen={onOpenLogout}
      />
    </DropdownMenu>
  )
}
