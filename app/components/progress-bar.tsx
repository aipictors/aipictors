import { useNavigation } from "@remix-run/react"

/**
 * プログレスバー
 */
export function ProgressBar (): React.ReactNode {
  const navigation = useNavigation()

  if (navigation.state !== "loading") {
    return null
  }

  const postDiverAnimation = `
  @keyframes postDiverAnimation {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`

  const progressInAnimation = `
  @keyframes progressInAnimation {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }
`

  const keyframesStyle = `
  ${postDiverAnimation}
  ${progressInAnimation}
`

  return (
    <>
      <style>{keyframesStyle}</style>
      {/* biome-ignore lint/style/useSelfClosingElements: Intentional (JSX kept explicit) */}
      <div
        className="fixed top-0 left-0 z-100 w-full shadow-md"
        style={{
          right: 0,
          zIndex: 100,
          height: "2px",
          background: "#0090f0",
          width: "100%",
          backgroundSize: "200% 200%",
          animation:
            "postDiverAnimation 2s linear infinite, progressInAnimation 1s ease-in-out",
        }}
      ></div>
    </>
  )
}
