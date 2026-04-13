import { useSuspenseQuery, useMutation } from "@apollo/client/index"
import { isApolloError } from "@apollo/client/errors"
import { graphql } from "gql.tada"
import {
  GoogleAuthProvider,
  TwitterAuthProvider,
  getAuth,
  signInWithPopup,
} from "firebase/auth"
import { RiGoogleFill, RiTwitterXFill } from "@remixicon/react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { useTranslation } from "~/hooks/use-translation"

const viewerUserProvidersQuery = graphql(`
  query ViewerUserProviders {
    viewer {
      id
      user {
        id
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

  const [isLinking, setIsLinking] = useState(false)

  const userProviders = data?.viewer?.user?.userProviders ?? []
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
