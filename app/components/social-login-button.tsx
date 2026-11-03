import { useMutation } from "@apollo/client/index"
import { useNavigate } from "~/lib/app/locale-router"
import {
  type AuthProvider,
  browserPopupRedirectResolver,
  getAuth,
  signInWithPopup,
} from "firebase/auth"
import { graphql } from "gql.tada"
import { Loader2Icon } from "lucide-react"
import { type ReactElement, useState } from "react"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import {
  type LoginMethod,
  toSocialLoginErrorMessage,
  writeLastLoginMethod,
} from "~/utils/login-flow"

type Props = {
  disabled: boolean
  provider: AuthProvider
  method: LoginMethod
  buttonText?: string | null
  icon?: ReactElement
  /** 前回使った方法の目印 */
  badge?: React.ReactNode
  /** 失敗したときの文（新しく試すときは null） */
  onError?: (message: string | null) => void
}

/**
 * ソーシャルログインボタン
 * Googleでログインするなど
 */
export function SocialLoginButton(props: Props): React.ReactNode {
  const t = useTranslation()
  const [isInitializedUserProfile] = useMutation(
    isInitializedUserProfileMutation,
  )
  const [isSigningIn, setIsSigningIn] = useState(false)

  const navigate = useNavigate()

  const onLogin = async () => {
    if (props.disabled || isSigningIn) return

    props.onError?.(null)
    setIsSigningIn(true)

    try {
      await signInWithPopup(
        getAuth(),
        props.provider,
        browserPopupRedirectResolver,
      )
    } catch (error) {
      setIsSigningIn(false)
      props.onError?.(toSocialLoginErrorMessage(error, t))
      return
    }

    writeLastLoginMethod(props.method)

    // ここから先の失敗はログイン自体の失敗ではない（確認できなければ今のページのまま）
    try {
      const result = await isInitializedUserProfile()
      if (result.data && !result.data.isInitializedUserProfile) {
        navigate("/new/profile")
      }
    } catch (error) {
      console.warn("Failed to check the user profile:", error)
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <Button
      type="button"
      className="relative flex h-12 w-full items-center justify-center rounded-xl font-semibold"
      variant="outline"
      onClick={onLogin}
      disabled={props.disabled || isSigningIn}
    >
      <span className="absolute left-4 flex size-5 items-center justify-center">
        {isSigningIn ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          props.icon
        )}
      </span>
      {props.buttonText}
      {props.badge && <span className="absolute right-3">{props.badge}</span>}
    </Button>
  )
}

const isInitializedUserProfileMutation = graphql(
  `mutation IsInitializedUserProfile {
    isInitializedUserProfile
  }`,
)
