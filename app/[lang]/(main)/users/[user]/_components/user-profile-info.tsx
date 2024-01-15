"use client"

import React, { useState } from "react"
import { RiEye2Line, RiHeartLine } from "react-icons/ri"

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
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">{name}</h1>
        <div className="flex items-center gap-4">
          <span className="text-base flex items-center">
            <RiHeartLine className="fill-red-500 mr-1" />
            {receivedLikesCount}
          </span>
          <span className="text-base flex items-center">
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
              className={`mt-4 text-gray ${
                showFullBiography ? "" : "truncate"
              }`}
            >
              {truncatedBiography}
              {!showFullBiography && biography.length > 100 && (
                // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                <span
                  className="text-blue-500 cursor-pointer"
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
