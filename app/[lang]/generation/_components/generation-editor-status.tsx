import { GenerationCancelButton } from "@/app/[lang]/generation/_components/generation-cancel-button"
import { GenerationCountSelect } from "@/app/[lang]/generation/_components/generation-count-select"
import { GenerationEditorProgress } from "@/app/[lang]/generation/_components/generation-status-progress"
import { GenerationSubmitButton } from "@/app/[lang]/generation/_components/generation-submit-button"
import { GenerationTermsButton } from "@/app/[lang]/generation/_components/generation-terms-button"
import { cancelImageGenerationTaskMutation } from "@/graphql/mutations/cancel-image-generation-task"
import { signImageGenerationTermsMutation } from "@/graphql/mutations/sign-image-generation-terms"
import { viewerCurrentPassQuery } from "@/graphql/queries/viewer/viewer-current-pass"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/viewer/viewer-image-generation-tasks"
import { useMutation } from "@apollo/client"
import { toast } from "sonner"

type Props = {
  /**
   * ユーザID
   */
  userNanoid: string | null
  normalTasksCount: number | null
  standardTasksCount: number | null
  normalPredictionGenerationSeconds: number | null
  standardPredictionGenerationSeconds: number | null
  termsMarkdownText: string
  /**
   * 規約に同意済みである
   */
  hasSignedTerms: boolean
  /**
   * 画像を生成中
   */
  inProgress: boolean
  /**
   * タスクを作成中
   */
  isCreatingTasks: boolean
  /**
   * 画像生成が無効である
   */
  isDisabled: boolean
  /**
   * サブスクの種類
   */
  passType: string | null
  /**
   * 生成枚数
   */
  tasksCount: number
  /**
   * 生成枚数を変更する
   * @param count 生成枚数
   */
  onChangeTasksCount(count: number): void
  /**
   * タスクを作成する
   */
  onCreateTask(): void
}

export function GenerationEditorStatus(props: Props) {
  const [signTerms] = useMutation(signImageGenerationTermsMutation, {
    refetchQueries: [viewerCurrentPassQuery],
    awaitRefetchQueries: true,
  })

  const [cancelTask, { loading: isCanceling }] = useMutation(
    cancelImageGenerationTaskMutation,
    {
      refetchQueries: [viewerImageGenerationTasksQuery],
      awaitRefetchQueries: true,
    },
  )

  /**
   * 規約に同意する
   */
  const onSignTerms = async () => {
    try {
      await signTerms({ variables: { input: { version: 1 } } })
      toast("画像生成の利用規約に同意しました")
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  /**
   * タスクをキャンセルする
   */
  const onCancelTask = async () => {
    if (props.userNanoid === null) return
    try {
      await cancelTask()
    } catch (error) {
      toast(
        "現在リクエストを受け付けて生成実行中です、1分以上時間をおいて生成を待つか、キャンセル下さい",
      )
      return
    }
    toast("タスクをキャンセルしました")
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <GenerationCountSelect
          pass={props.passType ?? "FREE"}
          selectedCount={props.tasksCount}
          onChange={props.onChangeTasksCount}
        />
        {/* 生成開始ボタン */}
        {props.hasSignedTerms && !props.inProgress && (
          <GenerationSubmitButton
            onClick={props.onCreateTask}
            isLoading={props.isCreatingTasks}
            isDisabled={props.isDisabled}
          />
        )}
        {/* キャンセル開始ボタン */}
        {props.hasSignedTerms && props.inProgress && (
          <GenerationCancelButton
            onClick={onCancelTask}
            isLoading={isCanceling}
          />
        )}
        {/* 規約確認開始ボタン */}
        {!props.hasSignedTerms && (
          <GenerationTermsButton
            termsMarkdownText={props.termsMarkdownText}
            onSubmit={onSignTerms}
          />
        )}
      </div>
      <GenerationEditorProgress
        inProgress={props.inProgress}
        maxTasksCount={props.tasksCount}
        normalPredictionGenerationSeconds={
          props.normalPredictionGenerationSeconds ?? 0
        }
        normalTasksCount={props.normalTasksCount ?? 0}
        passType={props.passType}
        remainingImageGenerationTasksCount={props.tasksCount}
        standardPredictionGenerationSeconds={
          props.standardPredictionGenerationSeconds ?? 0
        }
        standardTasksCount={props.standardTasksCount ?? 0}
      />
    </div>
  )
}
