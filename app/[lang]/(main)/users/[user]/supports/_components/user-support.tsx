"use client"

import type { UserQuery } from "@/graphql/__generated__/graphql"
import { Button } from "@/components/ui/button"

type Props = {
  user: NonNullable<UserQuery["user"]>
  userIconImageURL: string | null
  userName: string
}

/**
 * 支援リクエスト
 * @param props
 * @returns
 */
export const UserSupport = (props: Props) => {
  return (
    <div className="flex justify-center">
      <div className="flex flex-col items-center space-y-2">
        <img
          className="rounded-full"
          src={props.userIconImageURL ?? ""}
          alt={props.userName}
        />
        <div className="flex items-center space-x-2">
          <p>{"￥1,000円"}</p>
          <Button>{"支援する"}</Button>
        </div>
        <p>{"支援リクエストが承諾されるとお礼画像とともに承諾されます"}</p>
        <p>{"支援リクエスト管理は、支援管理から確認できます"}</p>
        <p>{"使い方はこちら"}</p>
      </div>
      <img className="rounded" src="gibbresh.png" alt="" />
    </div>
  )
}
