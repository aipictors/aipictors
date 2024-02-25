"use client"

import React from "react"

type Props = {
  thumbnailSize: string
  children: React.ReactNode
}

/**
 * 画像生成履歴の一覧
 * @param props
 * @returns
 */
export const GenerationTaskListGrid = (props: Props) => {
  const getGridClasses = (size: string): string => {
    // if (props.sizeType === "full"zw) {
    //   switch (size) {
    //     case "small":
    //       return "p-2 grid grid-cols-3 gap-2 p-4 pt-0 sm:pl-4 md:grid-cols-7 2xl:grid-cols-12 lg:grid-cols-10 xl:grid-cols-11"
    //     case "middle":
    //       return "p-2 grid grid-cols-2 gap-2 p-4 pt-0 sm:pl-4 md:grid-cols-6 2xl:grid-cols-10 lg:grid-cols-8 xl:grid-cols-9"
    //     case "big":
    //       return "p-2 grid grid-cols-1 gap-2 p-4 pt-0 sm:pl-4 md:grid-cols-4 2xl:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5"
    //     default:
    //       return "p-2 grid grid-cols-2 gap-2 p-4 pt-0 sm:pl-4 md:grid-cols-2 2xl:grid-cols-8 lg:grid-cols-5 xl:grid-cols-6"
    //   }
    // }
    switch (size) {
      case "small":
        return "p-2 grid grid-cols-3 gap-2 p-4 pt-0 sm:pl-4 md:grid-cols-3 2xl:grid-cols-5 lg:grid-cols-4 xl:grid-cols-3"
      case "middle":
        return "p-2 grid grid-cols-2 gap-2 p-4 pt-0 sm:pl-4 md:grid-cols-2 2xl:grid-cols-4 lg:grid-cols-3 xl:grid-cols-2"
      case "big":
        return "p-2 grid grid-cols-1 gap-2 p-4 pt-0 sm:pl-4 md:grid-cols-1 2xl:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1"
      default:
        return "p-2 grid grid-cols-2 gap-2 p-4 pt-0 sm:pl-4 md:grid-cols-2 2xl:grid-cols-4 lg:grid-cols-3 xl:grid-cols-2"
    }
  }

  return (
    <div className={`${getGridClasses(props.thumbnailSize)}`}>
      {props.children}
    </div>
  )
}
