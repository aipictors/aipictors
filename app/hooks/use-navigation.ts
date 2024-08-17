import { useEffect, useState } from "react"

export function useNavigation() {
  const [flag, setFlag] = useState(true)

  useEffect(() => {
    if (typeof document === "undefined") return
    const handleResize = () => {
      setFlag(800 < window.innerWidth)
    }
    window.addEventListener("resize", handleResize)
    handleResize()
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const open = () => {
    setFlag(!flag)
  }

  return [flag, open] as const
}
