"use client"
import { Tab, TabIndicator, TabList, Tabs } from "@chakra-ui/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"

export const UserTabs: React.FC = () => {
  const pathname = usePathname()
  console.log(pathname)
  return (
    <Tabs isFitted variant="line" index={1}>
      <TabList>
        <Tab as={Link} href={"/users/maple"}>
          {"画像"}
        </Tab>
        <Tab as={Link} href={"/users/maple/novels"}>
          {"小説"}
        </Tab>
        <Tab as={Link} href={"/users/maple/notes"}>
          {"コラム"}
        </Tab>
        <Tab as={Link} href={"/users/albums/albums"}>
          {"シリーズ"}
        </Tab>
        <Tab as={Link} href={"/users/maple/collections"}>
          {"コレクション"}
        </Tab>
        <Tab as={Link} href={"/users/maple/stickers"}>
          {"スタンプ"}
        </Tab>
        <Tab as={Link} href={"/users/maple/supports"}>
          {"支援応援"}
        </Tab>
      </TabList>
      <TabIndicator mt="-1.5px" height="2px" bg="blue.500" borderRadius="1px" />
    </Tabs>
  )
}
