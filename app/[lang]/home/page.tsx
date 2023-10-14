import { MainHome } from "app/[lang]/home/components/MainHome"
import type { Metadata } from "next"

const HomePage = async () => {
  return <MainHome />
}

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    robots: { index: false },
    title: { absolute: "ログイン" },
  }
}

export const revalidate = 3600

export default HomePage
