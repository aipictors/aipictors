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
    <nav className="-ml-3 sticky top-header hidden h-main w-48 min-w-48 overflow-y-auto pb-4 md:block">
      <div className="pb-4">{props.children}</div>
    </nav>
  )
}
