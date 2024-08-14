import { type ReactNode, useState } from "react"

type Props = {
  trigger: ReactNode
  children: ReactNode
  maxHeight?: string
  initialOpen?: boolean
}

export function ToggleContent({
  trigger,
  children,
  maxHeight = "480px",
  initialOpen = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [contentHeight, setContentHeight] = useState(isOpen ? maxHeight : "0px")
  const [contentOpacity, setContentOpacity] = useState(isOpen ? 1 : 0)

  const toggleContent = () => {
    if (isOpen) {
      setContentHeight("0px")
      setContentOpacity(0)
    } else {
      setContentHeight(maxHeight)
      setContentOpacity(1)
    }
    setIsOpen(!isOpen)
  }

  return (
    <div>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div onClick={toggleContent} style={{ cursor: "pointer" }}>
        {trigger}
      </div>
      <div
        style={{
          maxHeight: contentHeight,
          overflow: "hidden",
          transition: "max-height 0.3s ease-out, opacity 0.3s ease-out",
          opacity: contentOpacity,
        }}
      >
        {children}
      </div>
    </div>
  )
}
