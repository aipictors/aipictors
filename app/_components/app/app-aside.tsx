type Props = Readonly<{
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
}>

/**
 * ナビゲーション
 * ヘッダーのアイコンと同じ位置になるように左に余白を追加してます
 */

export function AppAside(props: Props) {
  return props.isOpen ? (
    <div className="fixed top-header hidden md:block">
      <aside>{props.children}</aside>
    </div>
  ) : null
}
