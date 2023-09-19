import type { User } from "firebase/auth"
import { createContext } from "react"

type Value =
  /**
   * 読み込み中
   */
  | {
      isLoading: true
      isNotLoading: false
      isLoggedIn: false
      isNotLoggedIn: false
      currentUser: null
      userId: null
      refresh(): Promise<void>
    }
  /**
   * 未ログイン
   */
  | {
      isLoading: false
      isNotLoading: true
      isLoggedIn: false
      isNotLoggedIn: true
      currentUser: null
      userId: null
      refresh(): Promise<void>
    }
  /**
   * ログイン済み
   */
  | {
      isLoading: false
      isNotLoading: true
      isLoggedIn: true
      isNotLoggedIn: false
      currentUser: User
      userId: string
      refresh(): Promise<void>
    }

export const AppContext = createContext<Value>({
  isLoading: true,
  isNotLoading: false,
  isLoggedIn: false,
  isNotLoggedIn: false,
  currentUser: null,
  userId: null,
  async refresh() {},
})
