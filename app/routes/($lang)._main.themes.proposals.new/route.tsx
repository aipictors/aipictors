import { gql, useMutation } from "@apollo/client/index"
import { Link, useNavigate } from "@remix-run/react"
import { addDays, format } from "date-fns"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { AppPageHeader } from "~/components/app/app-page-header"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"

type MutationData = {
  createThemeProposal: {
    id: string
    title: string
    targetDate: string
    precheckComment?: string | null
  }
}

export default function NewThemeProposalPage() {
  const t = useTranslation()
  const navigate = useNavigate()
  const authContext = useContext(AuthContext)
  const [date, setDate] = useState(format(addDays(new Date(), 2), "yyyy-MM-dd"))
  const [theme, setTheme] = useState("")

  const [createThemeProposal, { loading, error }] = useMutation<MutationData>(
    CreateThemeProposalMutation,
  )

  const onSubmit = async () => {
    if (!theme.trim()) {
      return
    }

    const result = await createThemeProposal({
      variables: {
        date: date,
        theme: theme.trim(),
      },
    })

    toast(
      result.data?.createThemeProposal.precheckComment ||
        t("提案を送信しました", "Submitted the proposal"),
    )
    navigate("/themes/proposals")
  }

  return (
    <div className="space-y-4">
      <AppPageHeader
        title={t("お題を提案する", "Submit a theme proposal")}
        description={t(
          "送信時にセンシティブ一次チェックと翻訳整形を行います。判定は1日後にぴくたーちゃんが行います。",
          "A sensitivity pre-check and translation normalization run on submit. Pictor-chan decides after one day.",
        )}
      />

      <div className="flex justify-end">
        <Button asChild variant="secondary">
          <Link to="/themes/proposals">{t("一覧へ戻る", "Back to list")}</Link>
        </Button>
      </div>

      {!authContext.isLoading && authContext.isNotLoggedIn && (
        <Alert>
          <AlertDescription>
            {t("提案するにはログインが必要です。", "You need to sign in to submit a proposal.")}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("提案内容", "Proposal")}</CardTitle>
          <CardDescription>
            {t(
              "対象日は2日後以降を指定してください。英語でも日本語でも送信できます。",
              "Choose a target date at least two days ahead. You can submit in Japanese or English.",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="proposal-date">
              {t("対象日", "Target date")}
            </label>
            <Input
              id="proposal-date"
              type="date"
              value={date}
              min={format(addDays(new Date(), 2), "yyyy-MM-dd")}
              onChange={(event) => setDate(event.target.value)}
              disabled={authContext.isNotLoggedIn || loading}
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="proposal-theme">
              {t("お題", "Theme")}
            </label>
            <Textarea
              id="proposal-theme"
              placeholder={t(
                "例: 雨上がりの商店街、retro rainy arcade など",
                "Example: Neon rainy arcade, post-rain shopping street",
              )}
              value={theme}
              onChange={(event) => setTheme(event.target.value)}
              disabled={authContext.isNotLoggedIn || loading}
              rows={5}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button
              onClick={onSubmit}
              disabled={authContext.isNotLoggedIn || loading || theme.trim().length === 0}
            >
              {loading ? t("送信中", "Submitting") : t("提案を送信", "Submit proposal")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const CreateThemeProposalMutation = gql`
  mutation CreateThemeProposal($date: String!, $theme: String!) {
    createThemeProposal(date: $date, theme: $theme) {
      id
      title
      targetDate
      precheckComment
    }
  }
`
