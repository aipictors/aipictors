import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useQuery } from "@apollo/client/index"
import { useEffect, useState } from "react"
import { LineLoggedInButton } from "@/components/button/line-logged-in-button"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"

type Props = {
  isOpen: boolean
  onClose(): void
  verificationResult?: string | null
}

/**
 * 認証ダイアログ
 */
export const VerificationDialog = (props: Props) => {
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
            <DialogTitle>{"認証案内"}</DialogTitle>
            {props.verificationResult === "verification" && (
              <>
                <p>認証が完了いたしました。</p>
                <p>毎日無料10枚生成が解放されました。</p>
              </>
            )}
            {props.verificationResult === "verification_error" && (
              <>
                <p>認証が失敗いたしました。</p>
                <p>しばらくしてから再度お試しください。</p>
                <Link
                  to={verificationUrl ?? ""}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <div className="mt-2 mb-2">
                    <LineLoggedInButton
                      onClick={() => {}}
                      text={"LINEでログインしてアカウント認証"}
                    />
                  </div>
                </Link>
                <p>Aipictors+に加入する場合は認証不要です。</p>
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
                  お試しプランの生成が終了いたしました。
                </p>
                <p className="text-left text-md">
                  本人確認で毎日無料で10枚生成可能です。
                </p>
                <p className="text-left text-sm">
                  認証情報は本人確認のみに使用し、他の用途では一切使用されません。
                </p>
                <Link
                  to={verificationUrl ?? ""}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <div className="mt-2 mb-2">
                    <LineLoggedInButton
                      onClick={() => {}}
                      text={"LINEでログインしてアカウント認証"}
                    />
                  </div>
                </Link>
                <p className="text-left">
                  Aipictors+に加入する場合は認証不要です。
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
