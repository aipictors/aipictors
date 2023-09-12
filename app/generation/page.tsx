import { Metadata } from "next"
import { MainGeneration } from "app/generation/components/MainGeneration"

const SettingGenerationPage = async () => {
  return <MainGeneration />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SettingGenerationPage
