"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

type Props = {
  leftIcon?: React.ReactNode
  href?: string
  children: React.ReactNode
  onClick?(): void
  isDisabled?: boolean
}

export const HomeNavigationButton = (props: Props) => {
  if (props.isDisabled) {
    return (
      <Button
        variant={"ghost"}
        disabled={true}
        size={"sm"}
        className="w-full justify-start"
      >
        {props.leftIcon && <span className="mr-4">{props.leftIcon}</span>}
        <span>{props.children}</span>
      </Button>
    )
  }

  if (props.href === undefined) {
    return (
      <Button
        variant={"ghost"}
        disabled={props.isDisabled}
        className="w-full justify-start"
        size={"sm"}
        onClick={props.onClick}
      >
        {props.leftIcon && <span className="mr-4">{props.leftIcon}</span>}
        <span>{props.children}</span>
      </Button>
    )
  }

  if (props.href.startsWith("http")) {
    return (
      <a href={props.href} target="_blank" rel="noopener noreferrer">
        <Button variant={"ghost"} size={"sm"} className="w-full justify-start">
          {props.leftIcon && <span className="mr-4">{props.leftIcon}</span>}
          <span>{props.children}</span>
        </Button>
      </a>
    )
  }

  return (
    <Link href={props.href}>
      <Button
        variant={"ghost"}
        className="w-full justify-start"
        size={"sm"}
        disabled={props.isDisabled}
      >
        {props.leftIcon && <span className="mr-4">{props.leftIcon}</span>}
        <span>{props.children}</span>
      </Button>
    </Link>
  )
}
