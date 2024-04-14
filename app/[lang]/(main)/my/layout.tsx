import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { LoginPage } from "@/_components/page/login-page"
import { AuthContext } from "@/_contexts/auth-context"
import { useContext } from "react"

type Props = {
  children: React.ReactNode
}

const MyLayout = (props: Props) => {
  const context = useContext(AuthContext)

  if (context.isLoading) {
    return <AppLoadingPage />
  }

  if (context.isNotLoggedIn) {
    return <LoginPage />
  }

  return <>{props.children}</>
}

export default MyLayout
