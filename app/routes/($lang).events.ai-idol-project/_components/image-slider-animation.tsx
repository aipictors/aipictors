import type { CSSProperties } from "react"

type Props = {
  imageURLs?: string[]
  displayDuration?: number // 新しい変数で表示時間を指定
}

export function ImageSliderAnimation(props: Props) {
  if (!props.imageURLs || props.imageURLs.length === 0) {
    return null
  }

  const { imageURLs, displayDuration = 10 } = props // デフォルトの表示時間を10秒に設定

  const imageStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    opacity: 0,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center top",
    animation: `imageSwitchAnimation ${
      displayDuration * imageURLs.length
    }s infinite`, // 全体のアニメーション時間を計算
  }

  const keyframesStyle = `
    @keyframes imageSwitchAnimation {
      0%, ${(100 / imageURLs.length) * 0.4}% { opacity: 0; transform: scale(1); filter: blur(5); }
      ${(100 / imageURLs.length) * 0.4}%, ${(100 / imageURLs.length) * 0.8}% { opacity: 1; transform: scale(0.9); filter: blur(0px); }
      ${(100 / imageURLs.length) * 0.8}%, 100% { opacity: 0; transform: scale(0.9); filter: blur(5px); }
    }
  `

  const dotsOverlayStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    opacity: 0.5,
    width: "100%",
    height: "100%",
    backgroundImage:
      "url(https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/dot-4.png)",
    backgroundRepeat: "repeat",
  }

  return (
    <>
      <style>{keyframesStyle}</style>
      <div className="relative m-auto my-4 h-[400px] max-h-[800px] w-auto max-w-[1600px] rounded-md border-gray-500 border-solid p-0">
        {imageURLs.map((url, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={index}
            style={{
              ...imageStyle,
              backgroundImage: `url(${url})`,
              animationDelay: `${index * displayDuration}s`, // 各画像の表示タイミングを計算
            }}
          />
        ))}
        <div style={dotsOverlayStyle} />
      </div>
    </>
  )
}
