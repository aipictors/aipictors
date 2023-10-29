"use client"

import { HStack, Icon, IconButton } from "@chakra-ui/react"
import { TbStar, TbStarFilled } from "react-icons/tb"

type Props = {
  value: number
  onChange(value: number): void
}

export const StarRating: React.FC<Props> = (props) => {
  return (
    <HStack justifyContent={"center"}>
      <IconButton
        aria-label={"お気に入り"}
        borderRadius={"full"}
        icon={<Icon as={0 < props.value ? TbStarFilled : TbStar} />}
        variant={"ghost"}
        onClick={() => {
          props.onChange(1)
        }}
      />
      <IconButton
        aria-label={"お気に入り"}
        borderRadius={"full"}
        icon={<Icon as={1 < props.value ? TbStarFilled : TbStar} />}
        variant={"ghost"}
        onClick={() => {
          props.onChange(2)
        }}
      />
      <IconButton
        aria-label={"お気に入り"}
        borderRadius={"full"}
        icon={<Icon as={2 < props.value ? TbStarFilled : TbStar} />}
        variant={"ghost"}
        onClick={() => {
          props.onChange(3)
        }}
      />
      <IconButton
        aria-label={"お気に入り"}
        borderRadius={"full"}
        icon={<Icon as={3 < props.value ? TbStarFilled : TbStar} />}
        variant={"ghost"}
        onClick={() => {
          props.onChange(4)
        }}
      />
      <IconButton
        aria-label={"お気に入り"}
        borderRadius={"full"}
        icon={<Icon as={4 < props.value ? TbStarFilled : TbStar} />}
        variant={"ghost"}
        onClick={() => {
          props.onChange(5)
        }}
      />
    </HStack>
  )
}
