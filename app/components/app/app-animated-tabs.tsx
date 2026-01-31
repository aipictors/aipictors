import { useState, useRef, useEffect } from "react"

export interface TabItem {
  label: string
  value: string
}

interface AnimatedTabsProps {
  tabs: TabItem[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function AppAnimatedTabs ({
  tabs,
  value,
  onChange,
  className = "",
}: AnimatedTabsProps): React.ReactNode {
  const selectedIndex = tabs.findIndex((tab) => tab.value === value)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
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
          const setTabRef = (el: HTMLButtonElement | null) => {
            tabRefs.current[i] = el
          }
          return (
            <button
              key={tab.value}
              ref={setTabRef}
              type="button"
              onClick={() => onChange(tab.value)}
              onMouseEnter={() => handleHover(i)}
              onMouseLeave={resetIndicator}
              className={`cursor-pointer whitespace-nowrap pb-3 font-medium text-sm transition-colors duration-300 ${
                value === tab.value
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
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
