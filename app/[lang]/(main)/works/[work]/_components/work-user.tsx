"use client"

import { PromptonRequestButton } from "@/app/[lang]/(main)/works/[work]/_components/prompton-request-button"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type Props = {
  userName: string
  userIconImageURL?: string
  userFollowersCount: number
  userBiography: string | null
  userPromptonId?: string
  userWorksCount: number
}

export const WorkUser = (props: Props) => {
  return (
    <div className="w-full lg:max-w-xs">
      <Card className="p-4">
        <div className="flex justify-center">
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <img
                className="w-16 h-16 rounded-full"
                src={props.userIconImageURL}
                alt=""
              />
              <p className="text-md">{props.userName}</p>
            </div>
            <div className="flex justify-center space-x-2">
              <p>{`投稿数：${props.userWorksCount}`}</p>
              <p>{`フォロワー数：${props.userFollowersCount}`}</p>
            </div>
            <div className="flex justify-center space-x-2">
              <Button className="flex-1">{"フォローする"}</Button>
              {props.userPromptonId && (
                <PromptonRequestButton className="flex-1" />
              )}
            </div>
            {props.userBiography && (
              <p className="whitespace-pre-wrap overflow-hidden break-words">
                {props.userBiography}
              </p>
            )}
          </div>
        </div>
      </Card>
      <p>{"前後の作品"}</p>
    </div>
  )
}
