import type { Metadata } from "next"

/**
 * 設定
 * @returns
 */
const SettingsPage: React.FC = async () => {
  return null
}

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    robots: { index: false },
    title: { absolute: "Aipictors+" },
  }
}

export const revalidate = 240

export default SettingsPage
