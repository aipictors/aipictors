"use client"

import { Button, Card, HStack, Text, Tooltip } from "@chakra-ui/react"

type Props = {
  title: string
  tooltip?: string
  action?: React.ReactNode
  children: React.ReactNode
}

export const GenerationEditorCard: React.FC<Props> = (props) => {
  return (
    <Card
      h={"100%"}
      overflowX={"hidden"}
      overflowY={"auto"}
      position={"relative"}
    >
      <HStack
        position={"sticky"}
        top={0}
        zIndex={8}
        bg={"gray.700"}
        p={4}
        boxShadow={"md"}
        justifyContent={"space-between"}
      >
        <HStack>
          <Text fontWeight={"bold"}>{props.title}</Text>
          {props.tooltip && (
            <Tooltip label={props.tooltip} fontSize="md">
              <Button size={"xs"} borderRadius={"full"}>
                {"?"}
              </Button>
            </Tooltip>
          )}
        </HStack>
        {props.action}
      </HStack>
      {props.children}
    </Card>
  )
}
