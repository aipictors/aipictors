import type React from "react"
import { useState, useRef, useEffect } from "react"

type Props = {
  triggerChildren: React.ReactNode
  children: React.ReactNode
  oneTimeExpand?: boolean // 一度切りの展開フラグ
}

export const ExpansionTransition = (props: Props) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [hasExpanded, setHasExpanded] = useState(false) // 追加: 展開済みフラグ
  const [maxHeight, setMaxHeight] = useState("0px")
  const [opacity, setOpacity] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isFilterOpen && contentRef.current) {
      setMaxHeight(`${contentRef.current.scrollHeight}px`)
      setOpacity(1)
      if (props.oneTimeExpand) {
        setHasExpanded(true)
      }
    } else {
      setMaxHeight("0px")
      setOpacity(0)
    }
  }, [isFilterOpen, props.oneTimeExpand])

  const onToggleFilterButton = () => {
    if (!hasExpanded || !props.oneTimeExpand) {
      setIsFilterOpen(!isFilterOpen)
    }
  }

  return (
    <>
      {!hasExpanded && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <div onClick={onToggleFilterButton}>{props.triggerChildren}</div>
      )}
      <div
        ref={contentRef}
        style={{
          maxHeight: maxHeight,
          opacity: opacity,
          overflow: "hidden",
          transition: "max-height 0.5s ease, opacity 0.5s ease",
        }}
      >
        {props.children}
      </div>
    </>
  )
}
