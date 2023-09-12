import { Metadata } from "next"
import { MainModels } from "app/models/components/MainModels"

const SettingModelsPage = async () => {
  return <MainModels />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SettingModelsPage
