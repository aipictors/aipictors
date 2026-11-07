import { useEffect, useRef, useState } from "react"
import { Link } from "~/lib/app/locale-router"

interface TabItem {
  label: string
  value: string
  /**
   * ラベルの横に出す小さな印（新着の数など）
   */
  badge?: React.ReactNode
  /**
   * リンク先。あればリンク（a 要素）にする（検索エンジンがたどれる・新しいタブで開ける）
   */
  href?: string
}

interface AnimatedTabsProps {
  tabs: TabItem[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function AppAnimatedTabs({
  tabs,
  value,
  onChange,
  className = "",
}: AnimatedTabsProps): React.ReactNode {
  const selectedIndex = tabs.findIndex((tab) => tab.value === value)
  const tabRefs = useRef<(HTMLElement | null)[]>([])
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const current = tabRefs.current[selectedIndex]
    if (current) {
      setIndicatorStyle({
        left: current.offsetLeft,
        width: current.offsetWidth,
      })
    }
  }, [selectedIndex])

  const handleHover = (index: number) => {
    const el = tabRefs.current[index]
    if (el) {
      setIndicatorStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
      })
    }
  }

  const resetIndicator = () => {
    const current = tabRefs.current[selectedIndex]
    if (current) {
      setIndicatorStyle({
        left: current.offsetLeft,
        width: current.offsetWidth,
      })
    }
  }

  return (
    <div
      className={`relative w-full cursor-pointer overflow-x-auto border-border border-b ${className}`}
    >
      <div className="relative flex space-x-6">
        {tabs.map((tab, i) => {
          const setTabRef = (el: HTMLElement | null) => {
            tabRefs.current[i] = el
          }
          const className = `cursor-pointer whitespace-nowrap pb-3 font-medium text-sm transition-colors duration-300 ${
            value === tab.value
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`
          if (tab.href) {
            return (
              <Link
                key={tab.value}
                ref={setTabRef}
                to={tab.href}
                prefetch="intent"
                aria-current={value === tab.value ? "page" : undefined}
                onMouseEnter={() => handleHover(i)}
                onMouseLeave={resetIndicator}
                className={className}
              >
                {tab.label}
                {tab.badge}
              </Link>
            )
          }
          return (
            <button
              key={tab.value}
              ref={setTabRef}
              type="button"
              onClick={() => onChange(tab.value)}
              onMouseEnter={() => handleHover(i)}
              onMouseLeave={resetIndicator}
              className={className}
            >
              {tab.label}
              {tab.badge}
            </button>
          )
        })}
        {/* 固定アニメーション下線 */}
        <div
          className="absolute bottom-0 h-0.5 bg-foreground transition-all duration-300"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
        />
      </div>
    </div>
  )
}
