export type CommentModerationSummaryState = {
  commentId: string
  moderationStatus: string
  userNotice?: string | null
  canAppeal: boolean
  appealedAt?: number | null
}