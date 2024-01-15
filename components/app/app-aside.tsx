type Props = {
  children: React.ReactNode
}

/**
 * ナビゲーション
 * ヘッダーのアイコンと同じ位置になるように左に余白を追加してます
 * @param props
 * @returns
 */
export const AppAside = (props: Props) => {
  return (
    <nav
      className="sticky overflow-y-auto pl-5 hidden md:block"
      style={{
        top: "72px",
        height: "calc(100svh - 72px)",
        width: "12rem",
        minWidth: "12rem",
      }}
    >
      <div className="pb-4">{props.children}</div>
    </nav>
  )
}
