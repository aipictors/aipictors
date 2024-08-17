/**
 * ホームのイベントバナー
 */
export function HomeEventBanner() {
  const onClick = () => {
    if (window) {
      window.location.href = "https://www.aipictors.com/events/mizugi2024/"
    }
  }

  return (
    <div className="flex w-full items-center overflow-hidden rounded-md border p-4">
      <div className="m-auto ml-2">
        <p className="font-semibold text-lg">水着企画</p>
        <p className="font-semibold text-sm">
          水着をテーマの作品を投稿してみましょう！
        </p>
        <button
          type={"button"}
          className="m-auto mt-2 mb-2 w-32 rounded-full bg-blue-500 px-4 py-1 text-white"
          onClick={onClick}
        >
          詳細
        </button>
      </div>
      <button
        type={"button"}
        onClick={onClick}
        className="ml-4 h-32 w-96 overflow-hidden rounded"
      >
        <img
          src={"https://assets.aipictors.com/event-mizugi-2024.webp"}
          alt="Event Banner"
          className="h-32 w-96 object-cover transition-all hover:scale-110"
        />
      </button>
    </div>
  )
}
