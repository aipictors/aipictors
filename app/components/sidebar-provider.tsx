import { useState, useEffect, type ReactNode } from "react"
import { SidebarContext } from "~/contexts/sidebar-context"

type SidebarState = "expanded" | "collapsed" | "minimal"

type Props = {
  children: ReactNode
}

export function SidebarProvider({ children }: Props) {
  const [sidebarState, setSidebarState] = useState<SidebarState>("expanded") // デフォルトを展開状態に変更

  // レスポンシブ対応: 画面サイズに応じて初期状態を設定
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      // PC版（1024px以上）では常に表示
      if (width >= 1024) {
        // デスクトップサイズではlocalStorageから復元、デフォルトは展開状態
        const savedState = localStorage.getItem("sidebar-state") as SidebarState
        setSidebarState(savedState || "expanded")
      }
      // タブレットサイズ（768px-1024px）では省略状態をデフォルトにする
      else if (width >= 768 && width < 1024) {
        setSidebarState("collapsed")
      }
    }

    // 初期化時に実行
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // サイドバー状態をlocalStorageに保存
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-state", sidebarState)
    }
  }, [sidebarState])

  const toggleSidebar = () => {
    setSidebarState((prevState) => {
      switch (prevState) {
        case "expanded":
          return "collapsed"
        case "collapsed":
          return "expanded"
        case "minimal":
          return "expanded"
        default:
          return "expanded"
      }
    })
  }

  const minimizeSidebar = () => {
    setSidebarState("minimal")
  }

  return (
    <SidebarContext.Provider
      value={{
        sidebarState,
        setSidebarState,
        toggleSidebar,
        minimizeSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}
