"use client"
import { HStack } from "@chakra-ui/react"
import { CardTitleWork } from "app/[lang]/(main)/viewer/albums/components/CardTitleWork"

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
