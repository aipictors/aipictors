"use client"

import {
  Button,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react"
import { TbDots } from "react-icons/tb"

export const UserMuteMenu = () => {
  return (
    <Menu>
      <MenuButton as={Button} leftIcon={<Icon as={TbDots} />} size={"sm"} />
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
