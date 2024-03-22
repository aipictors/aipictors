"use client"

import { GlowingGradientBorderButton } from "@/app/_components/button/glowing-gradient-border-button"

export const GenerationAbout = () => {

  return (
    <main className="flex w-full justify-center">
      <div className="w-full max-w-[30rem] space-y-8 p-4">
        <p className="font-bold text-2xl">{"画像生成"}</p>
        <p>画像生成機能について</p>
        <GlowingGradientBorderButton 
        className={"w-full"}
        onClick={()=>{}}
        children={
        "生成"
        } />
      </div>
    </main>
  )
}
