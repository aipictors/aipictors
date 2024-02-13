type Props = {
  children: React.ReactNode
}

/**
 * ナビゲーション
 * ヘッダーのアイコンと同じ位置になるように左に余白（-ml-3）を追加してます
 * @param props
 * @returns
 */
export const AppAside = (props: Props) => {
  return (
    <nav className="-ml-3 sticky overflow-y-auto hidden md:block top-18 h-screen pb-[72px] min-w-48 w-48">
      <div className="pb-4">{props.children}</div>
    </nav>
  )
}
