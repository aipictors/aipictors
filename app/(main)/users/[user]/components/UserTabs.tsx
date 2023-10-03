"use client"
import { Tab, TabIndicator, TabList, Tabs } from "@chakra-ui/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React, { useMemo } from "react"

type Props = {
  userId: string
}

export const UserTabs: React.FC<Props> = (props) => {
  const pathname = usePathname()

  const index = useMemo(() => {
    switch (pathname) {
      case `/users/${props.userId}`:
        return 0
      case `/users/${props.userId}/novels`:
        return 1
      case `/users/${props.userId}/notes`:
        return 2
      case `/users/${props.userId}/albums`:
        return 3
      case `/users/${props.userId}/collections`:
        return 4
      case `/users/${props.userId}/stickers`:
        return 5
      case `/users/${props.userId}/supports`:
        return 6
      default:
        return 0
    }
  }, [pathname, props.userId])

  return (
    <Tabs isFitted variant="line" index={index}>
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
