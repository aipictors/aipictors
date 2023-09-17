"use client"
import { Button, Link as ChakraLink, Icon } from "@chakra-ui/react"
import Link from "next/link"

type Props = {
  leftIcon?: React.FC
  href: string
  children: React.ReactNode
}

export const HomeNavigationButton: React.FC<Props> = (props) => {
  if (props.href.startsWith("http")) {
    return (
      <Button
        lineHeight={1}
        leftIcon={<Icon as={props.leftIcon} />}
        justifyContent={"flex-start"}
        variant={"ghost"}
        as={ChakraLink}
        isExternal
        href={props.href}
        size={"sm"}
      >
        {props.children}
      </Button>
    )
  }

  return (
    <Button
      lineHeight={1}
      leftIcon={<Icon as={props.leftIcon} />}
      justifyContent={"flex-start"}
      variant={"ghost"}
      as={Link}
      href={props.href}
      size={"sm"}
    >
      {props.children}
    </Button>
  )
}
