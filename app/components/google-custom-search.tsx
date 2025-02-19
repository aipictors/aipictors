import { useEffect } from "react"

export const GoogleCustomSearch = () => {
  useEffect(() => {
    // Google カスタム検索エンジンのスクリプトタグを作成
    const script = document.createElement("script")
    script.src = "https://cse.google.com/cse.js?cx=f3bf7a847d0b7417a"
    script.async = true
    document.body.appendChild(script)

    // クリーンアップ: コンポーネントのアンマウント時にスクリプトを削除
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div>
      {/* Google CSE がレンダリングする検索ボックス */}
      <div className="gcse-search" />
    </div>
  )
}
