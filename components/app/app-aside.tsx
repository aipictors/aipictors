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
    <nav className="pl-5 sticky overflow-y-auto hidden md:block top-20 h-screen pb-[72px] min-w-48 w-48">
      <div className="pb-4">{props.children}</div>
    </nav>
  )
}
