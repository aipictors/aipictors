import { Config } from "@/config"
import { useEffect, useState } from "react"

export const useNavigation = () => {
  const [flag, setFlag] = useState(true)

  useEffect(() => {
    if (Config.isNotClient) return
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
