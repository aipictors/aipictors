"use client"

import {
  Card,
  Divider,
  HStack,
  Icon,
  IconButton,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { HelpCircle } from "lucide-react"

type Props = {
  title: string
  tooltip?: string
  action?: React.ReactNode
  children: React.ReactNode
}

export const GenerationEditorCard = (props: Props) => {
  return (
    <Card
      variant={"filled"}
      h={"100%"}
      overflowX={"hidden"}
      overflowY={"auto"}
      position={"relative"}
    >
      <HStack
        position={"sticky"}
        top={0}
        zIndex={8}
        bg={"rgba(255,255,255,0.1)"}
        px={2}
        py={2}
        justifyContent={"space-between"}
      >
        <HStack alignItems={"center"}>
          <Text fontWeight={"bold"}>{props.title}</Text>
        </HStack>
        <HStack>
          {props.tooltip && (
            <Tooltip label={props.tooltip} fontSize="md">
              <IconButton
                size={"sm"}
                aria-label={"メニュー"}
                borderRadius={"full"}
                icon={<Icon as={HelpCircle} />}
              />
            </Tooltip>
          )}
          {props.action}
        </HStack>
      </HStack>
      <Divider />
      {props.children}
    </Card>
  )
}
