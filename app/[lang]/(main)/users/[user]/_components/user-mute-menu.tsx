"use client"

import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react"
import { MoreHorizontal } from "lucide-react"

export const UserMuteMenu = () => {
  return (
    <Menu>
      <MenuButton as={Button} leftIcon={<MoreHorizontal />} size={"sm"} />
      <MenuList>
        <MenuItem>
          <Text>{"ミュートする"}</Text>
        </MenuItem>
        <MenuItem>
          <Text>{"報告する"}</Text>
        </MenuItem>
      </MenuList>
    </Menu>
  )
}
