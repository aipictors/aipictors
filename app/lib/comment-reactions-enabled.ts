/**
 * コメント・返信へのリアクション（❤️ ✨ 😂 😮 🙏 🎉）を出すかどうか
 *
 * 一旦廃止したので false。戻すときはここを true にするだけでよい。
 * 画面は routes/($lang)._main.posts.$post._index/components/comment-reactions.tsx、
 * 受け口は routes/api.comment-reactions、付いたリアクションのデータは
 * aipictors-api の comment_reactions テーブルにそのまま残してある。
 */
// boolean と書いておく（false の型だと切り替えたときに型エラー・未到達扱いになる）
export const IS_COMMENT_REACTION_ENABLED: boolean = false
