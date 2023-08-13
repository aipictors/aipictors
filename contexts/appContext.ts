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
      isNotLoggedIn: true
      currentUser: null
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
      refresh(): Promise<void>
    }

export const AppContext = createContext<Value>({
  isLoading: true,
  isNotLoading: false,
  isLoggedIn: false,
  isNotLoggedIn: true,
  currentUser: null,
  async refresh() {},
})
