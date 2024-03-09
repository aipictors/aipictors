import { AppCanvas } from "@/app/[lang]/app/_components/app-canvas"
import Image from "next/image"
import Link from "next/link"

export const AppAboutHeader = () => {
  return (
    <div className="relative mx-auto w-full px-4 pb-32">
      <div className="absolute inset-0 top-[-8%] z-[-1] h-full w-full opacity-20">
        <AppCanvas />
      </div>
      <div className="relative flex justify-center py-16">
        <Image
          src="/icon.svg"
          alt="icon"
          className="w-16"
          width={64}
          height={64}
        />
      </div>
      <div className="space-y-8">
        <div className="flex justify-center">
          <div className="w-full max-w-md space-y-4">
            <p className="text-center font-bold text-3xl">
              {"Aipictorsのアプリが登場"}
            </p>
            <p className="leading-relaxed">
              {
                "AIイラスト投稿サイト「Aipictors」のSNS機能がアプリになりました。アプリならどこにいても通知を受け取ったりフォローしているクリエーターの作品をチェックできます。"
              }
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center space-x-8">
          <Link href="https://apps.apple.com/jp/app/aipictors-ai%E3%83%94%E3%82%AF%E3%82%BF%E3%83%BC%E3%82%BA/id6466581636">
            <img src="/apple/download.svg" alt="download" className="h-12" />
          </Link>
          <Link href="https://play.google.com/store/apps/details?id=com.aipictors.app&hl=ja">
            <img src="/google/download.png" alt="download" className="h-16" />
          </Link>
        </div>
      </div>
    </div>
  )
}
