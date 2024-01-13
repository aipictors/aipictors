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
      userId: null
      login: null
      displayName: null
      avatarPhotoURL: null
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
      userId: null
      login: null
      displayName: null
      avatarPhotoURL: null
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
      userId: string
      login: string
      displayName: string
      avatarPhotoURL: string | null
      refresh(): Promise<void>
    }

const defaultValue: Value = {
  isLoading: true,
  isNotLoading: false,
  isLoggedIn: false,
  isNotLoggedIn: false,
  userId: null,
  login: null,
  displayName: null,
  avatarPhotoURL: null,
  async refresh() {},
}

export const AuthContext = createContext<Value>(defaultValue)
