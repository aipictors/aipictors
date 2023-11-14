import { AppCanvas } from "@/app/[lang]/app/_components/app-canvas"

export const AppAboutHeader = () => {
  return (
    <div className="px-4 w-full max-w-container-xl mx-auto pb-32 relative">
      <div className="absolute inset-0 z-[-1] w-full h-full opacity-20 top-[-8%]">
        <AppCanvas />
      </div>
      <div className="flex justify-center py-16 relative">
        <img src="/icon.png" alt="icon" className="w-16" />
      </div>
      <div className="space-y-8">
        <div className="flex justify-center">
          <div className="w-full max-w-md space-y-4">
            <p className="font-bold text-3xl text-center">
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
          <img src="/apple/download.svg" alt="download" className="h-12" />
          <a
            href={
              "https://play.google.com/store/apps/details?id=com.aipictors.app&hl=ja"
            }
          >
            <img src="/google/download.png" alt="download" className="h-16" />
          </a>
        </div>
      </div>
    </div>
  )
}
