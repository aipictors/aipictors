/**
 * 画像をダウンロードする
 * @param imageURL 画像ファイルのURL
 */
export const downloadImageFileFromUrl = (imageURL: string): void => {
  // Imageオブジェクトを作成
  const img = new Image()
  img.crossOrigin = "Anonymous" // CORSポリシーに対応するための設定

  // 画像が読み込まれた後の処理
  img.onload = () => {
    // canvas要素を作成
    const canvas = document.createElement("canvas")
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext("2d")

    // canvasに画像を描画
    ctx?.drawImage(img, 0, 0)

    // canvasの内容をdata URLとして取得
    const dataUrl = canvas.toDataURL("image/png")

    // ダウンロードリンクを作成
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = imageURL.split("/").pop() ?? "downloaded_image" // URLからファイル名を抽出、またはデフォルト名を設定
    document.body.appendChild(a)
    a.click() // リンクをクリックしてダウンロード

    // リソースの後片付け
    document.body.removeChild(a)
  }

  // 画像読み込み開始
  img.src = imageURL
}
