import type { Metadata } from "next"

/**
 * 設定
 * @returns
 */
const SettingsPage = async () => {
  return null
}

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    robots: { index: false },
    title: { absolute: "Aipictors+" },
  }
}

export default SettingsPage
