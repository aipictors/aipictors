/**
 * ホームのイベントバナー
 */
export const HomeEventBanner = () => {
  return (
    <div className="flex w-full items-center overflow-hidden rounded-md">
      <div className="m-auto ml-2">
        <p className="font-semibold text-lg">AI IDOL PROJECT</p>
        <p className="font-semibold text-sm">
          AI IDOLプロジェクトを応援してみよう！
        </p>
        <a href="https://beta.aipictors.com/events/ai-idol-project">
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button className="m-auto mt-2 mb-2 w-32 rounded-full bg-blue-500 px-4 py-1 text-white">
            詳細
          </button>
        </a>
      </div>
      <div className="ml-4 h-32 w-96 overflow-hidden">
        <img
          src={
            "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/idolaipicheader.jpg"
          }
          alt="Event Banner"
          className="h-32 w-96 object-cover transition-all hover:scale-110"
        />
      </div>
    </div>
  )
}
