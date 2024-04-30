import { Button } from "@/_components/ui/button"
import { RiRestartLine } from "@remixicon/react"
import { type AuthProvider, getAuth, signInWithPopup } from "firebase/auth"
import type { ReactElement } from "react"
import { toast } from "sonner"

type Props = {
  disabled: boolean
  provider: AuthProvider
  buttonText?: string | null
  icon?: ReactElement
}

/**
 * ソーシャルログインボタン
 * Googleでログインするなど
 * @param props
 * @returns
 */
export const SocialLoginButton = (props: Props) => {
  const onLogin = async () => {
    if (props.disabled) return

    try {
      await signInWithPopup(getAuth(), props.provider)
    } catch (error) {
      // captureException(error)
      if (error instanceof Error) {
        toast("アカウントが見つかりませんでした")
      }
    }
  }

  return (
    <Button
      className="flex w-full items-center justify-center"
      onClick={onLogin}
      disabled={props.disabled}
    >
      {props.disabled ? (
        <RiRestartLine className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        props.icon
      )}
      {props.buttonText}
    </Button>
  )
}
