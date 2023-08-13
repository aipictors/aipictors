import type { Metadata } from "next"
import { MainLogin } from "app/login/components/MainLogin"

const LoginPage = async () => {
  return <MainLogin />
}

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    robots: { index: false },
    title: { absolute: "ログイン" },
  }
}

export const revalidate = 3600

export default LoginPage
