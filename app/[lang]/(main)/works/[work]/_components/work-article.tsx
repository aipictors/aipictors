"use client"

import type { WorkQuery } from "@/__generated__/apollo"
import { WorkAction } from "@/app/[lang]/(main)/works/[work]/_components/work-action"
import { WorkImageView } from "@/app/[lang]/(main)/works/[work]/_components/work-image-view"
import { WorkUser } from "@/app/[lang]/(main)/works/[work]/_components/work-user"
import { toDateTimeText } from "@/app/_utils/to-date-time-text"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

type Props = {
  work: NonNullable<WorkQuery["work"]>
}

export const WorkArticle = (props: Props) => {
  return (
    <div className="flex flex-col lg:flex-row items-start overflow-hidden">
      <article className="flex flex-grow">
        <WorkImageView
          workImageURL={props.work.imageURL}
          subWorkImageURLs={props.work.subWorks.map((subWork) => {
            return subWork.image.downloadURL
          })}
        />
        <WorkAction workLikesCount={props.work.likesCount} />
        <h1 className="text-lg font-bold">{props.work.title}</h1>
        <span className="text-sm">{"CustomModel(その他)"}</span>
        <span className="text-sm">{toDateTimeText(props.work.createdAt)}</span>
        <span className="text-sm">{"デイリー入賞"}</span>
        {props.work.dailyTheme && (
          <div className="flex">
            <span className="text-sm">{"参加お題:"}</span>
            <Button>{props.work.dailyTheme.title}</Button>
          </div>
        )}
        <div className="flex">
          {props.work.tagNames.map((tagName) => (
            <Button key={tagName}>{`#${tagName}`}</Button>
          ))}
        </div>
        <p className="white-space">{props.work.description}</p>
        <div className="flex content-between">
          <div className="flex">
            <Avatar>
              <AvatarImage src={props.work.user.iconImage?.downloadURL} />
            </Avatar>
            <span>{props.work.user.name}</span>
            <Button size={"sm"}>{"フォローする"}</Button>
          </div>
          <span>{"一覧をダイアログで見る"}</span>
        </div>
        <div className="flex overflow-x-auto">
          {props.work.user.works.map((work) => (
            <img
              key={work.id}
              className="h-10 rounded-md"
              alt=""
              src={work.largeThumbnailImageURL}
            />
          ))}
        </div>
      </article>
      <WorkUser
        userName={props.work.user.name}
        userIconImageURL={props.work.user.iconImage?.downloadURL}
        userFollowersCount={props.work.user.followersCount}
        userBiography={props.work.user.biography}
        userPromptonId={props.work.user.promptonUser?.id}
        userWorksCount={props.work.user.worksCount}
      />
    </div>
  )
}
