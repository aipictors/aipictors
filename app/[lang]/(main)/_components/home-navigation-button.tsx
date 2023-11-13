"use client"

import { Button } from "@/components/ui/button"
import type { ButtonProps } from "@chakra-ui/react"

type Props = {
  leftIcon?: React.ReactNode
  href?: string
  children: React.ReactNode
  onClick?: ButtonProps["onClick"]
  isDisabled?: boolean
}

export const HomeNavigationButton = (props: Props) => {
  if (props.isDisabled) {
    return (
      <Button disabled={true} className="justify-start space-x-2 flex flex-row">
        {props.leftIcon && <span className="mr-1">{props.leftIcon}</span>}
        {props.children}
      </Button>
    )
  }

  if (props.href === undefined) {
    return (
      <Button
        disabled={props.isDisabled}
        className="justify-start space-x-2 flex flex-row"
        onClick={props.onClick}
      >
        {props.leftIcon && <span className="mr-1">{props.leftIcon}</span>}
        {props.children}
      </Button>
    )
  }

  if (props.href.startsWith("http")) {
    return (
      <a href={props.href} target="_blank" rel="noopener noreferrer">
        <Button className="justify-start space-x-2 flex flex-row">
          {props.leftIcon && <span className="mr-1">{props.leftIcon}</span>}
          {props.children}
        </Button>
      </a>
    )
  }

  return (
    <Button
      className="justify-start space-x-2 flex flex-row"
      disabled={props.isDisabled}
    >
      {props.leftIcon && <span className="mr-1">{props.leftIcon}</span>}
      {props.children}
    </Button>
  )
}
