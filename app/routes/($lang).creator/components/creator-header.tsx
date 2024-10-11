import { Link } from "react-router"
import { useContext } from "react"
import { HomeIcon } from "~/components/home-icon"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { LogoutDialogButton } from "~/components/logout-dialog-button"
import { AuthContext } from "~/contexts/auth-context"

export function CreatorHeader() {
  const authContext = useContext(AuthContext)

  return (
    <>
      <header className="fixed z-50 w-full bg-card">
        <div
          className={
            "container-shadcn-ui flex w-full items-center justify-between gap-x-4 py-4"
          }
        >
          <div className="flex items-center gap-x-4">
            <HomeIcon />
            <Link className="items-center space-x-2 md:flex" to="/creator">
              <h1 className="font-bold">{"支援リクエスト"}</h1>
            </Link>
          </div>
          <div className="flex gap-x-2">
            {authContext.isNotLoggedIn && <LoginDialogButton />}
            {authContext.isLoggedIn && <LogoutDialogButton />}
          </div>
        </div>
      </header>
      <div className={"h-header"} />
    </>
  )
}
