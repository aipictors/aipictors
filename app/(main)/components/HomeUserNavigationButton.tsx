"use client"
import {
  Avatar,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react"
import { FC } from "react"
import {
  TbAlbum,
  TbDashboard,
  TbLogout,
  TbMug,
  TbSettings,
  TbSparkles,
  TbUser,
  TbUserDown,
  TbUserUp,
} from "react-icons/tb"

export const HomeUserNavigationButton: FC = () => {
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label={"Account"}
        icon={
          <Avatar
            src={
              "https://www.aipictors.com/wp-content/uploads/2023/04/aTyRPjXLGxJB9EKrqSM43CYfWFQ8is.webp"
            }
            size={"sm"}
          />
        }
        variant={"ghost"}
        size={"sm"}
        borderRadius={"full"}
      />
      <MenuList>
        <MenuItem icon={<Icon as={TbUser} />}>{"マイページ"}</MenuItem>
        <MenuItem icon={<Icon as={TbDashboard} />}>{"ダッシュボード"}</MenuItem>
        <MenuItem icon={<Icon as={TbAlbum} />}>{"シリーズ"}</MenuItem>
        <MenuItem icon={<Icon as={TbUserDown} />}>{"フォロワー"}</MenuItem>
        <MenuItem icon={<Icon as={TbUserUp} />}>{"フォロー"}</MenuItem>
        <MenuItem icon={<Icon as={TbMug} />}>{"支援管理"}</MenuItem>
        <MenuItem icon={<Icon as={TbSparkles} />}>{"Aipictors+"}</MenuItem>
        <MenuItem icon={<Icon as={TbSettings} />}>{"設定"}</MenuItem>
        <MenuItem icon={<Icon as={TbLogout} />}>{"ログアウト"}</MenuItem>
      </MenuList>
    </Menu>
  )
}
