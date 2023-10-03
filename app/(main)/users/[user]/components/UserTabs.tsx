"use client"
import { Tab, TabIndicator, TabList, Tabs } from "@chakra-ui/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"

type Props = {
  userId: string
}

export const UserTabs: React.FC<Props> = (props) => {
  const pathname = usePathname()
  console.log(pathname)
  return (
    <Tabs isFitted variant="line" index={1}>
      <TabList>
        <Tab as={Link} href={`/users/${props.userId}`}>
          {"画像"}
        </Tab>
        <Tab as={Link} href={`/users/${props.userId}/novels`}>
          {"小説"}
        </Tab>
        <Tab as={Link} href={`/users/${props.userId}/notes`}>
          {"コラム"}
        </Tab>
        <Tab as={Link} href={`/users/${props.userId}/albums`}>
          {"シリーズ"}
        </Tab>
        <Tab as={Link} href={`/users/${props.userId}/collections`}>
          {"コレクション"}
        </Tab>
        <Tab as={Link} href={`/users/${props.userId}/stickers`}>
          {"スタンプ"}
        </Tab>
        <Tab as={Link} href={`/users/${props.userId}/supports`}>
          {"支援応援"}
        </Tab>
      </TabList>
      <TabIndicator mt="-1.5px" height="2px" bg="blue.500" borderRadius="1px" />
    </Tabs>
  )
}
