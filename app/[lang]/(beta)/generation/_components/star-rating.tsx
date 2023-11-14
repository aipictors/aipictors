"use client"

import { cn } from "@/lib/utils"
import { HStack, IconButton } from "@chakra-ui/react"
import { Star } from "lucide-react"

type Props = {
  value: number
  onChange(value: number): void
}

export const StarRating = (props: Props) => {
  return (
    <HStack justifyContent={"center"}>
      <IconButton
        aria-label={"お気に入り"}
        borderRadius={"full"}
        icon={<Star className={cn(0 < props.value && "fill-yellow-500")} />}
        variant={"ghost"}
        onClick={() => {
          props.onChange(1)
        }}
      />
      <IconButton
        aria-label={"お気に入り"}
        borderRadius={"full"}
        icon={<Star className={cn(1 < props.value && "fill-yellow-500")} />}
        variant={"ghost"}
        onClick={() => {
          props.onChange(2)
        }}
      />
      <IconButton
        aria-label={"お気に入り"}
        borderRadius={"full"}
        icon={<Star className={cn(2 < props.value && "fill-yellow-500")} />}
        variant={"ghost"}
        onClick={() => {
          props.onChange(3)
        }}
      />
      <IconButton
        aria-label={"お気に入り"}
        borderRadius={"full"}
        icon={<Star className={cn(3 < props.value && "fill-yellow-500")} />}
        variant={"ghost"}
        onClick={() => {
          props.onChange(4)
        }}
      />
      <IconButton
        aria-label={"お気に入り"}
        borderRadius={"full"}
        icon={<Star className={cn(4 < props.value && "fill-yellow-500")} />}
        variant={"ghost"}
        onClick={() => {
          props.onChange(5)
        }}
      />
    </HStack>
  )
}
