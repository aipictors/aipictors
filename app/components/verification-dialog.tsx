import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { useQuery } from "@apollo/client/index"
import { useEffect, useState } from "react"
import { LineLoggedInButton } from "~/components/button/line-logged-in-button"
import { Link } from "@remix-run/react"
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
export function VerificationDialog(props: Props) {
  const t = useTranslation()

  const { data: verificationUrlRet, refetch: verificationUrlRefetch } =
    useQuery(verificationUrlQuery)

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
                <Link
                  to={verificationUrl ?? ""}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <div className="mt-2 mb-2">
                    <LineLoggedInButton
                      onClick={() => {}}
                      text={t(
                        "LINEでログインしてアカウント認証",
                        "Log in with LINE to verify your account",
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
                <Link to="/plus">
                  <img
                    src="https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/aipictors-plus-plans-lists_%20.png"
                    alt="aipictors-plus"
                  />
                </Link>
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
                <Link
                  to={verificationUrl ?? ""}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <div className="mt-2 mb-2">
                    <LineLoggedInButton
                      onClick={() => {}}
                      text={t(
                        "LINEでログインしてアカウント認証",
                        "Log in with LINE to verify your account",
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
                <Link to="/plus">
                  <img
                    src="https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/aipictors-plus-plans-lists_%20.png"
                    alt="aipictors-plus"
                  />
                </Link>
              </>
            )}
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}

const verificationUrlQuery = graphql(
  `query VerificationUrl {
    viewer {
      id
      verificationUrl
    }
  }`,
)
