"use client"

import { WorkImageThumbnailCarousel } from "@/app/[lang]/(main)/works/[work]/_components/work-image-thumbnail-carousel"
import React, { useState } from "react"

type Props = {
  workImageURL?: string
  subWorkImageURLs: string[]
}

export const WorkImageView = ({ workImageURL, subWorkImageURLs }: Props) => {
  const allImageURLs = workImageURL
    ? [workImageURL, ...subWorkImageURLs]
    : subWorkImageURLs
  const shouldRenderCarousel = allImageURLs.length > 1

  const [selectedImage, setSelectedImage] = useState<string>(allImageURLs[0])

  // 画像選択関数
  const handleSelectImage = (imageURL: string) => {
    setSelectedImage(imageURL)
  }

  // キーボードイベントハンドラー
  const handleKeyPress = (imageURL: string, event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSelectImage(imageURL)
    }
  }

  // カルーセルのレンダリング
  if (shouldRenderCarousel) {
    return (
      <div>
        <img
          className="bg-card w-auto h-full xl:h-screen object-contain rounded"
          alt="Selected work"
          src={selectedImage}
        />
        <WorkImageThumbnailCarousel
          allImageURLs={allImageURLs}
          selectedImage={selectedImage}
          onSelectImage={handleSelectImage}
        />
      </div>
    )
  }

  if (workImageURL) {
    return (
      <img
        className="w-auto h-auto xl:h-screen object-contain rounded"
        alt=""
        src={workImageURL}
      />
    )
  }

  return null
}
