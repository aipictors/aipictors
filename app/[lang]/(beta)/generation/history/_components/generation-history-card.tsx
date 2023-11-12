"use client"

import { Button, Card, Image } from "@chakra-ui/react"
import React from "react"

type Props = {
  imageURL: string
  onClick(): void
}

/**
 * 画像生成の履歴
 * @returns
 */
export const GenerationHistoryCard: React.FC<Props> = (props) => {
  return (
    <Card>
      <Button
        p={0}
        h={"auto"}
        overflow={"hidden"}
        variant={"outline"}
        borderWidth={2}
        borderColor={"blue.500"}
        onClick={props.onClick}
      >
        <Image
          // src={props.imageURL}
          src="https://source.unsplash.com/random/800x600"
          alt=""
          borderRadius={"md"}
          w={"100%"}
          draggable={false}
        />
      </Button>
    </Card>
  )
}
