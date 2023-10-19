"use client"
import { HStack } from "@chakra-ui/react"
import { CardTitleWork } from "app/[lang]/(main)/my/albums/_components/CardTitleWork"

export const CardTitleWorkList: React.FC = () => {
  return (
    <HStack>
      <CardTitleWork />
      <CardTitleWork />
      <CardTitleWork />
      <CardTitleWork />
    </HStack>
  )
}
