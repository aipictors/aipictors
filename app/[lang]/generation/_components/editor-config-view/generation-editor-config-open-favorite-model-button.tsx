"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Props = {
  isActive: boolean
  setFavoriteMode(bool: boolean): void
}

/**
 * お気に入りモデル一覧表示切替トグル
 * @param props
 * @returns
 */
export const GenerationFavoriteModeTabs = (props: Props) => {
  return (
    <Tabs
      value={props.isActive ? "on" : "off"}
      className="w-full"
      onValueChange={(value) => {
        props.setFavoriteMode(value === "on")
      }}
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="off">{"選択"}</TabsTrigger>
        <TabsTrigger value="on">{"お気に入り"}</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
