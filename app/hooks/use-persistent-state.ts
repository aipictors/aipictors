import { useEffect, useState } from "react"

type Storage = "localStorage" | "sessionStorage"

/**
 * 状態をローカルストレージまたはセッションストレージに永続化するフック
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  storage: Storage = "localStorage",
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(defaultValue)
  const [isInitialized, setIsInitialized] = useState(false)

  // クライアントサイドでの初期化
  useEffect(() => {
    if (typeof window === "undefined" || isInitialized) return

    try {
      const storedValue = window[storage].getItem(key)
      if (storedValue !== null) {
        const parsedValue = JSON.parse(storedValue)
        setState(parsedValue)
      }
    } catch (error) {
      console.warn(`Error reading ${storage} key "${key}":`, error)
    }

    setIsInitialized(true)
  }, [key, storage, defaultValue, isInitialized])

  const setValue = (value: T) => {
    try {
      setState(value)
      if (typeof window !== "undefined") {
        const jsonValue = JSON.stringify(value)
        window[storage].setItem(key, jsonValue)
      }
    } catch (error) {
      console.warn(`Error setting ${storage} key "${key}":`, error)
    }
  }

  // ストレージが他のタブで変更された場合の同期
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          const parsedValue = JSON.parse(event.newValue)
          setState(parsedValue)
        } catch (error) {
          console.warn(`Error parsing storage value for key "${key}":`, error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [key])

  return [state, setValue]
}
