import { useMutation, useQuery } from "@apollo/client/index"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import { Cpu } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { AdminPageShell } from "~/components/admin-page-shell"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { createMeta } from "~/utils/create-meta"
import { getApolloErrorMessage } from "~/utils/get-apollo-error-message"

export const meta: MetaFunction = (props) => {
  return createMeta(
    {
      title: "利用者が追加したモデル",
      enTitle: "User-added AI Models",
      description: "投稿画面の使用AIに利用者が追加したモデルの管理ページ",
      enDescription:
        "Moderator-only page for AI models added by users on the post form",
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )
}

export async function loader(_props: LoaderFunctionArgs) {
  return json({})
}

/**
 * 投稿画面の「使用AI」に利用者が追加したモデルを、非表示にする・既存のモデルに統合する（モデレーター用）
 */
export default function AdminAiModelsPage() {
  const t = useTranslation()

  const authContext = useContext(AuthContext)

  const [mergeTargets, setMergeTargets] = useState<Record<string, string>>({})

  const [processingId, setProcessingId] = useState<string | null>(null)

  const { data: viewerData, loading: viewerLoading } = useQuery(
    AdminAiModelsViewerQuery,
    { skip: authContext.isLoading || authContext.isNotLoggedIn },
  )

  const isModerator = viewerData?.viewer?.isModerator === true

  const { data, loading, refetch } = useQuery(AdminUserAddedAiModelsQuery, {
    skip: !isModerator,
    fetchPolicy: "network-only",
  })

  const [setHidden] = useMutation(AdminSetAiModelHiddenMutation)

  const [mergeAiModel] = useMutation(AdminMergeAiModelMutation)

  const title = t("利用者が追加したモデル", "User-added AI models")

  const description = t(
    "投稿画面の使用AIに利用者が追加したモデルです。非表示にすると一覧から消え、同じ名前では追加し直せません。統合するとそのモデルの作品を統合先のモデルに付け替えます。",
    "Models users added on the post form. Hidden models disappear from the list and cannot be re-added with the same name. Merging moves the model's works to the target model.",
  )

  const onSetHidden = async (id: string, isHidden: boolean) => {
    setProcessingId(id)
    try {
      await setHidden({ variables: { input: { aiModelId: id, isHidden } } })
      await refetch()
      toast.success(
        isHidden
          ? t("非表示にしました", "Hidden")
          : t("表示に戻しました", "Shown"),
      )
    } catch (error) {
      toast.error(getApolloErrorMessage(error) ?? t("失敗しました", "Failed"))
    } finally {
      setProcessingId(null)
    }
  }

  const onMerge = async (id: string, name: string) => {
    const targetId = mergeTargets[id]
    const target = targets.find((model) => model.id === targetId)
    if (target === undefined) {
      toast.error(t("統合先を選んでください", "Choose a target model"))
      return
    }
    const confirmed = window.confirm(
      t(
        `「${name}」を「${target.name}」に統合します。作品の使用AIは「${target.name}」になり、元に戻せません。よろしいですか？`,
        `Merge "${name}" into "${target.name}"? Its works will use "${target.name}". This cannot be undone.`,
      ),
    )
    if (!confirmed) return
    setProcessingId(id)
    try {
      await mergeAiModel({
        variables: { input: { aiModelId: id, targetAiModelId: target.id } },
      })
      await refetch()
      toast.success(t("統合しました", "Merged"))
    } catch (error) {
      toast.error(getApolloErrorMessage(error) ?? t("失敗しました", "Failed"))
    } finally {
      setProcessingId(null)
    }
  }

  const models = data?.adminUserAddedAiModels ?? []

  // 統合先の候補: 表示中のモデル（API の一覧は非表示・統合済みを含まない）
  const targets = [...(data?.aiModels ?? [])].sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  if (authContext.isLoading || viewerLoading) {
    return (
      <AdminPageShell title={title} description={description} icon={Cpu}>
        <p className="text-slate-400 text-sm">
          {t("読み込み中...", "Loading...")}
        </p>
      </AdminPageShell>
    )
  }

  if (!isModerator) {
    return (
      <AdminPageShell title={title} description={description} icon={Cpu}>
        <Alert className="rounded-[28px] border-white/10 bg-white/5 text-slate-100">
          <AlertDescription className="text-slate-300">
            {authContext.isNotLoggedIn
              ? t(
                  "このページにアクセスするにはログインが必要です。",
                  "Please log in to access this page.",
                )
              : t(
                  "このページにアクセスする権限がありません。",
                  "You do not have permission to access this page.",
                )}
          </AlertDescription>
        </Alert>
      </AdminPageShell>
    )
  }

  return (
    <AdminPageShell title={title} description={description} icon={Cpu}>
      {loading ? (
        <p className="text-slate-400 text-sm">
          {t("読み込み中...", "Loading...")}
        </p>
      ) : models.length === 0 ? (
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardContent className="py-8 text-slate-400 text-sm">
            {t(
              "利用者が追加したモデルはまだありません。",
              "No user-added models yet.",
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {models.map((model) => (
            <Card
              key={model.id}
              className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none"
            >
              <CardContent className="space-y-3 p-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/models/${encodeURIComponent(model.name)}`}
                    className="break-all font-bold hover:underline"
                  >
                    {model.name}
                  </Link>
                  {model.mergedIntoId !== null ? (
                    <Badge variant="secondary">
                      {t(
                        `統合済み → ${model.mergedIntoName ?? model.mergedIntoId}`,
                        `Merged → ${model.mergedIntoName ?? model.mergedIntoId}`,
                      )}
                    </Badge>
                  ) : model.isHidden ? (
                    <Badge variant="destructive">{t("非表示", "Hidden")}</Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-100">
                      {t("表示中", "Visible")}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 text-slate-400 text-xs">
                  <span>
                    {t("作品", "Works")}: {model.worksCount}
                  </span>
                  <span>
                    {t("追加", "Added")}: {model.createdAt?.replace("T", " ")}
                  </span>
                  <span>
                    {t("追加した人", "Added by")}: user #
                    {model.createdByUserId ?? "-"}
                  </span>
                  <span>service: {model.workModelId}</span>
                </div>
                {model.mergedIntoId === null && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={processingId === model.id}
                      onClick={() => onSetHidden(model.id, !model.isHidden)}
                    >
                      {model.isHidden
                        ? t("表示に戻す", "Show")
                        : t("非表示にする", "Hide")}
                    </Button>
                    <Select
                      value={mergeTargets[model.id] ?? ""}
                      onValueChange={(value) =>
                        setMergeTargets((prev) => ({
                          ...prev,
                          [model.id]: value,
                        }))
                      }
                    >
                      <SelectTrigger className="h-9 w-64 max-w-full">
                        <SelectValue
                          placeholder={t("統合先のモデル", "Target model")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {targets
                            .filter((target) => target.id !== model.id)
                            .map((target) => (
                              <SelectItem key={target.id} value={target.id}>
                                {target.name}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={
                        processingId === model.id || !mergeTargets[model.id]
                      }
                      onClick={() => onMerge(model.id, model.name)}
                    >
                      {t("統合する", "Merge")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminPageShell>
  )
}

const AdminAiModelsViewerQuery = graphql(
  `query AdminAiModelsViewer {
    viewer {
      id
      isModerator
    }
  }`,
)

const AdminUserAddedAiModelsQuery = graphql(
  `query AdminUserAddedAiModels {
    adminUserAddedAiModels {
      id
      name
      workModelId
      isHidden
      mergedIntoId
      mergedIntoName
      createdByUserId
      createdAt
      worksCount
    }
    aiModels(offset: 0, limit: 500, where: {}) {
      id
      name
    }
  }`,
)

const AdminSetAiModelHiddenMutation = graphql(
  `mutation AdminSetAiModelHidden($input: AdminSetAiModelHiddenInput!) {
    adminSetAiModelHidden(input: $input) {
      id
      isHidden
    }
  }`,
)

const AdminMergeAiModelMutation = graphql(
  `mutation AdminMergeAiModel($input: AdminMergeAiModelInput!) {
    adminMergeAiModel(input: $input) {
      id
      mergedIntoId
    }
  }`,
)
