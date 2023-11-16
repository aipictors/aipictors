"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
  year: number
  month: number
  day: number
}

export const RankingHeader = (props: Props) => {
  return (
    <div className="flex">
      <div className="flex flex-col">
        <p className="text-2xl">{"ランキング"}</p>
        <div className="flex flex-col">
          <div className="flex">
            <ChevronLeft />
            <p>{`${props.year}年${props.month}月`}</p>
            <ChevronRight />
          </div>
          {/* <Tabs isFitted variant="line">
            <TabPanels>
              <TabList mb="1em">
                <Tab>{"デイリー"}</Tab>
                <Tab>{"ウィークリー"}</Tab>
                <Tab>{"マンスリー"}</Tab>
              </TabList>
            </TabPanels>
          </Tabs> */}
        </div>
      </div>
    </div>
  )
}
