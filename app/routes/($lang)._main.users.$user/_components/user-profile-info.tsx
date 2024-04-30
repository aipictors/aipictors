import type React from "react"
import { useState } from "react"
import { RiEye2Line, RiHeartLine } from "@remixicon/react"

type UserProfileInfoProps = {
  name: string
  receivedLikesCount: number
  receivedViewsCount: number
  awardsCount: number
  followersCount: number
  biography: string
}

const UserProfileInfo: React.FC<UserProfileInfoProps> = ({
  name,
  receivedLikesCount,
  receivedViewsCount,
  awardsCount,
  followersCount,
  biography,
}) => {
  const [showFullBiography, setShowFullBiography] = useState(false)

  const toggleBiography = () => {
    setShowFullBiography(!showFullBiography)
  }

  const truncatedBiography = showFullBiography
    ? biography
    : biography.slice(0, 100)

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col">
        <h1 className="font-bold text-2xl">{name}</h1>
        <div className="flex items-center gap-4">
          <span className="flex items-center text-base">
            <RiHeartLine className="mr-1 fill-red-500" />
            {receivedLikesCount}
          </span>
          <span className="flex items-center text-base">
            <RiEye2Line className="mr-1" />
            {receivedViewsCount}
          </span>
          <span className="text-base">入賞回数{awardsCount}回</span>
        </div>
        <div className="text-base">
          <span>{followersCount}フォロワー</span>
        </div>
        {biography && (
          <div>
            <p
              className={`mt-4 text-gray${showFullBiography ? "" : "truncate"}`}
            >
              {truncatedBiography}
              {!showFullBiography && biography.length > 100 && (
                // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                <span
                  className="cursor-pointer text-blue-500"
                  onClick={toggleBiography}
                >
                  {" Read More"}
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfileInfo
