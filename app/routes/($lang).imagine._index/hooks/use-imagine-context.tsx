import { createContext, useContext } from "react"

type ImagineContextType = {
  changeCurrentUserToken: (token: string) => void
  resetImageInputSetting: () => void
}

const ImagineContext = createContext<ImagineContextType | undefined>(undefined)

export function useImagineContext () {
  const context = useContext(ImagineContext)
  if (context === undefined) {
    throw new Error("useImagineContext must be used within an ImagineProvider")
  }
  return context
}

export { ImagineContext }
