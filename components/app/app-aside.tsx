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
    <nav className="top-20 hidden h-screen w-48 min-w-48 overflow-y-auto pb-[72px] pl-5 file:sticky md:block">
      <div className="pb-4">{props.children}</div>
    </nav>
  )
}
