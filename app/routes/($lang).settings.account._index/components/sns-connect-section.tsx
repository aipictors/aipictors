import { gql, useMutation, useSuspenseQuery } from "@apollo/client/index"
import { isApolloError } from "@apollo/client/errors"
import { graphql } from "gql.tada"
import {
  GoogleAuthProvider,
  TwitterAuthProvider,
  getAuth,
  signInWithPopup,
} from "firebase/auth"
import { RiGoogleFill, RiTwitterXFill } from "@remixicon/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Separator } from "~/components/ui/separator"
import { useTranslation } from "~/hooks/use-translation"

const viewerUserProvidersQuery = graphql(`
  query ViewerUserProviders {
    viewer {
      id
      user {
        id
        mailAddress
        userProviders {
          providerId
          providerUserUid
        }
      }
    }
  }
`)

const linkUserProviderMutation = graphql(`
  mutation LinkUserProvider($input: LinkUserProviderInput!) {
    linkUserProvider(input: $input) {
      id
      providerId
      providerUserUid
    }
  }
`)

const unlinkUserProviderMutation = graphql(`
  mutation UnlinkUserProvider($input: UnlinkUserProviderInput!) {
    unlinkUserProvider(input: $input)
  }
`)

interface ProviderConfig {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  provider: GoogleAuthProvider | TwitterAuthProvider
}

export function SNSConnectSection() {
  const t = useTranslation()
  const { data } = useSuspenseQuery(viewerUserProvidersQuery)
  const [linkMutation, { loading: linkLoading }] = useMutation(
    linkUserProviderMutation,
  )
  const [unlinkMutation, { loading: unlinkLoading }] = useMutation(
    unlinkUserProviderMutation,
  )
  const [sendEmailAuthLinkMutation, { loading: sendEmailLoading }] =
    useMutation(sendEmailAuthLinkMutationDocument)

  const [isLinking, setIsLinking] = useState(false)
  const userProviders = data?.viewer?.user?.userProviders ?? []
  const currentEmailProvider = userProviders.find((p) => p.providerId === "email")
  const currentEmail =
    currentEmailProvider?.providerUserUid ?? data?.viewer?.user?.mailAddress ?? ""
  const [emailAddress, setEmailAddress] = useState(currentEmail)

  useEffect(() => {
    setEmailAddress(currentEmail)
  }, [currentEmail])

  const linkedProviders = new Set(userProviders.map((p) => p.providerId))

  const providers: ProviderConfig[] = [
    {
      id: "google.com",
      name: "Google",
      icon: <RiGoogleFill className="w-5 h-5" />,
      color: "bg-white border border-gray-300 hover:bg-gray-50 text-gray-900",
      provider: new GoogleAuthProvider(),
    },
    {
      id: "twitter.com",
      name: "X (Twitter)",
      icon: <RiTwitterXFill className="w-5 h-5" />,
      color: "bg-black hover:bg-gray-900 text-white",
      provider: new TwitterAuthProvider(),
    },
  ]

  const handleLinkProvider = async (providerConfig: ProviderConfig) => {
    try {
      setIsLinking(true)
      const auth = getAuth()
      const result = await signInWithPopup(auth, providerConfig.provider)

      if (result.user.uid) {
        await linkMutation({
          variables: {
            input: {
              providerId: providerConfig.id,
              providerUserUid: result.user.uid,
            },
          },
        })
        toast.success(
          t(
            `${providerConfig.name}アカウントを紐付けました`,
            `Linked ${providerConfig.name} account`,
          ),
        )
      }
    } catch (error) {
      if (error instanceof Error && isApolloError(error)) {
        toast.error(
          error.message ||
            t("紐付けに失敗しました", "Failed to link account"),
        )
      } else if (error instanceof Error) {
        toast.error(error.message)
      }
    } finally {
      setIsLinking(false)
    }
  }

  const handleUnlinkProvider = async (providerId: string) => {
    try {
      await unlinkMutation({
        variables: {
          input: {
            providerId,
          },
        },
      })
      const provider = providers.find((p) => p.id === providerId)
      toast.success(
        t(
          `${provider?.name}アカウントの紐付けを解除しました`,
          `Unlinked ${provider?.name} account`,
        ),
      )
    } catch (error) {
      if (error instanceof Error && isApolloError(error)) {
        toast.error(
          error.message ||
            t("紐付け解除に失敗しました", "Failed to unlink account"),
        )
      }
    }
  }

  const handleSendEmailLink = async () => {
    try {
      const normalizedEmail = emailAddress.trim()

      if (!normalizedEmail) {
        toast(t("メールアドレスを入力してください", "Enter your email address"))
        return
      }

      await sendEmailAuthLinkMutation({
        variables: {
          input: {
            email: normalizedEmail,
          },
        },
      })

      toast.success(
        t(
          "確認メールを送信しました。メール内のリンクを開くとメールログインが有効になります。",
          "Verification email sent. Open the link in the email to enable email login.",
        ),
      )
    } catch (error) {
      if (error instanceof Error && isApolloError(error)) {
        toast.error(error.message)
      } else if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">
          {t("SNSアカウント紐付け", "Link SNS Accounts")}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {t(
            "SNSアカウントを紐付けけると、そのアカウントでログインできるようになります",
            "Link your SNS accounts to enable login with those accounts",
          )}
        </p>
      </div>

      <Separator />

      <div className="rounded-lg border p-4 space-y-3">
        <div>
          <h3 className="font-medium">{t("メールアドレス連携", "Email Login")}</h3>
          <p className="mt-1 text-sm text-gray-600">
            {t(
              "確認メールのリンクを開くと、そのメールアドレスでログインできるようになります",
              "Open the verification email link to enable login with that email address",
            )}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="email"
            value={emailAddress}
            onChange={(event) => setEmailAddress(event.target.value)}
            placeholder={t("メールアドレス", "Email address")}
            disabled={sendEmailLoading}
          />
          <Button onClick={handleSendEmailLink} disabled={sendEmailLoading}>
            {t("確認メールを送信", "Send verification email")}
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          {currentEmail
            ? t(`現在の連携先: ${currentEmail}`, `Currently linked: ${currentEmail}`)
            : t("現在は未連携です", "Not linked yet")}
        </p>
      </div>

      <div className="space-y-4">
        {providers.map((provider) => {
          const isLinked = linkedProviders.has(provider.id)
          const linkedAccount = userProviders.find(
            (p) => p.providerId === provider.id,
          )

          return (
            <div
              key={provider.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${provider.color}`}>
                  {provider.icon}
                </div>
                <div>
                  <p className="font-medium">{provider.name}</p>
                  {isLinked && linkedAccount && (
                    <p className="text-sm text-gray-600">
                      {t("紐付け済み", "Linked")} - ID: {linkedAccount.providerUserUid}
                    </p>
                  )}
                  {!isLinked && (
                    <p className="text-sm text-gray-500">
                      {t("未連携", "Not linked")}
                    </p>
                  )}
                </div>
              </div>

              <div>
                {isLinked ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnlinkProvider(provider.id)}
                    disabled={unlinkLoading || isLinking}
                  >
                    {t("紐付け解除", "Unlink")}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleLinkProvider(provider)}
                    disabled={linkLoading || isLinking}
                  >
                    {t("紐付ける", "Link")}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const sendEmailAuthLinkMutationDocument = gql`
  mutation SendEmailAuthLinkForSettings($input: SendEmailAuthLinkInput!) {
    sendEmailAuthLink(input: $input)
  }
`
