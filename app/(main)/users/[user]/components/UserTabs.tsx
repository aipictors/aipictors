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
        <Tab as={Link} href={`/users/${props.userId}`} minW={32}>
          {"画像"}
        </Tab>
        <Tab as={Link} href={`/users/${props.userId}/novels`} minW={32}>
          {"小説"}
        </Tab>
        <Tab as={Link} href={`/users/${props.userId}/notes`} minW={32}>
          {"コラム"}
        </Tab>
        <Tab as={Link} href={`/users/${props.userId}/albums`} minW={32}>
          {"シリーズ"}
        </Tab>
        <Tab as={Link} href={`/users/${props.userId}/collections`} minW={32}>
          {"コレクション"}
        </Tab>
        <Tab as={Link} href={`/users/${props.userId}/stickers`} minW={32}>
          {"スタンプ"}
        </Tab>
        <Tab as={Link} href={`/users/${props.userId}/supports`} minW={32}>
          {"支援応援"}
        </Tab>
      </TabList>
      <TabIndicator mt="-1.5px" height="2px" bg="blue.500" borderRadius="1px" />
    </Tabs>
  )
}
