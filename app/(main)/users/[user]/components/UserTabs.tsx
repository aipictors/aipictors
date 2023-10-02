"use client"
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import React from "react"
import type { UserQuery, UserWorksQuery } from "__generated__/apollo"
import { UserAlbumList } from "app/(main)/users/[user]/components/UserAlbumList"
import { UserNoteList } from "app/(main)/users/[user]/components/UserNoteList"
import { UserNovelList } from "app/(main)/users/[user]/components/UserNovelList"
import { UserSupport } from "app/(main)/users/[user]/components/UserSupport"
import { UserWorkList } from "app/(main)/users/[user]/components/UserWorkList"
import { UserWorkListActions } from "app/(main)/users/[user]/components/UserWorkListActions"

type Props = {
  works: NonNullable<NonNullable<UserWorksQuery["user"]>["works"]>
  user: NonNullable<UserQuery["user"]>
}

export const UserTabs: React.FC<Props> = (props) => (
  <Tabs isFitted variant="line">
    <TabList mb="1em">
      <Tab>{"画像"}</Tab>
      <Tab>{"小説"}</Tab>
      <Tab>{"コラム"}</Tab>
      <Tab>{"シリーズ"}</Tab>
      <Tab>{"支援応援"}</Tab>
    </TabList>
    <TabPanels>
      <TabPanel>
        <UserWorkListActions />
        <UserWorkList works={props.works} />
      </TabPanel>
      <TabPanel>
        <UserWorkListActions />
        <UserNovelList />
      </TabPanel>
      <TabPanel>
        <UserWorkListActions />
        <UserNoteList />
      </TabPanel>
      <TabPanel>
        <UserWorkListActions />
        <UserAlbumList />
      </TabPanel>
      <TabPanel>
        <UserSupport user={props.user} />
      </TabPanel>
    </TabPanels>
  </Tabs>
)
