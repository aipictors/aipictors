import { gql, useMutation } from "@apollo/client/index"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Textarea } from "~/components/ui/textarea"
import { useTranslation } from "~/hooks/use-translation"

export const MAX_THEME_PROPOSAL_NOTE_LENGTH = 500

type Props = {
  proposalId: string
  note: string | null | undefined
  onUpdated?(): void
}

/**
 * お題提案の備考を編集するダイアログ（審査待ちの自分の提案のみ表示する）
 */
export function ThemeProposalNoteEditDialog(props: Props) {
  const t = useTranslation()

  const [isOpen, setIsOpen] = useState(false)

  const [note, setNote] = useState(props.note ?? "")

  const [updateNote, { loading }] = useMutation(UpdateThemeProposalNoteMutation)

  const onOpenChange = (open: boolean) => {
    if (open) {
      setNote(props.note ?? "")
    }
    setIsOpen(open)
  }

  const onSubmit = async () => {
    const trimmed = note.trim()
    try {
      await updateNote({
        variables: {
          proposalId: props.proposalId,
          note: trimmed.length > 0 ? trimmed : null,
        },
      })
      toast(t("備考を更新しました", "Updated the note"))
      setIsOpen(false)
      props.onUpdated?.()
    } catch (error) {
      toast(
        error instanceof Error && error.message.length > 0
          ? error.message
          : t("備考の更新に失敗しました", "Failed to update the note"),
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          {t("備考を編集", "Edit note")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("備考を編集", "Edit note")}</DialogTitle>
          <DialogDescription>
            {t(
              "採用・不採用が決まる前の提案だけ編集できます。",
              "You can edit the note only while the proposal is pending.",
            )}
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          disabled={loading}
          rows={5}
          maxLength={MAX_THEME_PROPOSAL_NOTE_LENGTH}
          aria-label={t("備考", "Note")}
        />
        <p className="text-right text-muted-foreground text-xs">
          {note.length}/{MAX_THEME_PROPOSAL_NOTE_LENGTH}
        </p>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
            {t("戻る", "Back")}
          </Button>
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? t("保存中", "Saving") : t("保存する", "Save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * 審査待ちの自分の提案かどうか
 */
export function canEditThemeProposalNote(
  proposal: { status: string; proposerUserId: string },
  userId: string | null | undefined,
) {
  if (userId === null || userId === undefined) return false
  return proposal.status === "PENDING" && proposal.proposerUserId === userId
}

const UpdateThemeProposalNoteMutation = gql`
  mutation UpdateThemeProposalNote($proposalId: ID!, $note: String) {
    updateThemeProposalNote(proposalId: $proposalId, note: $note) {
      id
      note
      updatedAt
    }
  }
`
