"use client"

import { TitleWorkCard } from "@/app/[lang]/(main)/my/albums/_components/title-work-card"
import { HStack } from "@chakra-ui/react"

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
