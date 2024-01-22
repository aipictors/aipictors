"use client"

import { PromptonRequestButton } from "@/app/[lang]/(main)/works/[work]/_components/prompton-request-button"
import { WorkAction } from "@/app/[lang]/(main)/works/[work]/_components/work-action"
import { WorkImageView } from "@/app/[lang]/(main)/works/[work]/_components/work-image-view"
import { FollowButton } from "@/app/_components/button/follow-button"
import { toDateTimeText } from "@/app/_utils/to-date-time-text"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { WorkQuery } from "@/graphql/__generated__/graphql"
import Link from "next/link"

type Props = {
  work: NonNullable<WorkQuery["work"]>
}

/**
 * 作品詳細情報
 */
export const WorkArticle = (props: Props) => {
  return (
    <article className="flex flex-col justify-start space-y-4">
      <WorkImageView
        workImageURL={props.work.imageURL}
        subWorkImageURLs={props.work.subWorks.map((subWork) => {
          return subWork.image.downloadURL
        })}
      />
      <WorkAction
        workLikesCount={props.work.likesCount}
        title={props.work.title}
        imageUrl={props.work.imageURL}
      />
      <h1 className="text-lg font-bold">{props.work.title}</h1>
      <div className="flex flex-col space-y-2">
        <span className="text-sm">{"使用モデル名"}</span>
        <span className="text-sm">{toDateTimeText(props.work.createdAt)}</span>
        <span className="text-sm">{"デイリー入賞"}</span>
        {props.work.dailyTheme && (
          <div className="flex items-center">
            <span className="text-sm">{"参加お題:"}</span>
            <Button variant={"link"}>{props.work.dailyTheme.title}</Button>
          </div>
        )}
        <div className="flex flex-row flex-wrap">
          {props.work.tagNames.map((tagName) => (
            <Button
              key={tagName}
              variant={"link"}
              size={"sm"}
            >{`#${tagName}`}</Button>
          ))}
        </div>
      </div>
      <p className="whitespace-pre-wrap overflow-hidden break-words">
        {props.work.description}
      </p>
      <div className="flex justify-between items-center">
        <div className="flex space-x-2 items-center">
          <Avatar>
            <Link href={`/users/${props.work.user.login}`}>
              <AvatarImage src={props.work.user.iconImage?.downloadURL} />
              <AvatarFallback />
            </Link>
          </Avatar>
          <span>{props.work.user.name}</span>
          <FollowButton />
          <PromptonRequestButton />
        </div>
        {/* <p className="text-sm">{"一覧をダイアログで見る"}</p> */}
      </div>
    </article>
  )
}
