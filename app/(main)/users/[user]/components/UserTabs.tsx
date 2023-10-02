"use client"
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import React from "react"
import type { UserWorksQuery } from "__generated__/apollo"
import { UserSupport } from "app/(main)/users/[user]/components/UserSupport"
import { UserWorkList } from "app/(main)/users/[user]/components/UserWorkList"
import { UserWorkListActions } from "app/(main)/users/[user]/components/UserWorkListActions"

type Props = {
  works: NonNullable<NonNullable<UserWorksQuery["user"]>["works"]>
}

export const UserTabs: React.FC<Props> = (props) => (
  <Tabs isFitted variant="line">
    <TabList mb="1em">
      <Tab>{"画像"}</Tab>
      <Tab>{"小説"}</Tab>
      <Tab>{"コラム"}</Tab>
      <Tab>{"支援応援"}</Tab>
    </TabList>
    <TabPanels>
      <TabPanel>
        <UserWorkListActions />
        <UserWorkList works={props.works} />
      </TabPanel>
      <TabPanel>
        <UserWorkList works={props.works} />
      </TabPanel>
      <TabPanel>
        <UserWorkList works={props.works} />
      </TabPanel>
      <TabPanel>
        <UserSupport />
      </TabPanel>
    </TabPanels>
  </Tabs>
)
