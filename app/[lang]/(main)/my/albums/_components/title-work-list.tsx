"use client"

import { TitleWorkCard } from "@/app/[lang]/(main)/my/albums/_components/title-work-card"

export const TitleWorkList = () => {
  return (
    <div className="flex">
      <TitleWorkCard />
      <TitleWorkCard />
      <TitleWorkCard />
      <TitleWorkCard />
    </div>
  )
}
