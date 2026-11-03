import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { useMutation, useQuery } from "@apollo/client/index"
import {
  browserPopupRedirectResolver,
  GoogleAuthProvider,
  getAuth,
  linkWithPopup,
} from "firebase/auth"
import { RiGoogleFill } from "@remixicon/react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { LineLoggedInButton } from "~/components/button/line-logged-in-button"
import { PlusUpsellCard } from "~/components/plus-upsell-card"
import { Link } from "~/lib/app/locale-router"
import { graphql } from "gql.tada"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  isOpen: boolean
  onClose(): void
  verificationResult?: string | null
}

/**
 * 認証ダイアログ
 */
/**
 * Google アカウントで本人確認する（LINE を使っていない海外の人も無料生成を続けられる）
 */
function GoogleVerificationButton() {
  const t = useTranslation()
  const [isVerifying, setIsVerifying] = useState(false)
  const [verify] = useMutation(verifyAccountWithGoogleMutation)

  const onClick = async () => {
    const user = getAuth().currentUser
    if (user === null || isVerifying) return
    setIsVerifying(true)
    try {
      if (!user.providerData.some((item) => item.providerId === "google.com")) {
        await linkWithPopup(
          user,
          new GoogleAuthProvider(),
          browserPopupRedirectResolver,
        )
      }
      // 連携した Google の情報をトークンに反映してから確認する
      await user.getIdToken(true)
      await verify()
      window.location.href = `${window.location.pathname}?result=verification`
    } catch (error) {
      const code = (error as { code?: string }).code
      if (code === "auth/popup-closed-by-user") {
        // 閉じただけ
      } else if (
        code === "auth/credential-already-in-use" ||
        code === "auth/email-already-in-use"
      ) {
        toast.error(
          t(
            "この Google アカウントは別のアカウントで使われています。別の Google アカウントか LINE をお試しください。",
            "This Google account is already used by another account. Please try another Google account or LINE.",
          ),
        )
      } else {
        toast.error(
          error instanceof Error && !code
            ? error.message
            : t(
                "本人確認できませんでした。しばらくしてからお試しください。",
                "Could not verify your account. Please try again later.",
              ),
        )
      }
      setIsVerifying(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isVerifying}
      onClick={() => void onClick()}
      className="mt-2 h-12 w-full rounded-xl font-bold"
    >
      <RiGoogleFill className="mr-2 size-5" />
      {t("Google で本人確認", "Verify with Google")}
    </Button>
  )
}

export function VerificationDialog (props: Props): React.ReactNode {
  const t = useTranslation()

  const authContext = useContext(AuthContext)

  const { data: verificationUrlRet, refetch: verificationUrlRefetch } =
    useQuery(verificationUrlQuery, {
      skip: authContext.isLoading || authContext.isNotLoggedIn,
    })

  const verificationUrl = verificationUrlRet?.viewer?.verificationUrl

  const [showVerificationResult, setShowVerificationResult] = useState(false)

  useEffect(() => {
    if (
      props.verificationResult === "verification" ||
      props.verificationResult === "verification_error"
    ) {
      setShowVerificationResult(true)
    }
  }, [])

  return (
    <>
      <Dialog
        open={props.isOpen || showVerificationResult}
        onOpenChange={() => {
          props.onClose()
          setShowVerificationResult(false)
          if (
            props.verificationResult === "verification_error" ||
            props.verificationResult === "verification"
          ) {
            // URLパラメータを削除
            if (window) {
              window.location.href = "/generation"
            }
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("認証案内", "Verification Guide")}</DialogTitle>
            {props.verificationResult === "verification" && (
              <>
                <p>
                  {t("認証が完了いたしました。", "Verification completed.")}
                </p>
                <p>
                  {t(
                    "毎日無料10枚生成が解放されました。",
                    "You have unlocked 10 free generations per day.",
                  )}
                </p>
              </>
            )}
            {props.verificationResult === "verification_error" && (
              <>
                <p>{t("認証が失敗いたしました。", "Verification failed.")}</p>
                <p>
                  {t(
                    "しばらくしてから再度お試しください。",
                    "Please try again later.",
                  )}
                </p>
                <GoogleVerificationButton />
                <Link
                  to={verificationUrl ?? ""}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <div className="mt-2 mb-2">
                    <LineLoggedInButton
                      onClick={() => {}}
                      text={t(
                        "LINE で本人確認",
                        "Verify with LINE",
                      )}
                    />
                  </div>
                </Link>
                <p>
                  {t(
                    "Aipictors+に加入する場合は認証不要です。",
                    "Verification is not required if you join Aipictors+.",
                  )}
                </p>
                <PlusUpsellCard />
              </>
            )}
            {!props.verificationResult && (
              <>
                <p className="text-left text-md">
                  {t(
                    "お試しプランの生成が終了いたしました。",
                    "The free trial has ended.",
                  )}
                </p>
                <p className="text-left text-md">
                  {t(
                    "本人確認で毎日無料で10枚生成可能です。",
                    "With verification, you can generate 10 free works daily.",
                  )}
                </p>
                <p className="text-left text-sm">
                  {t(
                    "認証情報は本人確認のみに使用し、他の用途では一切使用されません。",
                    "Verification information is used only for identity confirmation and will not be used for any other purpose.",
                  )}
                </p>
                <GoogleVerificationButton />
                <Link
                  to={verificationUrl ?? ""}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <div className="mt-2 mb-2">
                    <LineLoggedInButton
                      onClick={() => {}}
                      text={t(
                        "LINE で本人確認",
                        "Verify with LINE",
                      )}
                    />
                  </div>
                </Link>
                <p className="text-left">
                  {t(
                    "Aipictors+に加入する場合は認証不要です。",
                    "Verification is not required if you join Aipictors+.",
                  )}
                </p>
                <PlusUpsellCard />
              </>
            )}
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}

const verifyAccountWithGoogleMutation = graphql(
  `mutation VerifyAccountWithGoogle {
    verifyAccountWithGoogle
  }`,
)

const verificationUrlQuery = graphql(
  `query VerificationUrl {
    viewer {
      id
      verificationUrl
    }
  }`,
)
