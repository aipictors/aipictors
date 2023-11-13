"use client"

import { BetaUserNavigationButton } from "@/app/[lang]/(main)/_components/beta-user-navigation-button"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import React from "react"
import { TbBellFilled, TbMenu2 } from "react-icons/tb"

type Props = {
  title?: string
  onOpenNavigation?: () => void
}

export const BetaHeader: React.FC<Props> = (props) => {
  return (
    <div className="flex p-4 space-x-4 sticky top-0 bg-white dark:bg-gray-800 z-100">
      <Button
        variant={"ghost"}
        aria-label="メニュー"
        onClick={props.onOpenNavigation}
      >
        <TbMenu2 />
      </Button>
      <div className="flex items-center">
        <Link href="https://www.aipictors.com">
          <img src="/icon.png" className="w-8 h-8 rounded-full" alt="Avatar" />
        </Link>
      </div>
      <div className="flex flex-row flex-grow items-center">
        <span className="font-bold">{props.title ?? "Beta"}</span>
      </div>
      <div className="flex space-x-2">
        <Button
          variant={"ghost"}
          disabled
          className="rounded-full p-2 text-lg"
          aria-label="通知"
        >
          <TbBellFilled />
        </Button>
        <BetaUserNavigationButton />
      </div>
    </div>
  )
}
