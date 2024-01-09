import { useEffect, useRef } from "react"

const XIntentButton = ({ text }) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const handleXIntent = () => {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text,
      )}`
      window.open(url, "_blank", "width=600,height=300")
    }

    const button = buttonRef.current

    if (button) {
      button.addEventListener("click", handleXIntent)

      return () => {
        button.removeEventListener("click", handleXIntent)
      }
    }
  }, [text])

  return (
    <button ref={buttonRef} type="button">
      {" "}
      {/* Explicitly set type to "button" */}
      Tweet
    </button>
  )
}

export default XIntentButton
