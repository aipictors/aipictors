import { Button } from "~/components/ui/button"
import { RiRestartLine } from "@remixicon/react"
import { type AuthProvider, getAuth, signInWithPopup } from "firebase/auth"
import type { ReactElement } from "react"
import { toast } from "sonner"
import { graphql } from "gql.tada"
import { useMutation } from "@apollo/client/index"
import { useNavigate } from "@remix-run/react"

type Props = {
  disabled: boolean
  provider: AuthProvider
  buttonText?: string | null
  icon?: ReactElement
}

/**
 * ソーシャルログインボタン
 * Googleでログインするなど
 */
export function SocialLoginButton(props: Props) {
  const [isInitializedUserProfile] = useMutation(
    isInitializedUserProfileMutation,
  )

  const navigate = useNavigate()

  const onLogin = async () => {
    if (props.disabled) return

    try {
      await signInWithPopup(getAuth(), props.provider)

      // ユーザ設定有無チェック
      const isInitializedUserProfileRet = await isInitializedUserProfile()

      if (
        isInitializedUserProfileRet.data &&
        !isInitializedUserProfileRet.data.isInitializedUserProfile
      ) {
        // 存在しない場合はユーザ設定作成画面へ遷移
        navigate("/new/profile")
      }
    } catch (error) {
      console.log(error)
      if (error instanceof Error) {
        toast("アカウントが見つかりませんでした")
      }
    }
  }

  return (
    <Button
      className="relative flex w-full items-center justify-center"
      onClick={onLogin}
      disabled={props.disabled}
    >
      <div className="absolute left-4">
        {props.disabled ? (
          <RiRestartLine className="mr-2 size-4 animate-spin" />
        ) : (
          props.icon
        )}
      </div>
      {props.buttonText}
    </Button>
  )
}

const isInitializedUserProfileMutation = graphql(
  `mutation IsInitializedUserProfile {
    isInitializedUserProfile
  }`,
)
