"use client"

const RootNotFound = () => {
  return (
    <div className="p-4 h-screen flex justify-center items-center">
      <div className="space-y-8 items-center">
        <p>ページが見つかりません</p>
        <div className="flex">
          <a href="/" className="line-height[1]">
            ホームに戻る
          </a>
        </div>
      </div>
    </div>
  )
}

export default RootNotFound
