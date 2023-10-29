"use client"
import { HStack } from "@chakra-ui/react"
import { TitleWorkCard } from "app/[lang]/(main)/my/albums/_components/TitleWorkCard"

export const TitleWorkList: React.FC = () => {
  return (
    <HStack>
      <TitleWorkCard />
      <TitleWorkCard />
      <TitleWorkCard />
      <TitleWorkCard />
    </HStack>
  )
}
