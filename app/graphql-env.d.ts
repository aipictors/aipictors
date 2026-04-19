"""投稿の公開設定"""
enum AccessType {
  """下書き"""
  DRAFT

  """限定公開"""
  LIMITED

  """非公開"""
  PRIVATE

  """公開"""
  PUBLIC

  """新着非公開"""
  SILENT
}

"""運営による公開設定"""
enum AdminAccessType {
  """完全非公開"""
  PRIVATE

  """公開"""
  PUBLIC

  """一時非公開"""
  TEMPORARY_PRIVATE
}

"""作品通報の管理項目"""
type AdminWorkReportNode implements Node {
  comment: String
  createdAt: Int!
  id: ID!
  reason: String!
  reportStatus: String!
  reportUser: UserNode
  work: WorkNode
}

"""モデル"""
type AiModelNode implements Node {
  """生成機能のモデルID"""
  generationModelId: ID
  id: ID!

  """モデル名"""
  name: String!

  """サムネイル画像"""
  thumbnailImageURL: String

  """モデル種別"""
  type: AiModelType

  """投稿機能のモデルID"""
  workModelId: ID

  """
  作品
  ※キャッシュ不可
  """
  works(limit: Int!, offset: Int!, where: WorksWhereInput): [WorkNode!]!

  """作品数"""
  worksCount(where: WorksWhereInput): Int!
}

"""AIモデルの種類"""
enum AiModelType {
  """画像"""
  IMAGE
}

input AiModelWhereInput {
  search: String
}

"""作品のシリーズ"""
type AlbumNode implements Node {
  """作成日"""
  createdAt: Int!

  """説明"""
  description: String!
  id: ID!

  """いいねしている"""
  isLiked: Boolean!

  """センシティブである"""
  isSensitive: Boolean!

  """保存している"""
  isWatched: Boolean!

  """いいね数"""
  likesCount: Int!

  """Open Graph 説明"""
  openGraphDescription: String

  """Open Graph 画像"""
  openGraphImageURL: String

  """Open Graph タイトル"""
  openGraphTitle: String

  """年齢種別"""
  rating: AlbumRating!

  """シェア"""
  shareText: String

  """スラッグ"""
  slug: String

  """サムネイル"""
  thumbnailImage: ImageNode @deprecated(reason: "廃止")

  """サムネイル画像のURL"""
  thumbnailImageURL: String

  """タイトル"""
  title: String!

  """ユーザ"""
  user: UserNode!

  """作成者"""
  userId: ID!
  viewer: AlbumViewerNode @deprecated(reason: "isLikedを使用する")

  """閲覧数"""
  viewsCount: Int!

  """作品ID一覧"""
  workIds: [Int!]!

  """
  作品
  ※キャッシュ不可
  """
  works(limit: Int!, offset: Int!): [WorkNode!]!

  """作品数"""
  worksCount: Int!
}

"""アルバムの並び順"""
enum AlbumOrderBy {
  """投稿時刻"""
  DATE_CREATED

  """更新日時"""
  DATE_UPDATED

  """名前"""
  NAME
}

"""アルバムの年齢制限"""
enum AlbumRating {
  """全年齢"""
  G

  """R15"""
  R15

  """センシティブ"""
  R18

  """R18G"""
  R18G
}

type AlbumViewerNode implements Node {
  id: ID! @deprecated(reason: "")
  isLiked: Boolean! @deprecated(reason: "")
  isWatched: Boolean! @deprecated(reason: "")
}

input AlbumWhereInput {
  """アルバムID"""
  albumSlug: String!

  """ログインユーザID"""
  ownerLoginUserId: String!
}

input AlbumsWhereInput {
  """フォロー中ユーザのシリーズのみ"""
  isFollowing: Boolean

  """センシティブ"""
  isSensitive: Boolean

  """お気に入り登録したシリーズのみ"""
  isWatched: Boolean

  """検査済みである必要があるかどうか"""
  needInspected: Boolean

  """サムネイル画像が必ず存在しないといけないか"""
  needsThumbnailImage: Boolean

  """ソート"""
  orderBy: AlbumOrderBy

  """所有者"""
  ownerUserId: ID

  """年齢種別"""
  ratings: [AlbumRating!]
  search: String

  """昇順/降順"""
  sort: Sort
}

"""投稿（アニメーション）"""
type AnimationPostNode implements Node {
  """閲覧権限の種類"""
  accessType: AccessType!

  """運営による閲覧権限の種類"""
  adminAccessType: AdminAccessType!

  """シリーズ情報"""
  album: AlbumNode

  """ブックマーク数"""
  bookmarksCount: Int!

  """コメント"""
  comment(id: ID!): CommentNode!

  """コメント"""
  comments(limit: Int!, offset: Int!): [CommentNode!]!

  """コメント数"""
  commentsCount: Int!

  """作成日"""
  createdAt: Int!

  """デイリーランキング"""
  dailyRanking: Int

  """テーマ"""
  dailyTheme: DailyThemeNode

  """説明"""
  description: String

  """説明(英語)"""
  enDescription: String

  """タイトル(英語)"""
  enTitle: String
  id: ID!

  """画像"""
  image: ImageNode @deprecated(reason: "廃止")

  """画像の高さ"""
  imageHeight: Int!

  """画像ID"""
  imageId: ID! @deprecated(reason: "廃止")

  """画像URL"""
  imageURL: String!

  """画像の幅"""
  imageWidth: Int!

  """Cloudflare Stream の動画UID"""
  streamUid: String

  """ブックマークしている"""
  isBookmarked: Boolean!

  """コメント編集許可"""
  isCommentsEditable: Boolean!

  """削除済み"""
  isDeleted: Boolean!

  """コレクションに追加している"""
  isInCollection: Boolean!

  """いいねしている"""
  isLiked: Boolean!

  """自分自身が推薦しているかどうか"""
  isMyRecommended: Boolean!

  """プロモーション作品かどうか"""
  isPromotion: Boolean!

  """センシティブである"""
  isSensitive: Boolean!

  """タグ編集許可"""
  isTagEditable: Boolean!

  """画像（大）の高さ"""
  largeThumbnailImageHeight: Int!

  """画像（大）のURL"""
  largeThumbnailImageURL: String!

  """画像（大）の幅"""
  largeThumbnailImageWidth: Int!

  """いいねしたユーザ一覧"""
  likedUsers(limit: Int!, offset: Int!): [UserNode!]!

  """いいね数"""
  likesCount: Int!

  """マンスリーランキング"""
  monthlyRanking: Int

  """次の作品"""
  nextPost: AnimationPostNode

  """OGP画像URL"""
  ogpThumbnailImageUrl: String

  """Open Graph 説明"""
  openGraphDescription: String

  """Open Graph 画像"""
  openGraphImageURL: String

  """Open Graph タイトル"""
  openGraphTitle: String

  """前の作品"""
  previousPost: AnimationPostNode

  """年齢制限"""
  rating: Rating

  """関連するタグ"""
  relatedTags(limit: Int!, offset: Int!): [TagNode!]!

  """関連URL"""
  relatedUrl: String

  """関連する作品"""
  relatedWorks(limit: Int!, offset: Int!): [AnimationPostNode!]!

  """シェア"""
  shareText: String

  """画像（小）の高さ"""
  smallThumbnailImageHeight: Int!

  """画像（小）のURL"""
  smallThumbnailImageURL: String!

  """画像（小）の幅"""
  smallThumbnailImageWidth: Int!

  """テイスト"""
  style: ImageStyle!

  """作品"""
  subPosts: [SubWorkNode!]!

  """複数画像数"""
  subPostsCount: Int!

  """タグ名"""
  tagNames: [String!]!
  tags: [TagNode!]!

  """サムネイル画像の位置"""
  thumbnailImagePosition: Float

  """タイトル"""
  title: String!

  """更新日"""
  updatedAt: Int!

  """ユーザ"""
  user: UserNode!

  """ユーザID"""
  userId: ID!

  """動画URL"""
  videoUrl: String

  """閲覧数"""
  viewsCount: Int!

  """ウィークリーランキング"""
  weeklyRanking: Int
}

"""運営のお知らせ"""
type AnnouncementNode implements Node {
  """本文"""
  body: String!
  id: ID!

  """作成日"""
  publishedAt: Int!

  """タイトル"""
  title: String!
}

type AppEventAnnouncementNode {
  imageUrl: String!
  url: String!
}

"""イベント"""
type AppEventNode implements Node {
  awardWorks(isSensitive: Boolean!, limit: Int!, offset: Int!): [WorkNode!]
  awards(limit: Int!, offset: Int!, where: UserWorksWhereInput): [WorkNode!]
  description: String!
  endAt: Int!
  headerImageUrl: String!
  id: ID!

  """終了済みかどうか"""
  isEnded: Boolean!

  """開催中かどうか"""
  isOngoing: Boolean!

  """開催予定かどうか"""
  isUpcoming: Boolean!

  """終了までの残り日数"""
  remainingDays: Int!
  slug: String!
  startAt: Int!

  """開催状態"""
  status: String!
  tag: String!
  thumbnailImageUrl: String!
  title: String!

  """参加方法"""
  wayToJoin: String!
  works(limit: Int!, offset: Int!, where: WorksWhereInput): [WorkNode!]

  """作品数"""
  worksCount: Int!
}

input AppEventsWhereInput {
  """終了日"""
  endAt: String

  """タイトル・説明・タグの検索キーワード"""
  keyword: String

  """説明文も検索対象に含める"""
  searchInDescription: Boolean

  """タグも検索対象に含める"""
  searchInTags: Boolean

  """String"""
  slug: String

  """開始日"""
  startAt: String

  """開催状態(ONGOING / UPCOMING / ENDED)"""
  status: String

  """タグ"""
  tag: String

  """タイトル"""
  title: String
}

input AppealCommentModerationInput {
  commentId: ID!
  text: String!
}

"""ランキングの種類"""
enum AwardType {
  """日別"""
  DAILY

  """日別（テーマなし）"""
  DAILY_NO_THEME

  """月別"""
  MONTHLY

  """週別"""
  WEEKLY
}

input AwardsWhereInput {
  date: String
  day: Int
  month: Int
  type: AwardType
  workType: WorkType
  year: Int
}

"""バッジ"""
type BadgeNode implements Node {
  """バッジID"""
  id: ID!

  """バッジ画像URL"""
  imageUrl: String!

  """説明文"""
  text: String!

  """更新日時"""
  updated_at: Int!
}

input BlockUserInput {
  userId: ID!
}

"""お気に入りスタンプ種別"""
enum BookmarkedStickerType {
  """コメント"""
  comment

  """返信"""
  reply
}

"""Bot採点タイプ"""
enum BotGradingType {
  """コメントと採点両方"""
  COMMENT_AND_SCORE

  """コメントのみ"""
  COMMENT_ONLY

  """採点のみ"""
  SCORE_ONLY
}

"""BOT性格の種別"""
enum BotPersonality {
  """女性"""
  female

  """男性"""
  male

  """ぴくたーちゃん"""
  pictor_chan

  """ロボット"""
  robot

  """賢人"""
  sage
}

input CancelImageGenerationReservedTaskInput {
  nanoid: String!
}

input CancelImageGenerationTaskInput {
  nanoid: String!
}

"""カテゴリ"""
type CategoryNode implements Node {
  id: ID!
  isWatched: Boolean!

  """名前"""
  name: String!
  viewer: CategoryViewerNode
}

type CategoryViewerNode implements Node {
  id: ID!
  isWatched: Boolean!
}

"""キャラクター表情差分一括生成の結果"""
type CharacterExpressionBatchResult {
  """生成されたキャラクターID"""
  characterId: String!

  """生成されたキャラクター名"""
  characterName: String!

  """生成に成功した表情の数"""
  generatedExpressions: Int!

  """設定された最大コスト"""
  maxCostLimit: Int!

  """生成された画像の結果リスト"""
  results: [ImageGenerationResultNode!]!

  """コスト不足でスキップされた表情リスト"""
  skippedExpressions: [String!]!

  """使用した総コスト"""
  totalCostUsed: Int!

  """要求された表情の総数"""
  totalExpressions: Int!
}

"""キャラクター表情"""
type CharacterExpressionNode implements Node {
  """作成日時"""
  createdAt: String

  """表情名"""
  expressionName: String
  id: ID!

  """画像URL"""
  imageUrl: String
}

"""キャラクター"""
type CharacterNode implements Node {
  """ベース画像URL"""
  baseImageUrl: String

  """作成日時"""
  createdAt: String

  """キャラクター説明"""
  description: String

  """キャラクターの表情リスト"""
  expressions: [CharacterExpressionNode!]!
  id: ID!

  """公開フラグ"""
  isPublic: Boolean

  """キャラクター名"""
  name: String

  """nanoid"""
  nanoid: String

  """サムネイル画像URL（1枚目の表情画像または基本画像）"""
  thumbnailUrl: String
}

"""キャラクター自動作成付き表情差分生成結果"""
type CharacterWithExpressionsResult {
  """作成されたキャラクターID"""
  characterId: String

  """作成されたキャラクター名"""
  characterName: String

  """生成された表情数"""
  generatedExpressions: Int

  """最大コスト制限"""
  maxCostLimit: Int

  """スキップされた表情リスト"""
  skippedExpressions: [String!]

  """使用された総コスト"""
  totalCostUsed: Int

  """リクエストされた表情数"""
  totalExpressions: Int
}

"""通知確認時刻"""
type CheckedNotificationTimeNode implements Node {
  """確認時間"""
  checkedTime: Int!
  id: ID!

  """種類"""
  type: NotifyCheckedType!
}

"""コメント審査の管理項目"""
type CommentModerationAdminItemNode implements Node {
  commentCreatedAt: Int!
  commentId: ID!
  commentOwnerLogin: String
  commentOwnerName: String
  commentOwnerUserId: ID
  commentText: String!
  createdAt: Int!
  details: String
  id: ID!
  kind: String!
  moderationStatus: String
  reportCount: Int!
  reportReason: String
  userNotice: String
  violationCategory: String
  workId: ID
  workTitle: String
}

"""コメント審査状態"""
type CommentModerationSummaryNode implements Node {
  appealedAt: Int
  canAppeal: Boolean!
  commentId: ID!
  id: ID!
  moderationStatus: String!
  reportCount: Int!
  userNotice: String
  violationCategory: String
}

"""コメント"""
type CommentNode implements Node {
  """作成日"""
  createdAt: Int!
  id: ID!

  """削除済み"""
  isDeleted: Boolean!

  """いいねしている"""
  isLiked: Boolean!

  """ミュートしているユーザのコメントかどうか"""
  isMuted: Boolean!

  """センシティブなコメントかどうか"""
  isSensitive: Boolean!

  """作品の作者がいいねしたかどうか"""
  isWorkOwnerLiked: Boolean!

  """いいね数"""
  likesCount: Int!

  """レスポンス"""
  responses(limit: Int!, offset: Int!): [CommentNode!]

  """スタンプ"""
  sticker: StickerNode

  """内容"""
  text: String!
  user: UserNode
  userId: ID

  """作品"""
  work: WorkNode
  workId: ID
}

input CommentsOrderBy {
  createdAt: Direction
}

input CommentsWhereInput {
  isSensitive: Boolean
  ratings: [Rating!]
}

"""ControlNetテンプレート"""
type ControlNetCategoryNode implements Node {
  contents: [ControlNetContentNode!]!
  enName: String!
  id: ID!
  name: String!
}

type ControlNetContentNode implements Node {
  enName: String!
  id: ID!
  imageUrl: String!
  model: String!
  module: String!
  name: String!

  """サイズの種類"""
  sizeKind: ImageGenerationSizeKind!
  thumbnailImageUrl: String!
}

input CreateAccountInput {
  idToken: String!
}

input CreateAlbumInput {
  description: String

  """年齢制限"""
  rating: AlbumRating
  slug: String!
  thumbnailUrl: String
  title: String!
  workIds: [ID!]!
}

input CreateAlbumLikeInput {
  albumId: ID!
}

input CreateAlbumWorkInput {
  albumId: ID!
  workId: ID!
}

"""キャラクター表情差分一括生成のタスクを作成するInput"""
input CreateCharacterExpressionBatchGenerationTaskInput {
  """ベースとなるキャラクター画像のURL"""
  baseImageUrl: String!

  """生成する表情のリスト（最大10個、デフォルト: [笑顔, 涙, 悲しみ, 無表情, 怒り]）"""
  expressions: [String!]

  """IPアドレス（任意）"""
  ipaddress: String

  """生成する画像サイズ"""
  size: GeminiImageSize!
}

"""単一キャラクター表情生成のInput"""
input CreateCharacterExpressionInput {
  """キャラクターID"""
  characterId: String!

  """生成する表情名"""
  expressionName: String!

  """IPアドレス（任意）"""
  ipaddress: String

  """生成する画像サイズ"""
  size: GeminiImageSize!
}

"""キャラクター作成のInput"""
input CreateCharacterInput {
  """ベース画像URL"""
  baseImageUrl: String!

  """キャラクター説明"""
  description: String

  """公開フラグ"""
  isPublic: Boolean

  """キャラクター名"""
  name: String!
}

"""キャラクター自動作成付き表情差分生成のInput"""
input CreateCharacterWithExpressionsInput {
  """ベースとなるキャラクター画像のURL"""
  baseImageUrl: String!

  """キャラクター名（省略時は自動生成）"""
  characterName: String

  """生成する表情のリスト（最大10個、デフォルト: [笑顔, 涙, 悲しみ, 無表情, 怒り]）"""
  expressions: [String!]

  """IPアドレス（任意）"""
  ipaddress: String

  """生成する画像サイズ"""
  size: GeminiImageSize!
}

input CreateCommentLikeInput {
  commentId: ID!
}

"""広告作成"""
input CreateCustomerAdvertisement {
  """表示確率（優先度、数字が多ければ多いほど表示確率が上がる）"""
  displayProbability: Int!

  """配信終了日付"""
  endAt: String

  """画像URL"""
  imageUrl: String!

  """有効かどうか"""
  isActive: Boolean!

  """センシティブかどうか"""
  isSensitive: Boolean!

  """表示対象画面の種類"""
  page: CustomerAdvertisementType!

  """配信開始日付"""
  startAt: String

  """遷移先URL"""
  url: String!
}

"""画像から複数表情差分生成のInput"""
input CreateExpressionsFromImageInput {
  """背景色（16進数、例: #00FF00）。nullの場合は背景をそのまま保持"""
  backgroundColor: String

  """ベースとなる画像のURL"""
  baseImageUrl: String!

  """既存キャラクターID（指定時はそのキャラクターに表情を追加、省略時は新規作成）"""
  characterId: String

  """キャラクター名（新規作成時のみ使用、省略時は自動生成）"""
  characterName: String

  """生成する表情のリスト（最大10個、デフォルト: [笑顔, 涙, 悲しみ, 無表情, 怒り]）"""
  expressions: [String!]

  """IPアドレス（任意）"""
  ipaddress: String

  """生成する画像サイズ"""
  size: GeminiImageSize!
}

input CreateFluxImageGenerationTaskInput {
  """生成する枚数"""
  count: Int

  """画像のサイズ（画像タイプを上書き）"""
  height: Int

  """IPアドレス（任意）"""
  ipaddress: String

  """プロンプト生成を有効にする"""
  isPromptGenerationEnabled: Boolean

  """モデル名"""
  modelName: String

  """ネガティブプロンプト"""
  negativePrompt: String!

  """プロンプト"""
  prompt: String!

  """scale"""
  scale: Int

  """seed"""
  seed: Float

  """画像のサイズ"""
  sizeType: ImageGenerationSizeType

  """steps"""
  steps: Int

  """画像のサイズ幅（画像タイプを上書き）"""
  width: Int
}

input CreateFolderInput {
  title: String!
}

input CreateFolderWorkInput {
  folderId: ID!
  workId: ID!
}

"""Gemini画像生成のタスクを作成するInput"""
input CreateGeminiImageGenerationTaskInput {
  """参考画像（Base64エンコード、任意）"""
  imageBase64: String

  """参考画像URL（任意、imageBase64より優先）"""
  imageUrl: String

  """参考画像のURL配列、imageUrlに追加して使う画像がある場合は指定（ブレンド生成）"""
  imageUrls: [String!]

  """IPアドレス（任意）"""
  ipaddress: String

  """画像のMIMEタイプ（image/png, image/jpeg など、imageBase64指定時必須）"""
  mimeType: String

  """使用するGemini画像生成モデル（未指定の場合は gemini-2.5-flash-image を使用）"""
  model: GeminiImageModel

  """プロンプト（日本語可）"""
  prompt: String!

  """生成する画像サイズ"""
  size: GeminiImageSize!
}

input CreateImageGenerationMemoInput {
  clipSkip: Int!
  explanation: String!
  height: Int!
  modelId: ID!
  negativePrompts: String!
  prompts: String!
  sampler: String!
  scale: Int!
  seed: Int!
  steps: Int!
  title: String!
  vae: String!
  width: Int!
}

input CreateImageGenerationTaskInput {
  """clipSkip"""
  clipSkip: Int
  controlNetControlMode: String
  controlNetEnabled: Boolean
  controlNetGuidance: Float
  controlNetGuidanceEnd: Float
  controlNetGuidanceStart: Float
  controlNetHrOption: String

  """ControlNetパラメータ"""
  controlNetImageUrl: String
  controlNetMaskImageUrl: String
  controlNetModel: String
  controlNetModule: String
  controlNetPixelPerfect: Boolean
  controlNetProcessorRes: Int
  controlNetResizeMode: String
  controlNetSaveDetectedMap: Boolean
  controlNetThresholdA: Int
  controlNetThresholdB: Int
  controlNetWeight: Float

  """生成する枚数"""
  count: Int!

  """画像のサイズ（画像タイプを上書き）"""
  height: Int

  """IPアドレス（任意）"""
  ipaddress: String

  """プロンプト生成を有効にする"""
  isPromptGenerationEnabled: Boolean

  """モデル"""
  model: String!

  """ネガティブプロンプト"""
  negativePrompt: String!

  """プロンプト"""
  prompt: String!

  """sampler"""
  sampler: String!

  """scale"""
  scale: Int!

  """seed"""
  seed: Float!

  """画像のサイズ"""
  sizeType: ImageGenerationSizeType

  """steps"""
  steps: Int!
  t2tDenoisingStrengthSize: String

  """t2tパラメータ"""
  t2tImageUrl: String
  t2tInpaintingFillSize: String
  t2tMaskImageUrl: String

  """生成の方式"""
  type: ImageGenerationType!

  """アップスケールサイズ(x2, x4, x8)"""
  upscaleSize: Float

  """VAE"""
  vae: String!

  """画像のサイズ幅（画像タイプを上書き）"""
  width: Int
}

input CreateMessageInput {
  recipientId: ID!
  text: String!
}

input CreateNoteInput {
  text: String!
}

input CreateNovelInput {
  text: String!
}

input CreatePassCheckoutSessionInput {
  passType: PassType!
}

input CreateRecommendedWorkInput {
  workId: ID!
}

input CreateReservedImageGenerationTaskInput {
  clipSkip: Int
  controlNetControlMode: String
  controlNetEnabled: Boolean
  controlNetGuidance: Float
  controlNetGuidanceEnd: Float
  controlNetGuidanceStart: Float
  controlNetHrOption: String

  """ControlNetの設定"""
  controlNetImageUrl: String
  controlNetMaskImageUrl: String
  controlNetModel: String
  controlNetModule: String
  controlNetPixelPerfect: Boolean
  controlNetProcessorRes: Int
  controlNetResizeMode: String
  controlNetSaveDetectedMap: Boolean
  controlNetThresholdA: Int
  controlNetThresholdB: Int
  controlNetWeight: Float

  """生成する枚数"""
  count: Int!

  """画像のサイズ（画像タイプを上書き）"""
  height: Int

  """IPアドレス（任意）"""
  ipaddress: String
  isPromptGenerationEnabled: Boolean
  model: String!
  negativePrompt: String!
  prompt: String!
  sampler: String!
  scale: Int!
  seed: Float!

  """画像のサイズ"""
  sizeType: ImageGenerationSizeType
  steps: Int!
  t2tDenoisingStrengthSize: String

  """t2tパラメータ"""
  t2tImageUrl: String
  t2tInpaintingFillSize: String
  t2tMaskImageUrl: String

  """生成の方式"""
  type: ImageGenerationType!

  """アップスケールサイズ(x2, x4, x8)"""
  upscaleSize: Float
  vae: String!

  """画像のサイズ幅（画像タイプを上書き）"""
  width: Int
}

input CreateResponseCommentInput {
  commentId: ID!

  """センシティブなコメントかどうか"""
  isSensitive: Boolean
  stickerId: ID
  text: String!
}

input CreateStickerInput {
  """公開状態"""
  accessType: AccessType!

  """カテゴリ"""
  categories: [String!]

  """ジャンル"""
  genre: StickerGenre

  """画像URL"""
  imageUrl: String!

  """タイトル"""
  title: String
}

input CreateUserEventInput {
  announcementText: String
  description: String
  endAt: Int!
  headerImageUrl: String
  mainTag: String!
  participationGuide: String
  rankingEnabled: Boolean!
  rankingType: String
  ratings: [Rating!]!
  slug: String!
  startAt: Int!
  tags: [String!]!
  thumbnailImageUrl: String
  title: String!
  visibilityType: String!
}

input CreateUserStickerInput {
  stickerId: ID!
}

input CreateWorkCommentInput {
  """センシティブなコメントかどうか"""
  isSensitive: Boolean
  stickerId: ID
  text: String!
  workId: ID!
}

input CreateWorkInput {
  """生成情報の公開設定"""
  accessGenerationType: GenerationAccessType!

  """公開状態"""
  accessType: AccessType!

  """シリーズID"""
  albumId: ID

  """Bot採点用JPEG画像URL"""
  botGradingImageUrl: String

  """Bot採点タイプ"""
  botGradingType: BotGradingType

  """Bot評価の性格タイプ"""
  botPersonality: BotPersonality
  enExplanation: String
  entitle: String

  """説明"""
  explanation: String
  imageHeight: Int!

  """テイスト"""
  imageStyle: ImageStyle!

  """画像"""
  imageUrls: [String!]!
  imageWidth: Int!

  """Bot採点を使用するか"""
  isBotGradingEnabled: Boolean

  """Bot採点を公開するか"""
  isBotGradingPublic: Boolean

  """Bot採点ランキングに参加するか"""
  isBotGradingRankingEnabled: Boolean

  """コメント許可"""
  isCommentEditable: Boolean!

  """宣伝作品かどうか"""
  isPromotion: Boolean!

  """タグ編集許可"""
  isTagEditable: Boolean!
  largeThumbnailImageHeight: Int!

  """大きいサムネイル画像(最大縦横600px)"""
  largeThumbnailImageURL: String!
  largeThumbnailImageWidth: Int!

  """メイン画像のハッシュ値（同じ画像の重複投稿防止に使う）"""
  mainImageSha256: String!

  """Markdown URL"""
  mdUrl: String
  modelHash: String

  """モデル"""
  modelId: ID
  modelName: String
  negativePrompt: String
  noise: String

  """OGP画像URL"""
  ogpImageUrl: String
  otherGenerationParams: String
  pngInfo: String

  """生成情報"""
  prompt: String

  """年齢種別"""
  rating: Rating!

  """関連リンク"""
  relatedUrl: String

  """予約日"""
  reservedAt: Float
  sampler: String
  seed: String
  smallThumbnailImageHeight: Int!

  """小さいサムネイル画像(最大縦横400px)"""
  smallThumbnailImageURL: String!
  smallThumbnailImageWidth: Int!
  steps: String
  strength: String

  """お題ID"""
  subjectId: ID

  """タグ"""
  tags: [String!]

  """サムネイル位置"""
  thumbnailPosition: Float

  """題名"""
  title: String!

  """種別"""
  type: WorkType!

  """動画URL"""
  videoUrl: String

  """Cloudflare Stream の動画UID"""
  streamUid: String
}

input CreateWorkLikeInput {
  """匿名いいねにするかどうか"""
  isAnonymous: Boolean
  workId: ID!
}

"""顧客の宣伝情報一覧"""
type CustomerAdvertisementNode implements Node {
  """クリック回数"""
  clickCount: Int!

  """作成日"""
  createdAt: Int!

  """表示確率"""
  displayProbability: Int!

  """配信終了"""
  endAt: Int!
  id: ID!

  """画像URL"""
  imageUrl: String!

  """インプレッション数"""
  impressionCount: Int!

  """有効かどうか"""
  isActive: Boolean!

  """センシティブかどうか"""
  isSensitive: Boolean!

  """表示対象の画面"""
  page: CustomerAdvertisementType!

  """配信開始"""
  startAt: Int!

  """URL"""
  url: String!
}

"""顧客が管理する広告情報の並び順"""
enum CustomerAdvertisementOrderBy {
  """投稿日でソート"""
  DATE_CREATED

  """配信終了日でソート"""
  DATE_ENDED

  """配信開始日でソート"""
  DATE_STARTED

  """表示確立（優先度）でソート"""
  DISPLAY_PROBABILITY
}

"""広告表示対象画面の種類"""
enum CustomerAdvertisementType {
  """ホーム"""
  home

  """作品画面"""
  work
}

input CustomerAdvertisementsWhereInput {
  """開始日"""
  endAtAfter: String

  """有効かどうか"""
  isActive: Boolean

  """センシティブかどうか"""
  isSensitive: Boolean

  """ソート"""
  orderBy: CustomerAdvertisementOrderBy

  """昇順/降順"""
  sort: Sort

  """開始日"""
  startAtAfter: String
}

"""作品の日別テーマ"""
type DailyThemeNode implements Node {
  """日付"""
  dateText: String!

  """日にち"""
  day: Int!

  """作品"""
  firstWork: WorkNode
  id: ID!

  """月"""
  month: Int!

  """提案者"""
  proposer: UserNode

  """開始時刻"""
  startTime: Int!

  """タイトル"""
  title: String!

  """不明"""
  type: String!

  """作品"""
  works(limit: Int!, offset: Int!, where: UserWorksWhereInput): [WorkNode!]

  """作品数"""
  worksCount: Int!

  """年"""
  year: Int!
}

input DailyThemesWhereInput {
  day: Int
  endDate: String
  month: Int

  """ソート"""
  orderBy: ThemeOrderBy
  search: String

  """昇順/降順"""
  sort: Sort
  startDate: String
  year: Int
}

input DeleteAlbumInput {
  albumId: ID!
}

input DeleteAlbumLikeInput {
  albumId: ID!
}

input DeleteAlbumWorkInput {
  albumId: ID!
  workId: ID!
}

input DeleteCommentInput {
  commentId: ID!
}

input DeleteCommentLikeInput {
  commentId: ID!
}

input DeleteCustomerAdvertisementInput {
  ids: [ID!]!
}

input DeleteFolderInput {
  folderId: ID!
}

input DeleteFolderWorkInput {
  folderId: ID!
  workId: ID!
}

input DeleteImageGenerationMemoInput {
  nanoid: String!
}

input DeleteImageGenerationResultInput {
  nanoid: String!
}

input DeleteMaterialImageInput {
  """削除する素材画像のID"""
  materialId: ID!
}

input DeleteMessageInput {
  messageId: ID!
}

input DeleteNoteInput {
  noteId: ID!
}

input DeleteNovelInput {
  novelId: ID!
}

input DeleteRecommendedWorkInput {
  workId: ID!
}

input DeleteStickerInput {
  stickerId: ID!
}

input DeleteUserStickerInput {
  stickerId: ID!
}

input DeleteWorkInput {
  workId: ID!
}

input DeleteWorkLikeInput {
  workId: ID!
}

"""並び順"""
enum Direction {
  ASC
  DESC
}

type EmergencyAnnouncementNode {
  content: String!
  url: String!
}

input FeaturePromptonRequestWhereInput {
  userId: ID!
}

"""フィード"""
type FeedNode implements Node {
  """作成日"""
  createdAt: Int!

  """ID"""
  id: ID!

  """投稿一覧"""
  posts(limit: Int!, offset: Int!, where: FeedPostsWhereInput): [FeedPostNode!]!
}

"""フィードへの投稿"""
type FeedPostNode implements Node {
  """本文"""
  content: String!

  """作成日"""
  createdAt: Int!

  """ID"""
  id: ID!

  """作品"""
  work: WorkNode
}

"""フィードの投稿一覧の条件"""
input FeedPostsWhereInput {
  """この日付以降"""
  afterDate: String

  """年齢種別"""
  ratings: [Rating!]
}

"""フィード種別"""
enum FeedType {
  """フォロータグ"""
  FOLLOW_TAG

  """フォローユーザ"""
  FOLLOW_USER
}

input FeedWhereInput {
  """フィード種別"""
  type: FeedType

  """ユーザID"""
  userId: ID!
}

"""フォルダ"""
type FolderNode implements Node {
  """作成日"""
  createdAt: Int!

  """説明"""
  description: String!
  id: ID!

  """削除済み"""
  isDeleted: Boolean!

  """非公開である"""
  isPrivate: Boolean!

  """センシティブである"""
  isSensitive: Boolean!

  """ID"""
  nanoid: ID!

  """Open Graph 説明"""
  openGraphDescription: String

  """Open Graph 画像"""
  openGraphImageURL: String

  """Open Graph タイトル"""
  openGraphTitle: String

  """レーティング"""
  rating: Rating

  """シェア"""
  shareText: String

  """タグ一覧"""
  tags: [String!]

  """サムネイル画像"""
  thumbnailImageURL: String

  """タイトル"""
  title: String!

  """更新日"""
  updatedAt: Int!

  """ユーザ"""
  user: UserNode

  """ユーザID"""
  userId: ID

  """作品"""
  works(limit: Int!, offset: Int!): [WorkNode!]!

  """作品数"""
  worksCount: Int
}

"""フォルダの並び順"""
enum FolderOrderBy {
  """投稿時刻"""
  DATE_CREATED

  """名前"""
  NAME
}

"""フォルダの種類"""
enum FolderType {
  """ブックマーク"""
  BOOKMARK

  """非公開"""
  PRIVATE

  """公開"""
  PUBLIC

  """おすすめ"""
  RECOMMENDED
}

input FolderWhereInput {
  nanoid: String!
}

input FoldersWhereInput {
  isPrivate: Boolean
  isSensitive: Boolean

  """ソート"""
  orderBy: FolderOrderBy
  search: String

  """昇順/降順"""
  sort: Sort
  tags: [String!]
  type: FolderType
  userId: ID
}

"""通知（フォロー）"""
type FollowNotificationNode implements Node {
  createdAt: Int!
  id: ID!

  """種別"""
  type: String!

  """ユーザ"""
  user: UserNode
  userId: ID
}

"""タグをフォローする"""
input FollowTagInput {
  tagName: String!
}

input FollowUserInput {
  userId: ID!
}

"""フォロー（ユーザがフォローしているユーザ）の並び順"""
enum FolloweeOrderBy {
  """作成日でソート"""
  DATE_CREATED

  """フォロー日でソート"""
  DATE_FOLLOWED

  """投稿日でソート"""
  DATE_POSTED

  """更新日でソート"""
  DATE_UPDATED
}

input FolloweesWhereInput {
  """ソート"""
  orderBy: FolloweeOrderBy

  """昇順/降順"""
  sort: Sort
}

"""フォロワーの並び順"""
enum FollowerOrderBy {
  """作成日でソート"""
  DATE_CREATED

  """フォロー日でソート"""
  DATE_FOLLOWED

  """投稿日でソート"""
  DATE_POSTED

  """更新日でソート"""
  DATE_UPDATED
}

input FollowerWhereInput {
  """ソート"""
  orderBy: FollowerOrderBy

  """昇順/降順"""
  sort: Sort
}

input FollowersWhereInput {
  userId: Int!
}

input FollowingUsersWhereInput {
  userId: Int!
}

enum GeminiImageModel {
  """Gemini 2.5 Flash Image (Nano Banana)"""
  GEMINI_25_FLASH_IMAGE

  """Gemini 3.1 Flash Image Preview (Nano Banana 2)"""
  GEMINI_31_FLASH_IMAGE_PREVIEW
}

enum GeminiImageSize {
  """1280x720 (横長)"""
  LANDSCAPE

  """720x1280 (縦長)"""
  PORTRAIT

  """512x512 (小)"""
  SQUARE_512

  """768x768 (中)"""
  SQUARE_768

  """1024x1024 (大)"""
  SQUARE_1024
}

"""画像からコンテンツを生成するInput"""
input GenerateImageContentInput {
  """コンテンツ生成タイプ"""
  contentType: ImageContentType

  """コンテンツを生成する画像のURL"""
  imageUrl: String!

  """タグのみ生成するかどうか"""
  tagsOnly: Boolean
}

input GenerateUserEventContentInput {
  genre: String
  purpose: String
  rankingEnabled: Boolean
  rankingType: String
  tags: [String!]
  theme: String!
  tone: String
}

"""生成情報の公開設定"""
enum GenerationAccessType {
  """非公開"""
  PRIVATE

  """公開"""
  PUBLIC

  """公開（復元可能）"""
  PUBLIC_RESTORABLE
}

input HotWorksWhereInput {
  isSensitive: Boolean
}

"""画像から生成されたコンテンツ"""
type ImageContent {
  """生成された説明文（日本語）"""
  description: String

  """生成された説明文（英語）"""
  descriptionEn: String

  """生成されたタグ一覧（日本語）"""
  tags: [String!]

  """生成されたタグ一覧（英語）"""
  tagsEn: [String!]

  """生成されたタイトル（日本語）"""
  title: String

  """生成されたタイトル（英語）"""
  titleEn: String
}

enum ImageContentType {
  """キャラクターセリフ風"""
  CHARACTER

  """標準的な説明文"""
  STANDARD

  """ストーリー仕立て（デフォルト）"""
  STORY
}

type ImageGenerationEngineStatus {
  """通常の予測生成秒数"""
  normalPredictionGenerationWait: Int!

  """通常の生成タスク数"""
  normalTasksCount: Int!

  """優先1の予測生成秒数"""
  standardPredictionGenerationWait: Int!

  """優先1の生成タスク数"""
  standardTasksCount: Int!
}

"""画像生成ジョブ"""
type ImageGenerationJobNode implements Node {
  id: ID!
}

input ImageGenerationJobsWhereInput {
  isProtected: Boolean
}

"""画像生成メモ"""
type ImageGenerationMemoNode implements Node {
  clipSkip: Int!

  """作成時刻"""
  createdAt: Int

  """説明"""
  explanation: String!
  height: Int!
  id: ID!

  """削除済み"""
  isDeleted: Boolean!

  """モデル"""
  model: ImageGeneratorNode!
  nanoid: String!

  """ネガティブプロンプト"""
  negativePrompts: String!

  """プロンプト"""
  prompts: String!

  """サンプラー"""
  sampler: String!
  scale: Int!
  seed: Int!
  steps: Int!

  """タイトル"""
  title: String!

  """ユーザID"""
  userId: ID

  """VAE"""
  vae: String!
  width: Int!
}

input ImageGenerationMemoOrderBy {
  createdAt: Direction
}

"""予約済み画像生成"""
type ImageGenerationReservedTaskNode implements Node {
  clipSkip: Int!

  """ControlNetの設定"""
  controlNetControlMode: String
  controlNetEnabled: Boolean
  controlNetGuidance: Float
  controlNetGuidanceEnd: Float
  controlNetGuidanceStart: Float
  controlNetHrOption: String
  controlNetModel: String
  controlNetModule: String
  controlNetPixelPerfect: Boolean
  controlNetProcessorRes: Int
  controlNetResizeMode: String
  controlNetSaveDetectedMap: Boolean
  controlNetThresholdA: Int
  controlNetThresholdB: Int
  controlNetWeight: Float

  """予約開始した時刻"""
  createdAt: Int

  """生成の方式"""
  generationType: ImageGenerationType!
  height: Int!
  id: ID!

  """削除済み"""
  isDeleted: Boolean!

  """生成済み"""
  isGenerated: Boolean!
  model: ImageGeneratorNode!
  nanoid: String
  negativePrompt: String!
  prompt: String!
  sampler: String!
  scale: Int!
  seed: Float!
  sizeType: ImageGenerationSizeType!
  steps: Int!
  t2tDenoisingStrengthSize: String
  t2tImageUrl: String
  t2tInpaintingFillSize: String
  t2tMaskImageUrl: String

  """Token"""
  token: String

  """アップスケールサイズ(x2, x4, x8)"""
  upscaleSize: Float
  vae: String
  width: Int!
}

"""画像生成"""
type ImageGenerationResultNode implements Node {
  clipSkip: Int!

  """生成が完了した時刻"""
  completedAt: Int

  """ControlNetの設定"""
  controlNetControlMode: String
  controlNetEnabled: Boolean
  controlNetGuidance: Float
  controlNetGuidanceEnd: Float
  controlNetGuidanceStart: Float
  controlNetHrOption: String
  controlNetModel: String
  controlNetModule: String
  controlNetPixelPerfect: Boolean
  controlNetProcessorRes: Int
  controlNetResizeMode: String
  controlNetSaveDetectedMap: Boolean
  controlNetThresholdA: Int
  controlNetThresholdB: Int
  controlNetWeight: Float

  """予想生成秒数"""
  estimatedSeconds: Int

  """生成の方式"""
  generationType: ImageGenerationType!
  height: Int!
  id: ID!

  """画像ファイル名"""
  imageFileName: String
  imageUrl: String

  """保護済みかどうか"""
  isProtected: Boolean
  model: ImageGeneratorNode!
  modelHash: String
  nanoid: String
  negativePrompt: String!

  """画像投稿時に設定できるモデル識別子"""
  postModelId: String
  prompt: String!
  promptsText: String

  """お気に入り度"""
  rating: Int
  sampler: String!
  scale: Int!
  seed: Float!
  sizeKind: ImageGenerationSizeKind!
  sizeType: ImageGenerationSizeType!

  """生成状態"""
  status: ImageGenerationStatus!
  steps: Int!
  t2tDenoisingStrengthSize: String
  t2tImageUrl: String
  t2tInpaintingFillSize: String
  t2tMaskImageUrl: String
  thumbnailImageFileName: String
  thumbnailToken: String
  thumbnailUrl: String
  token: String

  """アップスケールサイズ(x2, x4, x8)"""
  upscaleSize: Float
  vae: String
  width: Int!
}

input ImageGenerationResultsWhereInput {
  dateText: String
  fromDate: String
  isProtected: Boolean
  minRating: Int

  """Nanoid一覧"""
  nanoids: [String!]
  rating: Int
}

"""画像生成のサイズの種類"""
enum ImageGenerationSizeKind {
  LANDSCAPE
  PORTRAIT
  SQUARE
  TALL_PORTRAIT
  WIDE_LANDSCAPE
}

"""画像生成のサイズ"""
enum ImageGenerationSizeType {
  """SD1 384x960"""
  SD1_384_960

  """SD1 512x512"""
  SD1_512_512

  """SD1 512x768"""
  SD1_512_768

  """SD1 768x512"""
  SD1_768_512

  """SD1_960_384"""
  SD1_960_384

  """SD2 576x1440"""
  SD2_576_1440

  """SD2 768x768"""
  SD2_768_768

  """SD2 768x1152"""
  SD2_768_1152

  """SD2 768x1200"""
  SD2_768_1200

  """SD2 1152x768"""
  SD2_1152_768

  """SD2 1200x768"""
  SD2_1200_768

  """SD2 1440x576"""
  SD2_1440_576

  """SD3 640x1536"""
  SD3_640_1536

  """SD3 832x1216"""
  SD3_832_1216

  """SD3 896x896"""
  SD3_896_896

  """SD3 896x1152"""
  SD3_896_1152

  """SD3 960x384"""
  SD3_960_384

  """SD3 1024x1024"""
  SD3_1024_1024

  """SD3 1152x896"""
  SD3_1152_896

  """SD3 1152x1152"""
  SD3_1152_1152

  """SD3 1216x832"""
  SD3_1216_832

  """SD3 1216x1216"""
  SD3_1216_1216

  """SD3 1536x640"""
  SD3_1536_640

  """SD4 896x896"""
  SD4_896_896

  """SD4 896x1152"""
  SD4_896_1152

  """SD4 1152x896"""
  SD4_1152_896

  """SD5 512x512"""
  SD5_512_512

  """SD5 720x1280"""
  SD5_720_1280

  """SD5 768x768"""
  SD5_768_768

  """SD5 1024x1024"""
  SD5_1024_1024
}

"""画像生成の状態"""
enum ImageGenerationStatus {
  """キャンセル済み"""
  CANCELED

  """完了"""
  DONE

  """エラー"""
  ERROR

  """処理中"""
  IN_PROGRESS

  """保留"""
  PENDING

  """予約"""
  RESERVED
}

"""画像生成"""
type ImageGenerationTaskNode implements Node {
  clipSkip: Int!

  """生成が完了した時刻"""
  completedAt: Int

  """ControlNetの設定"""
  controlNetControlMode: String
  controlNetEnabled: Boolean
  controlNetGuidance: Float
  controlNetGuidanceEnd: Float
  controlNetGuidanceStart: Float
  controlNetHrOption: String
  controlNetModel: String
  controlNetModule: String
  controlNetPixelPerfect: Boolean
  controlNetProcessorRes: Int
  controlNetResizeMode: String
  controlNetSaveDetectedMap: Boolean
  controlNetThresholdA: Int
  controlNetThresholdB: Int
  controlNetWeight: Float
  count: Int!

  """予想生成秒数"""
  estimatedSeconds: Int

  """生成の方式"""
  generationType: ImageGenerationType!
  height: Int!
  id: ID!

  """画像ファイル名"""
  imageFileName: String
  imageUrl: String

  """削除済み"""
  isDeleted: Boolean!

  """保護済みかどうか"""
  isProtected: Boolean
  model: ImageGeneratorNode!
  nanoid: String
  negativePrompt: String!
  prompt: String!
  promptsText: String

  """お気に入り度"""
  rating: Int
  sampler: String!
  scale: Int!
  seed: Float!
  sizeKind: ImageGenerationSizeKind!
  sizeType: ImageGenerationSizeType!

  """生成状態"""
  status: ImageGenerationStatus!
  steps: Int!
  t2tDenoisingStrengthSize: String
  t2tImageUrl: String
  t2tInpaintingFillSize: String
  t2tMaskImageUrl: String
  thumbnailImageFileName: String
  thumbnailToken: String
  thumbnailUrl: String
  token: String

  """アップスケールサイズ(x2, x4, x8)"""
  upscaleSize: Float
  vae: String
  width: Int!
}

input ImageGenerationTasksWhereInput {
  dateText: String
  fromDate: String
  isProtected: Boolean
  minRating: Int
  rating: Int

  """UUID一覧"""
  uuids: [String!]
}

"""画像生成の種類"""
enum ImageGenerationType {
  """画像から"""
  IMAGE_TO_IMAGE

  """画像から"""
  INPAINTING

  """テキストから"""
  TEXT_TO_IMAGE
}

"""画像生成サービス"""
type ImageGeneratorNode implements Node {
  id: ID!

  """名前"""
  name: String!

  """推奨プロンプト"""
  recommendedPrompt: String!

  """SD種別（SD1, SD2, SDXL）"""
  type: String!
}

"""画像生成LoRA"""
type ImageLoraModelNode implements Node {
  """説明"""
  description: String

  """種別"""
  genre: String
  id: ID!

  """新しいかどうか"""
  isNew: Boolean!

  """ライセンス"""
  license: String

  """名前"""
  name: String!

  """プロンプト"""
  prompts: [String!]!

  """コード"""
  slug: String!

  """サムネイル画像のURL"""
  thumbnailImageURL: String

  """トリガーワード"""
  triggerWord: String
}

"""AIモデルの種類"""
enum ImageModelCategory {
  """獣"""
  ANIMAL

  """少女アニメ"""
  ANIME_GIRL

  """背景"""
  BACKGROUND

  """グラビア"""
  BIKINI_MODEL

  """フィギュア"""
  FIGURE

  """男子イラスト"""
  ILLUSTRATION_BOY

  """少女イラスト"""
  ILLUSTRATION_GIRL

  """汎用"""
  UNIVERSAL
}

"""画像生成モデル"""
type ImageModelNode implements Node {
  """カテゴリ"""
  category: ImageModelCategory!

  """説明"""
  description: String

  """表示名"""
  displayName: String!

  """モデルの説明"""
  explanation: String!
  id: ID!

  """新しいかどうか"""
  isNew: Boolean!

  """ライセンス"""
  license: String

  """モデル名"""
  modelName: String!

  """名前"""
  name: String!

  """プロンプト"""
  prompts: [String!]!

  """コード"""
  slug: String!

  """スタイル"""
  style: ImageStyle!

  """サムネイル画像"""
  thumbnailImageURL: String

  """StableDiffusionの種類"""
  type: String!

  """参考作品"""
  works(limit: Int!, offset: Int!, where: WorksWhereInput): [WorkNode!]!
}

input ImageModelWhereInput {
  """ID"""
  id: [ID!]

  """モデル名(空白は詰める)"""
  name: String
}

"""画像"""
type ImageNode implements Node {
  """ダウンロードURL"""
  downloadURL: String!
  id: ID!

  """種類"""
  type: String!
}

"""投稿（画像）"""
type ImagePostNode implements Node {
  """閲覧権限の種類"""
  accessType: AccessType!

  """運営による閲覧権限の種類"""
  adminAccessType: AdminAccessType!

  """シリーズ情報"""
  album: AlbumNode

  """ブックマーク数"""
  bookmarksCount: Int!

  """clipSkip"""
  clipSkip: Int

  """コメント"""
  comment(id: ID!): CommentNode!

  """コメント"""
  comments(limit: Int!, offset: Int!): [CommentNode!]!

  """コメント数"""
  commentsCount: Int!

  """作成日"""
  createdAt: Int!

  """デイリーランキング"""
  dailyRanking: Int

  """テーマ"""
  dailyTheme: DailyThemeNode

  """説明"""
  description: String

  """説明(英語)"""
  enDescription: String

  """タイトル(英語)"""
  enTitle: String

  """生成情報公開設定"""
  generationAccessType: GenerationAccessType!

  """生成機で生成した場合のモデルID"""
  generationModelId: ID
  id: ID!

  """画像"""
  image: ImageNode @deprecated(reason: "廃止")

  """画像の比率"""
  imageAspectRatio: Float!

  """画像の高さ"""
  imageHeight: Int!

  """画像ID"""
  imageId: ID! @deprecated(reason: "廃止")

  """画像URL"""
  imageURL: String!

  """画像の幅"""
  imageWidth: Int!

  """ブックマークしている"""
  isBookmarked: Boolean!

  """コメント編集許可"""
  isCommentsEditable: Boolean!

  """削除済み"""
  isDeleted: Boolean!

  """生成画像でプロンプト公開作品かどうか"""
  isGeneration: Boolean!

  """コレクションに追加している"""
  isInCollection: Boolean!

  """いいねしている"""
  isLiked: Boolean!

  """自分自身が推薦しているかどうか"""
  isMyRecommended: Boolean!

  """プロモーション作品かどうか"""
  isPromotion: Boolean!

  """センシティブである"""
  isSensitive: Boolean!

  """タグ編集許可"""
  isTagEditable: Boolean!

  """画像（大）の高さ"""
  largeThumbnailImageHeight: Int!

  """画像（大）のURL"""
  largeThumbnailImageURL: String!

  """画像（大）の幅"""
  largeThumbnailImageWidth: Int!

  """いいねしたユーザ一覧"""
  likedUsers(limit: Int!, offset: Int!): [UserNode!]!

  """いいね数"""
  likesCount: Int!

  """画像生成関連の設定"""
  model: String

  """画像生成関連の設定"""
  modelHash: String

  """マンスリーランキング"""
  monthlyRanking: Int

  """ネガティブプロンプト"""
  negativePrompt: String

  """次の作品"""
  nextPost: ImagePostNode

  """画像生成関連の設定"""
  noise: String

  """OGP画像URL"""
  ogpThumbnailImageUrl: String

  """Open Graph 説明"""
  openGraphDescription: String

  """Open Graph 画像"""
  openGraphImageURL: String

  """Open Graph タイトル"""
  openGraphTitle: String

  """その他の画像生成関連の設定"""
  otherGenerationParams: String

  """pngInfo"""
  pngInfo: String

  """前の作品"""
  previousPost: ImagePostNode

  """プロンプト"""
  prompt: String

  """プロンプトの閲覧権限の種類"""
  promptAccessType: AccessType!

  """年齢制限"""
  rating: Rating

  """関連するタグ"""
  relatedTags(limit: Int!, offset: Int!): [TagNode!]!

  """関連URL"""
  relatedUrl: String

  """関連する作品"""
  relatedWorks(limit: Int!, offset: Int!): [ImagePostNode!]!

  """画像生成関連の設定"""
  sampler: String

  """画像生成関連の設定"""
  scale: Int

  """シード値"""
  seed: Float

  """シェア"""
  shareText: String

  """画像（小）の高さ"""
  smallThumbnailImageHeight: Int!

  """画像（小）のURL"""
  smallThumbnailImageURL: String!

  """画像（小）の幅"""
  smallThumbnailImageWidth: Int!

  """画像生成関連の設定"""
  steps: Int

  """画像生成関連の設定"""
  strength: String

  """テイスト"""
  style: ImageStyle!

  """作品"""
  subPosts: [SubWorkNode!]!

  """複数画像数"""
  subPostsCount: Int!

  """タグ名"""
  tagNames: [String!]!
  tags: [TagNode!]!

  """サムネイル画像の位置"""
  thumbnailImagePosition: Float

  """タイトル"""
  title: String!

  """更新日"""
  updatedAt: Int!

  """ユーザ"""
  user: UserNode!

  """ユーザID"""
  userId: ID!

  """VAE"""
  vae: String

  """閲覧数"""
  viewsCount: Int!

  """ウィークリーランキング"""
  weeklyRanking: Int

  """作品投稿時に選択したモデルID"""
  workModelId: Int
}

"""画像のスタイル"""
enum ImageStyle {
  """イラスト"""
  ILLUSTRATION

  """リアル"""
  REAL

  """セミリアル"""
  SEMI_REAL
}

"""いいねしたユーザの絞り込み条件"""
input LikedUsersWhereInput {
  """作品ID"""
  workId: ID!
}

"""通知（いいねされた作品）"""
type LikedWorkNotificationNode implements Node {
  """時刻"""
  createdAt: Int!
  id: ID!

  """匿名かどうか"""
  isAnonymous: Boolean!

  """種別"""
  type: String!

  """いいねしたユーザ"""
  user: UserNode
  userId: ID

  """作品"""
  work: WorkNode
  workId: ID
}

"""通知（作品のいいね集計）"""
type LikedWorksSummaryNotificationNode implements Node {
  """時刻"""
  createdAt: Int!
  id: ID!

  """メッセージ"""
  message: String

  """種別"""
  type: String!
}

"""ユーザープロバイダーを紐付けるInput"""
input LinkUserProviderInput {
  """プロバイダーID (google.com, twitter.com など)"""
  providerId: String!

  """プロバイダーのユーザーID"""
  providerUserUid: String!
}

type LoginResult {
  token: String!
}

input LoginWithPasswordInput {
  login: String!
  password: String!
}

input LoginWithWordPressTokenInput {
  token: String!
}

type MaintenanceStatusNode {
  isMaintenanceModeWeb: Boolean!
  maintenanceMessageWeb: String!
}

"""素材画像"""
type MaterialImageNode {
  """作成日時"""
  createdAt: String!

  """ID"""
  id: ID!

  """画像URL"""
  imageUrl: String!
}

"""メッセージ"""
type MessageNode implements Node {
  createdAt: Int!
  id: ID!

  """自身のメッセージである"""
  isMine: Boolean!

  """既読済みである"""
  isRead: Boolean!

  """自身である"""
  isViewer: Boolean! @deprecated(reason: "isMine")

  """メッセージ"""
  text: String

  """送信者"""
  user: UserNode!
}

"""メッセージのスレッド"""
type MessageThreadNode implements Node {
  id: ID!
  latestMessage: MessageNode!
  messages(limit: Int!, offset: Int!): [MessageNode!]!
  recipient: UserNode!
  updatedAt: Int!
}

"""マイルストーン"""
type MilestoneNode implements Node {
  description: String!
  dueDate: String
  id: ID!
  isDone: Boolean!
  pageURL: String!
  title: String!
  version: String!
}

input MilestonesWhereInput {
  repository: String!
}

"""モデレーターによる通知一覧"""
type ModerationReportNode implements Node {
  """作成日"""
  createdAt: Int!

  """任意メッセージ"""
  customMessage: String
  id: ID!

  """既読済みかどうか"""
  isRead: Boolean!

  """通知したユーザ"""
  ownerUser: UserNode

  """通知定型メッセージ"""
  reportMessage: String

  """対応メッセージ"""
  responseMessage: String

  """対応状況"""
  status: ModerationReportStatus

  """お知らせ対象のユーザ"""
  targetUser: UserNode

  """作品"""
  work: WorkNode
}

"""対応ステータス"""
enum ModerationReportStatus {
  """要対応"""
  DONE

  """対応不要"""
  NO_NEED_ACTION

  """未対応"""
  UNHANDLED
}

"""投稿（旧）の並び順"""
enum ModerationReportsOrderBy {
  """投稿日でソート"""
  DATE_CREATED
}

"""モデレーターによる通知一覧"""
input ModerationReportsWhereInput {
  """対応済み"""
  isCompleted: Boolean

  """既読"""
  isRead: Boolean

  """ソート"""
  orderBy: ModerationReportsOrderBy

  """昇順/降順"""
  sort: Sort

  """ユーザID"""
  userId: ID
}

type Mutation {
  """コメント審査への異議申し立てを送信する"""
  appealCommentModeration(input: AppealCommentModerationInput!): Boolean!

  """ユーザをブロックする"""
  blockUser(input: BlockUserInput!): UserNode!

  """予約生成をキャンセルする"""
  cancelImageGenerationReservedTask(input: CancelImageGenerationReservedTaskInput!): ImageGenerationTaskNode!

  """生成をキャンセルする"""
  cancelImageGenerationTask(input: CancelImageGenerationTaskInput!): ImageGenerationTaskNode!

  """お題提案を取り消す"""
  cancelThemeProposal(proposalId: ID!): ThemeProposalNode!

  """管理者権限で作品の設定を変更する"""
  changeWorkSettingsWithAdmin(input: WorkSettingsWithAdminInput!): Boolean

  """アカウントを作成する"""
  createAccount(input: CreateAccountInput!): UserNode!

  """ユーザの最新メッセージに対してAI自動応答を生成する"""
  createAiMessageResponse: MessageNode!

  """シリーズを作成する"""
  createAlbum(input: CreateAlbumInput!): AlbumNode!

  """シリーズにいいねする"""
  createAlbumLike(input: CreateAlbumLikeInput!): AlbumNode!

  """フォルダに作品を追加する"""
  createAlbumWork(input: CreateAlbumWorkInput!): WorkNode!

  """キャラクターを作成する"""
  createCharacter(input: CreateCharacterInput!): CharacterNode!

  """キャラクターの単一表情を生成する"""
  createCharacterExpression(input: CreateCharacterExpressionInput!): CharacterExpressionNode!

  """キャラクター表情差分を一括生成する"""
  createCharacterExpressionBatchGenerationTask(input: CreateCharacterExpressionBatchGenerationTaskInput!): CharacterExpressionBatchResult!

  """キャラクターを自動作成して表情差分を生成する"""
  createCharacterWithExpressions(input: CreateCharacterWithExpressionsInput!): CharacterWithExpressionsResult!

  """作品のコメントをいいねする"""
  createCommentLike(input: CreateCommentLikeInput!): CommentNode!

  """広告作成"""
  createCustomerAdvertisement(input: CreateCustomerAdvertisement!): CustomerAdvertisementNode!

  """カスタマーポータルのURLを作成する"""
  createCustomerPortalSession: String!

  """Fluxの画像生成のタスクを作成する"""
  createDemoFluxImageGenerationTask(input: CreateFluxImageGenerationTaskInput!): ImageGenerationTaskNode

  """画像から複数の表情差分を生成する"""
  createExpressionsFromImage(input: CreateExpressionsFromImageInput!): CharacterExpressionBatchResult!

  """Fluxの画像生成のタスクを作成する"""
  createFluxImageGenerationTask(input: CreateFluxImageGenerationTaskInput!): ImageGenerationTaskNode

  """フォルダに作品を追加する"""
  createFolder(input: CreateFolderInput!): FolderNode!

  """フォルダに作品を追加する"""
  createFolderWork(input: CreateFolderWorkInput!): WorkNode!

  """Gemini画像生成のタスクを作成・実行する"""
  createGeminiImageGenerationTask(input: CreateGeminiImageGenerationTaskInput!): ImageGenerationResultNode!

  """画像生成のメモを作成する"""
  createImageGenerationMemo(input: CreateImageGenerationMemoInput!): ImageGenerationMemoNode!

  """画像生成のタスクを作成する"""
  createImageGenerationTask(input: CreateImageGenerationTaskInput!): ImageGenerationTaskNode!

  """メッセージを作成する"""
  createMessage(input: CreateMessageInput!): MessageNode!

  """コラムを作成する"""
  createNote(input: CreateNoteInput!): NoteNode!

  """小説を作成する"""
  createNovel(input: CreateNovelInput!): NovelNode!

  """パスのチェックアウトのURLを作成する"""
  createPassCheckoutSession(input: CreatePassCheckoutSessionInput): String!

  """推薦作品を作成する"""
  createRecommendedWork(input: CreateRecommendedWorkInput!): WorkNode!

  """予約画像生成のタスクを作成する"""
  createReservedImageGenerationTask(input: CreateReservedImageGenerationTaskInput!): ImageGenerationReservedTaskNode!

  """リプライのコメントを作成する"""
  createResponseComment(input: CreateResponseCommentInput!): CommentNode!

  """スタンプを作成する"""
  createSticker(input: CreateStickerInput!): StickerNode!

  """お題提案を作成する"""
  createThemeProposal(allowOtherDate: Boolean, date: String!, note: String, theme: String!): ThemeProposalNode!

  """お題提案にいいねする"""
  createThemeProposalLike(proposalId: ID!): ThemeProposalNode!

  """ユーザーイベントを作成する"""
  createUserEvent(input: CreateUserEventInput!): UserEventNode

  """ユーザ情報が存在するかチェックして存在しない場合は作成する"""
  createUserInfo: UserNode!

  """マイスタンプを追加する"""
  createUserSticker(input: CreateUserStickerInput!): StickerNode!

  """作品を作成する"""
  createWork(input: CreateWorkInput!): WorkNode!

  """作品のコメントを作成する"""
  createWorkComment(input: CreateWorkCommentInput!): CommentNode!

  """作品のスキを作成する"""
  createWorkLike(input: CreateWorkLikeInput!): WorkNode!

  """シリーズを削除する"""
  deleteAlbum(input: DeleteAlbumInput!): AlbumNode!

  """シリーズのいいねを外す"""
  deleteAlbumLike(input: DeleteAlbumLikeInput!): AlbumNode!

  """シリーズから作品を削除する"""
  deleteAlbumWork(input: DeleteAlbumWorkInput!): WorkNode!

  """キャラクターを削除する"""
  deleteCharacter(
    """キャラクターID"""
    characterId: String!
  ): Boolean!

  """キャラクター表情を削除する"""
  deleteCharacterExpression(
    """表情ID"""
    expressionId: String!
  ): Boolean!

  """作品のコメントを削除する"""
  deleteComment(input: DeleteCommentInput!): CommentNode!

  """作品のコメントのいいねを削除する"""
  deleteCommentLike(input: DeleteCommentLikeInput!): CommentNode!

  """広告を削除する"""
  deleteCustomerAdvertisement(input: DeleteCustomerAdvertisementInput!): Boolean!

  """シリーズを削除する"""
  deleteFolder(input: DeleteFolderInput!): FolderNode!

  """フォルダから作品を削除する"""
  deleteFolderWork(input: DeleteFolderWorkInput!): FolderNode

  """生成メモを削除する"""
  deleteImageGenerationMemo(input: DeleteImageGenerationMemoInput!): ImageGenerationMemoNode!

  """生成履歴を削除する"""
  deleteImageGenerationResult(input: DeleteImageGenerationResultInput!): ImageGenerationResultNode!

  """素材画像を削除する（論理削除）"""
  deleteMaterialImage(input: DeleteMaterialImageInput!): MaterialImageNode!

  """メッセージを削除する"""
  deleteMessage(input: DeleteMessageInput!): MessageNode!

  """コラムを削除する"""
  deleteNote(input: DeleteNoteInput!): NoteNode!

  """小説を削除する"""
  deleteNovel(input: DeleteNovelInput!): NovelNode!

  """推薦作品を削除する"""
  deleteRecommendedWork(input: DeleteRecommendedWorkInput!): Boolean!

  """予約生成履歴を削除する"""
  deleteReservedImageGenerationTasks: [ImageGenerationReservedTaskNode]!

  """スタンプを削除する"""
  deleteSticker(input: DeleteStickerInput!): StickerNode!

  """お題提案のいいねを取り消す"""
  deleteThemeProposalLike(proposalId: ID!): ThemeProposalNode!

  """ユーザースタンプを削除する"""
  deleteUserSticker(input: DeleteUserStickerInput!): StickerNode!

  """作品を削除する"""
  deleteWork(input: DeleteWorkInput!): WorkNode!

  """作品のスキを削除する"""
  deleteWorkLike(input: DeleteWorkLikeInput!): WorkNode!

  """タグをフォローする"""
  followTag(input: FollowTagInput!): Boolean!

  """ユーザをフォローする"""
  followUser(input: FollowUserInput!): UserNode!

  """画像からタイトル、説明文、タグを生成する"""
  generateImageContent(input: GenerateImageContentInput!): ImageContent!

  """イベントのタイトルや説明文の候補を生成する"""
  generateUserEventContent(input: GenerateUserEventContentInput!): UserEventContentNode!

  """プロフィールを初期設定したかどうか"""
  isInitializedUserProfile: Boolean!

  """SNSプロバイダーをユーザーに紐付ける"""
  linkUserProvider(input: LinkUserProviderInput!): UserProviderNode!

  """パスワードでログインする"""
  loginWithPassword(input: LoginWithPasswordInput!): LoginResult!

  """WordPressのトークンでログインする"""
  loginWithWordPressToken(input: LoginWithWordPressTokenInput!): LoginResult!

  """タグをミュートする"""
  muteTag(input: MuteTagInput!): MutedTagNode

  """ユーザをミュートする"""
  muteUser(input: MuteUserInput!): UserNode!

  """キャラクターの表情を再生成する"""
  regenerateCharacterExpression(input: RegenerateCharacterExpressionInput!): CharacterExpressionNode!

  """シリーズを報告する"""
  reportAlbum(input: ReportAlbumInput!): Boolean

  """コメントを報告する"""
  reportComment(input: ReportCommentInput!): Boolean

  """フォルダを報告する"""
  reportFolder(input: ReportFolderInput!): Boolean

  """スタンプを報告する"""
  reportSticker(input: ReportStickerInput!): Boolean

  """ユーザを報告する"""
  reportUser(input: ReportUserInput!): Boolean

  """ユーザーイベントを通報する"""
  reportUserEvent(input: ReportUserEventInput!): Boolean

  """作品を報告する"""
  reportWork(input: ReportWorkInput!): Boolean

  """作品にBot採点機能をリクエストする"""
  requestWorkBotGrading(input: RequestWorkBotGradingInput!): WorkNode!

  """モデレータによるコメント審査の承認・却下・差し戻し"""
  reviewCommentModeration(input: ReviewCommentModerationInput!): Boolean!

  """SMS認証コードを送信する"""
  sendSmsVerification(input: SendSmsVerificationInput!): Boolean!

  """ユーザのフォローを解除する"""
  signImageGenerationTerms(input: SignImageGenerationTermsInput!): UserNode!

  """スタンプの公開状態を切り替える"""
  toggleStickerAccessType(input: ToggleStickerAccessTypeInput!): StickerNode!

  """ユーザのコメントBAN状態を切り替える"""
  toggleUserCommentBan(input: ToggleUserCommentBanInput!): Boolean!

  """ユーザの投稿BAN状態を切り替える"""
  toggleUserPostBan(input: ToggleUserPostBanInput!): Boolean!

  """ユーザのブロックを解除する"""
  unblockUser(input: UnblockUserInput!): UserNode!

  """タグをフォロー解除する"""
  unfollowTag(input: UnfollowTagInput!): Boolean!

  """ユーザのフォローを解除する"""
  unfollowUser(input: UnfollowUserInput!): UserNode!

  """SNSプロバイダーをユーザーから紐付け解除する"""
  unlinkUserProvider(input: UnlinkUserProviderInput!): Boolean!

  """タグのミュートを解除する"""
  unmuteTag(input: UnmuteTagInput!): TagNode!

  """ユーザのミュートを解除する"""
  unmuteUser(input: UnmuteUserInput!): UserNode!

  """シリーズのお気に入りを解除する"""
  unwatchAlbum(input: UnwatchAlbumInput!): AlbumNode!

  """フォルダのウォッチを解除する"""
  unwatchFolder(input: UnwatchFolderInput!): UserNode!

  """アカウントのFCMトークンを変更する"""
  updateAccountFcmToken(input: UpdateAccountFcmTokenInput!): UserNode!

  """アカウントのパスワードを変更する"""
  updateAccountInitialPassword(input: UpdateAccountInitialPasswordInput!): UserNode!

  """アカウントのログインIDを作成する"""
  updateAccountLogin(input: UpdateAccountLoginInput!): UserNode!

  """アカウントのパスワードを変更する"""
  updateAccountPassword(input: UpdateAccountPasswordInput!): UserNode!

  """アカウントのWebFCMトークンを変更する"""
  updateAccountWebFcmToken(input: UpdateAccountWebFcmTokenInput!): UserNode!

  """シリーズを更新する"""
  updateAlbum(input: UpdateAlbumInput!): AlbumNode!

  """お気に入りスタンプを更新する"""
  updateBookmarkedSticker(input: UpdateBookmarkedStickerInput!): StickerNode

  """広告クリック数カウントアップ"""
  updateClickedCountCustomerAdvertisement(id: ID!): CustomerAdvertisementNode!

  """広告更新"""
  updateCustomerAdvertisement(input: UpdateCustomerAdvertisement!): CustomerAdvertisementNode!

  """シリーズを更新する"""
  updateFolder(input: UpdateFolderInput!): FolderNode!

  """画像生成のメモを変更する"""
  updateImageGenerationMemo(input: UpdateImageGenerationMemoInput!): ImageGenerationMemoNode!

  """ログイン時間を更新する"""
  updateLoggedInAt: Boolean!

  """ノートを更新する"""
  updateNote(input: UpdateNoteInput!): NoteNode!

  """小説を更新する"""
  updateNovel(input: UpdateNovelInput!): NovelNode!

  """画像生成のタスクの保護を変更する"""
  updateProtectedImageGenerationResult(input: UpdateProtectedImageGenerationResultInput!): ImageGenerationResultNode!

  """画像生成のモデルのレーティングを変更する"""
  updateRatingImageGenerationModel(input: UpdateRatingImageGenerationModelInput!): UserSettingNode!

  """画像生成のタスクのレーティングを変更する"""
  updateRatingImageGenerationResult(input: UpdateRatingImageGenerationResultInput!): ImageGenerationResultNode!

  """スタンプを更新する"""
  updateSticker(input: UpdateStickerInput!): StickerNode!

  """ユーザーイベントを更新する"""
  updateUserEvent(input: UpdateUserEventInput!): UserEventNode

  """ユーザーイベントの公開状態を更新する"""
  updateUserEventStatus(input: UpdateUserEventStatusInput!): UserEventNode

  """ユーザのプロフィールを作成する"""
  updateUserProfile(input: UpdateUserProfileInput!): UserNode!

  """ユーザの設定を更新する"""
  updateUserSetting(input: UpdateUserSettingInput!): UserSettingNode!

  """作品を更新する"""
  updateWork(input: UpdateWorkInput!): WorkNode!

  """作品のタグを更新する"""
  updateWorkTags(input: UpdateWorkTagsInput!): WorkNode!

  """素材画像をアップロードする"""
  uploadMaterialImage(input: UploadMaterialImageInput!): MaterialImageNode!

  """シリーズをお気に入り登録する"""
  watchAlbum(input: WatchAlbumInput!): AlbumNode!

  """フォルダをウォッチする"""
  watchFolder(input: WatchFolderInput!): FolderNode!

  """ログイン中のアカウントを退会する"""
  withdrawAccount: Boolean!
}

input MuteTagInput {
  tagName: String!
}

input MuteUserInput {
  userId: ID!
}

"""ミュートタグ"""
type MutedTagNode implements Node {
  id: ID!

  """名前"""
  name: String!
}

"""新着コメント"""
type NewCommentNode implements Node {
  """コメント"""
  comment: CommentNode

  """作成日"""
  createdAt: Int!
  id: ID!

  """年齢制限"""
  rating: Rating

  """スタンプ"""
  sticker: StickerNode

  """ユーザ"""
  user: UserNode
  userId: ID

  """作品"""
  work: WorkNode
}

input NewCommentsWhereInput {
  """スタンプ単体コメントで重複ユーザーを除去する"""
  deduplicateStickerOnlyComments: Boolean

  """センシティブである"""
  isSensitive: Boolean

  """スタンプのみのコメントに絞る"""
  isStickerOnly: Boolean

  """テキストのみのコメントに絞る"""
  isTextOnly: Boolean

  """年齢種別"""
  ratings: [Rating!]
}

input NewPostedUsersWhereInput {
  isSensitive: Boolean
}

input NewUsersWorksWhereInput {
  """フォロー中のユーザのみ"""
  isFollowing: Boolean

  """フォロー外のユーザのみ"""
  isNotFollowing: Boolean

  """(〜)最新の日付"""
  isNowCreatedAt: Boolean
  isSensitive: Boolean

  """年齢種別"""
  ratings: [Rating!]

  """昇順/降順"""
  sort: Sort

  """スタイル(テイスト)"""
  style: ImageStyle

  """お題"""
  subjectId: Int
}

"""ノード"""
interface Node {
  id: ID!
}

"""ノート"""
type NoteNode implements Node {
  createdAt: Int!
  id: ID!
  user: UserNode!
}

"""投稿（ノート）"""
type NotePostNode implements Node {
  """閲覧権限の種類"""
  accessType: AccessType!

  """運営による閲覧権限の種類"""
  adminAccessType: AdminAccessType!

  """シリーズ情報"""
  album: AlbumNode

  """ブックマーク数"""
  bookmarksCount: Int!

  """コメント"""
  comment(id: ID!): CommentNode!

  """コメント"""
  comments(limit: Int!, offset: Int!): [CommentNode!]!

  """コメント数"""
  commentsCount: Int!

  """作成日"""
  createdAt: Int!

  """デイリーランキング"""
  dailyRanking: Int

  """テーマ"""
  dailyTheme: DailyThemeNode

  """説明"""
  description: String

  """説明(英語)"""
  enDescription: String

  """タイトル(英語)"""
  enTitle: String
  id: ID!

  """画像"""
  image: ImageNode @deprecated(reason: "廃止")

  """画像の比率"""
  imageAspectRatio: Float!

  """画像の高さ"""
  imageHeight: Int!

  """画像ID"""
  imageId: ID! @deprecated(reason: "廃止")

  """画像URL"""
  imageURL: String!

  """画像の幅"""
  imageWidth: Int!

  """ブックマークしている"""
  isBookmarked: Boolean!

  """コメント編集許可"""
  isCommentsEditable: Boolean!

  """削除済み"""
  isDeleted: Boolean!

  """コレクションに追加している"""
  isInCollection: Boolean!

  """いいねしている"""
  isLiked: Boolean!

  """自分自身が推薦しているかどうか"""
  isMyRecommended: Boolean!

  """プロモーション作品かどうか"""
  isPromotion: Boolean!

  """センシティブである"""
  isSensitive: Boolean!

  """タグ編集許可"""
  isTagEditable: Boolean!

  """画像（大）の高さ"""
  largeThumbnailImageHeight: Int!

  """画像（大）のURL"""
  largeThumbnailImageURL: String!

  """画像（大）の幅"""
  largeThumbnailImageWidth: Int!

  """いいねしたユーザ一覧"""
  likedUsers(limit: Int!, offset: Int!): [UserNode!]!

  """いいね数"""
  likesCount: Int!

  """マンスリーランキング"""
  monthlyRanking: Int

  """次の作品"""
  nextPost: NotePostNode

  """OGP画像URL"""
  ogpThumbnailImageUrl: String

  """Open Graph 説明"""
  openGraphDescription: String

  """Open Graph 画像"""
  openGraphImageURL: String

  """Open Graph タイトル"""
  openGraphTitle: String

  """前の作品"""
  previousWork: NotePostNode

  """年齢制限"""
  rating: Rating

  """関連するタグ"""
  relatedTags(limit: Int!, offset: Int!): [TagNode!]!

  """関連URL"""
  relatedUrl: String

  """関連する作品"""
  relatedWorks(limit: Int!, offset: Int!): [NotePostNode!]!

  """シェア"""
  shareText: String

  """画像（小）の高さ"""
  smallThumbnailImageHeight: Int!

  """画像（小）のURL"""
  smallThumbnailImageURL: String!

  """画像（小）の幅"""
  smallThumbnailImageWidth: Int!

  """テイスト"""
  style: ImageStyle!

  """作品"""
  subPosts: [SubWorkNode!]!

  """複数画像数"""
  subPostsCount: Int!

  """タグ名"""
  tagNames: [String!]!
  tags: [TagNode!]!

  """サムネイル画像の位置"""
  thumbnailImagePosition: Float

  """タイトル"""
  title: String!

  """更新日"""
  updatedAt: Int!

  """ユーザ"""
  user: UserNode!

  """ユーザID"""
  userId: ID!

  """閲覧数"""
  viewsCount: Int!

  """ウィークリーランキング"""
  weeklyRanking: Int
}

"""通知"""
union NotificationNode = FollowNotificationNode | LikedWorkNotificationNode | LikedWorksSummaryNotificationNode | WorkAwardNotificationNode | WorkCommentNotificationNode | WorkCommentReplyNotificationNode

"""通知の種類"""
enum NotificationType {
  """コメントの返信"""
  COMMENT_REPLY

  """フォロー"""
  FOLLOW

  """作品のいいね"""
  LIKED_WORK

  """いいねの集計"""
  LIKED_WORKS_SUMMARY

  """作品のランキング結果"""
  WORK_AWARD

  """作品のコメント"""
  WORK_COMMENT
}

input NotificationsWhereInput {
  type: NotificationType
}

"""通知チェック時間種別"""
enum NotifyCheckedType {
  """入賞"""
  award

  """コメント"""
  comment

  """フォロー"""
  followed

  """いいね"""
  liked

  """メッセージ"""
  message

  """モデレーターによる通知"""
  moderation_report

  """返信"""
  reply
}

"""小説"""
type NovelNode implements Node {
  createdAt: Int!
  id: ID!
  user: UserNode!
}

"""投稿（小説）"""
type NovelPostNode implements Node {
  """閲覧権限の種類"""
  accessType: AccessType!

  """運営による閲覧権限の種類"""
  adminAccessType: AdminAccessType!

  """シリーズ情報"""
  album: AlbumNode

  """ブックマーク数"""
  bookmarksCount: Int!

  """コメント"""
  comment(id: ID!): CommentNode!

  """コメント"""
  comments(limit: Int!, offset: Int!): [CommentNode!]!

  """コメント数"""
  commentsCount: Int!

  """作成日"""
  createdAt: Int!

  """デイリーランキング"""
  dailyRanking: Int

  """テーマ"""
  dailyTheme: DailyThemeNode

  """説明"""
  description: String

  """説明(英語)"""
  enDescription: String

  """タイトル(英語)"""
  enTitle: String
  id: ID!

  """画像"""
  image: ImageNode @deprecated(reason: "廃止")

  """画像の比率"""
  imageAspectRatio: Float!

  """画像の高さ"""
  imageHeight: Int!

  """画像ID"""
  imageId: ID! @deprecated(reason: "廃止")

  """画像URL"""
  imageURL: String!

  """画像の幅"""
  imageWidth: Int!

  """ブックマークしている"""
  isBookmarked: Boolean!

  """コメント編集許可"""
  isCommentsEditable: Boolean!

  """削除済み"""
  isDeleted: Boolean!

  """コレクションに追加している"""
  isInCollection: Boolean!

  """いいねしている"""
  isLiked: Boolean!

  """自分自身が推薦しているかどうか"""
  isMyRecommended: Boolean!

  """プロモーション作品かどうか"""
  isPromotion: Boolean!

  """センシティブである"""
  isSensitive: Boolean!

  """タグ編集許可"""
  isTagEditable: Boolean!

  """画像（大）の高さ"""
  largeThumbnailImageHeight: Int!

  """画像（大）のURL"""
  largeThumbnailImageURL: String!

  """画像（大）の幅"""
  largeThumbnailImageWidth: Int!

  """いいねしたユーザ一覧"""
  likedUsers(limit: Int!, offset: Int!): [UserNode!]!

  """いいね数"""
  likesCount: Int!

  """マンスリーランキング"""
  monthlyRanking: Int

  """次の作品"""
  nextPost: NovelPostNode

  """OGP画像URL"""
  ogpThumbnailImageUrl: String

  """Open Graph 説明"""
  openGraphDescription: String

  """Open Graph 画像"""
  openGraphImageURL: String

  """Open Graph タイトル"""
  openGraphTitle: String

  """前の作品"""
  previousPost: NovelPostNode

  """年齢制限"""
  rating: Rating

  """関連するタグ"""
  relatedTags(limit: Int!, offset: Int!): [TagNode!]!

  """関連URL"""
  relatedUrl: String

  """関連する作品"""
  relatedWorks(limit: Int!, offset: Int!): [NovelPostNode!]!

  """シェア"""
  shareText: String

  """画像（小）の高さ"""
  smallThumbnailImageHeight: Int!

  """画像（小）のURL"""
  smallThumbnailImageURL: String!

  """画像（小）の幅"""
  smallThumbnailImageWidth: Int!

  """テイスト"""
  style: ImageStyle!

  """作品"""
  subPosts: [SubWorkNode!]!

  """複数画像数"""
  subPostsCount: Int!

  """タグ名"""
  tagNames: [String!]!
  tags: [TagNode!]!

  """サムネイル画像の位置"""
  thumbnailImagePosition: Float

  """タイトル"""
  title: String!

  """更新日"""
  updatedAt: Int!

  """ユーザ"""
  user: UserNode!

  """ユーザID"""
  userId: ID!

  """閲覧数"""
  viewsCount: Int!

  """ウィークリーランキング"""
  weeklyRanking: Int
}

type PassNode implements Node {
  createdAt: Int!
  id: ID!

  """無効である"""
  isDisabled: Boolean!
  isExpired: Boolean!
  payment: PaymentNode
  periodEnd: Int!
  periodStart: Int!
  price: Int!
  trialPeriodEnd: Int
  trialPeriodStart: Int
  type: PassType!
  user: UserNode!
}

"""パスの種類"""
enum PassType {
  """ライト"""
  LITE

  """プレミアム"""
  PREMIUM

  """スタンダード"""
  STANDARD

  """2日プラン"""
  TWO_DAYS
}

"""決済履歴"""
type PaymentNode implements Node {
  amount: Int!
  createdAt: Int!
  id: ID!
  isRefunded: Boolean!
  pass: PassNode
  stripeInvoiceId: String
  stripePaymentIntentId: String
  type: PaymentType!
  user: UserNode!
}

"""サブスク"""
enum PaymentType {
  PASS_LITE
  PASS_PREMIUM
  PASS_STANDARD
}

input PopularWorksWhereInput {
  date: String
  isSensitive: Boolean

  """廃止予定"""
  rating: Rating
}

"""アワード（作品）"""
type PostAwardNode implements Node {
  dateText: String!
  id: ID!
  index: Int!

  """ランキング集計時のいいね数"""
  likesCount: Int!

  """作品"""
  post: PostNode
  postId: ID
}

input PostAwardsWhereInput {
  date: String
  day: Int
  month: Int
  type: AwardType
  weekIndex: Int
  year: Int
}

"""投稿"""
union PostNode = AnimationPostNode | ImagePostNode | NotePostNode | NovelPostNode

"""投稿の並び順"""
enum PostOrderBy {
  """投稿時刻"""
  CREATION_DATE

  """いいね数"""
  LIKES_COUNT

  """閲覧数"""
  VIEWS_COUNT
}

input PostsWhereInput {
  """公開範囲"""
  accessTypes: [AccessType!]

  """センシティブである"""
  isSensitive: Boolean!

  """ソート"""
  orderBy: PostOrderBy

  """年齢種別"""
  ratings: [Rating!]

  """昇順/降順"""
  sort: Sort

  """スタイル(テイスト)"""
  style: ImageStyle
}

"""年齢制限の設定"""
enum PreferenceRating {
  """全年齢"""
  G

  """全年齢+R15"""
  R15

  """全年齢+R15+R18G+R18"""
  R18

  """全年齢+R15+R18G"""
  R18G
}

"""プロモーション"""
type PromotionNode implements Node {
  description: String!
  endDateTime: Int!
  id: ID!
  imageURL: String
  pageURL: String
  startDateTime: Int!
  title: String!
}

"""プロンプトのカテゴリー"""
type PromptCategoryNode implements Node {
  id: ID!
  name: String!
  prompts: [PromptNode!]!
}

"""プロンプト"""
type PromptNode implements Node {
  id: ID!
  name: String!
  words: [String!]!
}

"""ユーザ"""
type PromptonUserNode implements Node {
  id: ID!

  """ユーザ名"""
  name: String
}

type Query {
  """コメント審査の管理一覧"""
  adminCommentModerationItems: [CommentModerationAdminItemNode!]!

  """モデレーター向け作品通報一覧"""
  adminWorkReports(limit: Int!, offset: Int!, onlyUnhandled: Boolean): [AdminWorkReportNode!]!

  """モデル"""
  aiModel(where: AiModelWhereInput!): AiModelNode

  """モデル"""
  aiModels(limit: Int!, offset: Int!, where: AiModelWhereInput): [AiModelNode!]

  """シリーズ"""
  album(id: ID, where: AlbumWhereInput): AlbumNode

  """シリーズ"""
  albums(limit: Int!, offset: Int!, where: AlbumsWhereInput): [AlbumNode!]

  """シリーズ数"""
  albumsCount(where: AlbumsWhereInput): Int!

  """運営からのお知らせ"""
  announcements(limit: Int!, offset: Int!): [AnnouncementNode!]!

  """イベント"""
  appEvent(slug: String): AppEventNode

  """イベントのお知らせ一覧"""
  appEventAnnouncements: [AppEventAnnouncementNode!]!

  """イベント一覧"""
  appEvents(limit: Int!, offset: Int!, where: AppEventsWhereInput): [AppEventNode!]!

  """LINEログインURL"""
  authenticationLineAccountUrl: String

  """
  全期間の人気作品
  ※キャッシュ不可
  """
  bestWorks(where: PopularWorksWhereInput!): [WorkNode!]!

  """カテゴリ"""
  categories: [CategoryNode!]!

  """カテゴリ"""
  category(id: ID!): CategoryNode!

  """キャラクターの表情一覧を取得"""
  characterExpressions(
    """キャラクターID"""
    characterId: String!
  ): [CharacterExpressionNode!]!

  """ユーザーのキャラクター一覧を取得"""
  characters(
    """取得件数（デフォルト: 20、最大: 100）"""
    limit: Int

    """オフセット（デフォルト: 0）"""
    offset: Int
  ): [CharacterNode!]!

  """コメントの審査状態一覧"""
  commentModerationSummaries(commentIds: [ID!]!): [CommentModerationSummaryNode!]!

  """コメント"""
  comments(limit: Int!, offset: Int!, orderBy: CommentsOrderBy!, where: CommentsWhereInput!): [CommentNode!]!

  """ControlNetテンプレート一覧"""
  controlNetCategories: [ControlNetCategoryNode!]!

  """広告一覧"""
  customerAdvertisements(limit: Int!, offset: Int!, where: CustomerAdvertisementsWhereInput): [CustomerAdvertisementNode!]!

  """日別テーマ"""
  dailyTheme(day: Int, id: ID, month: Int, year: Int): DailyThemeNode

  """日別テーマ"""
  dailyThemes(limit: Int!, offset: Int!, where: DailyThemesWhereInput): [DailyThemeNode!]!

  """緊急のお知らせ"""
  emergencyAnnouncements: EmergencyAnnouncementNode!

  """指定したユーザが支援リクエストを許可しているかどうか"""
  featurePromptonRequest(where: FeaturePromptonRequestWhereInput!): Boolean

  """フィード"""
  feed(where: FeedWhereInput!): FeedNode

  """フォルダ"""
  folder(id: ID, where: FolderWhereInput): FolderNode

  """フォルダ"""
  folders(limit: Int!, offset: Int!, where: FoldersWhereInput): [FolderNode!]

  """フォルダ数"""
  foldersCount(where: FoldersWhereInput): Int

  """フォロワー"""
  followers(limit: Int!, offset: Int!, where: FollowersWhereInput!): [UserNode!]!

  """フォロー中ユーザ"""
  followingUsers(limit: Int!, offset: Int!, where: FollowingUsersWhereInput!): [UserNode!]!

  """ホームのタグ"""
  homeTags: [TagNode!]!

  """1日以内の人気の投稿"""
  hotPosts: [PostNode!]!

  """トレンドのセンシティブタグ"""
  hotSensitiveTags: [TagNode!]!

  """トレンドのタグ"""
  hotTags: [TagNode!]!

  """
  1日以内の人気の作品
  ※キャッシュ不可
  """
  hotWorks(where: HotWorksWhereInput): [WorkNode!]!

  """画像生成のタスク状況"""
  imageGenerationEngineStatus: ImageGenerationEngineStatus!

  """画像生成ジョブ"""
  imageGenerationJob(id: ID!): ImageGenerationJobNode

  """画像生成メモ"""
  imageGenerationMemo(id: ID!): ImageGenerationMemoNode!

  """画像生成メモ一覧"""
  imageGenerationMemos(limit: Int!, offset: Int!, orderBy: ImageGenerationMemoOrderBy): [ImageGenerationMemoNode]!

  """予約画像生成履歴"""
  imageGenerationReservedTask(id: ID!): ImageGenerationTaskNode!

  """画像生成履歴"""
  imageGenerationResult(id: ID!): ImageGenerationResultNode!

  """画像生成履歴"""
  imageGenerationTask(id: ID!): ImageGenerationTaskNode!

  """画像生成サービス"""
  imageGenerators: [ImageGeneratorNode!]!

  """画像生成モデル"""
  imageLoraModel(id: ID!): ImageLoraModelNode!

  """画像生成モデル"""
  imageLoraModels: [ImageLoraModelNode!]!

  """画像生成モデル"""
  imageModel(where: ImageModelWhereInput): ImageModelNode!

  """画像生成モデル"""
  imageModels: [ImageModelNode!]!

  """いいねしたユーザ"""
  likedUsers(limit: Int!, offset: Int!, where: LikedUsersWhereInput!): [UserNode!]!

  """メンテナンス状態"""
  maintenanceStatus: MaintenanceStatusNode!

  """ログインユーザーの素材画像一覧"""
  materialImages(limit: Int!, offset: Int!): [MaterialImageNode!]!

  """ログインユーザーの素材画像の総数"""
  materialImagesCount: Int!

  """マイルストーン"""
  milestones(where: MilestonesWhereInput!): [MilestoneNode!]!

  """モデレーターによる通知一覧"""
  moderationReports(limit: Int!, offset: Int!, where: ModerationReportsWhereInput): [ModerationReportNode!]!

  """画像生成ネガティブキーワード"""
  negativePromptCategories: [PromptCategoryNode!]!

  """新規コメント一覧"""
  newComments(limit: Int!, offset: Int!, where: NewCommentsWhereInput): [NewCommentNode!]!

  """新規投稿ユーザ"""
  newPostedUsers(limit: Int!, offset: Int!, where: NewPostedUsersWhereInput): [UserNode!]!

  """新しいユーザの投稿"""
  newUserPosts(limit: Int!, offset: Int!): [PostNode!]!

  """
  新しいユーザの初投稿作品一覧
  ※キャッシュ不可
  """
  newUserWorks(limit: Int!, offset: Int!, where: NewUsersWorksWhereInput): [WorkNode!]!

  """
  全期間の人気作品
  ※キャッシュ不可
  """
  popularWorks(where: PopularWorksWhereInput!): [WorkNode!]!

  """ランキング履歴"""
  postAwards(limit: Int!, offset: Int!, where: PostAwardsWhereInput!): [PostAwardNode!]!

  """投稿"""
  posts(limit: Int!, offset: Int!, where: PostsWhereInput!): [PostNode!]!

  """プロモーション"""
  promotion(id: ID!): PromotionNode

  """プロモーション"""
  promotions(limit: Int!, offset: Int!): [PromotionNode!]!

  """画像生成キーワード"""
  promptCategories: [PromptCategoryNode!]!

  """ランダム広告"""
  randomCustomerAdvertisement(where: RandomCustomerAdvertisementWhereInput!): CustomerAdvertisementNode

  """推奨タグ一覧（ログインユーザ関係なく）"""
  recommendedTags(limit: Int!, where: RecommendedTagsWhereInput!): [RecommendedTagNode!]!

  """プロンプトに基づいた推奨タグ"""
  recommendedTagsFromPrompts(prompts: String!): [TagNode!]!

  """おすすめユーザ"""
  recommendedUsers(limit: Int!, offset: Int!): [UserNode!]!

  """1日以内の人気の投稿"""
  sensitiveHotPosts: [PostNode!]!

  """新しいユーザの投稿"""
  sensitiveNewUserPosts(limit: Int!, offset: Int!): [PostNode!]!

  """ランキング履歴"""
  sensitivePostAwards(limit: Int!, offset: Int!, where: PostAwardsWhereInput!): [PostAwardNode!]!

  """センシティブユーザランキング"""
  sensitiveUserRankings(limit: Int!, offset: Int!, where: UserRankingsWhereInput): [UserRankingNode!]!

  """スタンプ"""
  sticker(id: ID!): StickerNode

  """スタンプ"""
  stickers(limit: Int!, offset: Int!, where: StickersWhereInput): [StickerNode!]!

  """スタンプ総数"""
  stickersCount(where: StickersWhereInput): Int!

  """タグ"""
  tag(name: String!): TagNode

  """
  タグ作品
  ※キャッシュ不可
  """
  tagWorks(limit: Int!, offset: Int!, where: WorksWhereInput): [WorkNode!]!

  """
  タグ作品数
  ※キャッシュ不可
  """
  tagWorksCount(where: TagWorksCountWhereInput!): Int!

  """全てのタグ"""
  tags(limit: Int!, offset: Int!, where: TagsWhereInput): [TagNode!]!

  """お題提案の重複候補"""
  themeProposalDuplicateThemes(theme: String!): [DailyThemeNode!]!

  """お題提案一覧"""
  themeProposals(date: String, endDate: String, limit: Int!, month: Int, offset: Int!, orderBy: String, proposerUserId: ID, startDate: String, status: String, year: Int): [ThemeProposalNode!]!

  """お題提案数"""
  themeProposalsCount(date: String, endDate: String, month: Int, proposerUserId: ID, startDate: String, status: String, year: Int): Int!

  """ユーザ"""
  user(id: ID!): UserNode

  """ユーザのシリーズ"""
  userAlbum(where: UserAlbumWhereInput): AlbumNode

  """ユーザのバッジ一覧"""
  userBadges(limit: Int!, offset: Int!, where: UserBadgesWhereInput): [BadgeNode!]!

  """ユーザーイベント"""
  userEvent(includeUnpublished: Boolean, slug: String!): UserEventNode

  """ユーザーイベント一覧"""
  userEvents(limit: Int!, offset: Int!, where: UserEventsWhereInput): [UserEventNode!]!

  """ユーザランキング"""
  userRankings(limit: Int!, offset: Int!, where: UserRankingsWhereInput): [UserRankingNode!]!

  """ユーザ設定"""
  userSetting: UserSettingNode

  """ユーザ"""
  users(limit: Int!, offset: Int!, where: UsersWhereInput): [UserNode!]!

  """ログイン中のユーザ"""
  viewer: Viewer

  """ホワイトリスト用のタグ"""
  whiteListTags(where: WhiteListTagsInput): [TagNode!]!

  """作品"""
  work(id: ID!, isUpdateHistory: Boolean): WorkNode

  """
  ランキング履歴
  ※キャッシュ不可
  """
  workAwards(limit: Int!, offset: Int!, where: WorkAwardsWhereInput!): [WorkAwardNode!]!

  """画像ハッシュ値で作品を検索"""
  workByImageHash(imageHash: String!): WorkNode

  """
  作品
  ※キャッシュ不可
  """
  works(limit: Int!, offset: Int!, where: WorksWhereInput): [WorkNode!]!

  """
  作品数
  ※キャッシュ不可
  """
  worksCount(where: WorksWhereInput): Int!

  """
  作者名で絞った作品一覧
  ※キャッシュ不可
  """
  worksFromOwner(limit: Int!, offset: Int!, where: WorksFromOwnerWhereInput): [WorkNode!]!
}

"""ランダムな広告取得条件"""
input RandomCustomerAdvertisementWhereInput {
  """センシティブかどうか"""
  isSensitive: Boolean!

  """表示対象画面の種類"""
  page: CustomerAdvertisementType!
}

"""年齢制限"""
enum Rating {
  """全年齢"""
  G

  """R15"""
  R15

  """R18"""
  R18

  """R18G"""
  R18G
}

"""推奨タグ"""
type RecommendedTagNode {
  tagName: String!
  thumbnailUrl: String!
}

input RecommendedTagsWhereInput {
  isSensitive: Boolean
}

"""キャラクター表情再生成のInput"""
input RegenerateCharacterExpressionInput {
  """再生成する表情ID"""
  expressionId: String!

  """IPアドレス（任意）"""
  ipaddress: String
}

input ReportAlbumInput {
  albumId: ID!
  reason: ReportReason!
}

input ReportCommentInput {
  comment: String
  commentId: ID!
  reason: ReportReason!
}

input ReportFolderInput {
  folderId: ID!
  reason: ReportReason!
}

"""報告理由"""
enum ReportReason {
  """対象年齢が異なる（過度な性的表現など）"""
  AGE_MISMATCH

  """実写に見える作品で、児童ポルノと認定される恐れのある内容が含まれている"""
  CHILD_PORNOGRAPHY

  """商業用の広告や宣伝、勧誘を目的とする情報が含まれている"""
  COMMERCIAL_CONTENT

  """過度なグロテスク表現が含まれている"""
  EXCESSIVE_GORE

  """サイトで禁止されているコンテンツへの誘導が含まれている"""
  ILLEGAL_CONTENT

  """必要なモザイク加工がされていない"""
  NO_MOSAIC

  """その他"""
  OTHER

  """プライバシーまたは肖像権を侵害している"""
  PRIVACY_VIOLATION

  """テイストが異なる"""
  TASTE_MISMATCH

  """無断転載している"""
  UNAUTHORIZED_REPOST
}

input ReportStickerInput {
  reason: ReportReason!
  stickerId: ID!
}

input ReportUserEventInput {
  eventId: ID!
  reason: String!
}

input ReportUserInput {
  reason: ReportReason!
  userId: ID!
}

input ReportWorkInput {
  comment: String!
  reason: ReportReason!
  workId: ID!
}

"""作品に対してBot採点機能のリクエストを行う"""
input RequestWorkBotGradingInput {
  """公開設定"""
  accessType: AccessType

  """Bot採点タイプ"""
  botGradingType: BotGradingType

  """Bot評価の性格タイプ"""
  botPersonality: BotPersonality

  """評価対象の画像URL"""
  imageUrl: String!

  """Bot採点を公開するか"""
  isBotGradingPublic: Boolean

  """Bot採点ランキングに参加するか"""
  isBotGradingRankingEnabled: Boolean

  """コメント編集可能にするか"""
  isCommentEditable: Boolean

  """年齢制限"""
  rating: Rating

  """作品ID"""
  workId: ID!

  """作品の種類"""
  workType: WorkType
}

input ReviewCommentModerationInput {
  action: String!
  commentId: ID!
  userNotice: String
  violationCategory: String
}

input SendSmsVerificationInput {
  phoneNumber: String!
}

input SignImageGenerationTermsInput {
  version: Int!
}

enum Sort {
  ASC
  DESC
}

enum StickerAccessType {
  """非公開"""
  PRIVATE

  """公開"""
  PUBLIC
}

"""ステッカーの種類"""
enum StickerGenre {
  """動物"""
  ANIMAL

  """背景"""
  BACKGROUND

  """人物"""
  CHARACTER

  """機械"""
  MACHINE

  """物"""
  OBJECT
}

"""スタンプ"""
type StickerNode implements Node {
  """閲覧の種類"""
  accessType: AccessType!

  """カテゴリ"""
  categories: [String!]!
  createdAt: Int!

  """ダウンロード数"""
  downloadsCount: Int!

  """ジャンル"""
  genre: StickerGenre!
  id: ID!

  """画像"""
  image: ImageNode @deprecated(reason: "廃止")
  imageId: ID @deprecated(reason: "廃止")
  imageUrl: String

  """コメント用にブックマークしている"""
  isBookmarkedForComment: Boolean!

  """返信用にブックマークしている"""
  isBookmarkedForReply: Boolean!

  """削除済み"""
  isDeleted: Boolean!

  """マイスタンプに追加している"""
  isDownloaded: Boolean!

  """いいねしている"""
  isLiked: Boolean!

  """いいね数"""
  likesCount: Int!

  """タイトル"""
  title: String!
  usedAt: Int

  """ユーザ"""
  user: UserNode!
  userId: ID!

  """使用回数"""
  usesCount: Int!
  viewer: StickerViewerNode @deprecated(reason: "isLikedを使用する")
}

"""ステッカーの並び順"""
enum StickerOrderBy {
  DATE_CREATED
  DATE_DOWNLOADED
  DATE_USED
}

"""スタンプの保存状態"""
enum StickerSavedType {
  """他人の作成スタンプ（ダウンロード済み）"""
  DOWNLOADED

  """自身の作成スタンプ（未公開）"""
  PRIVATE_CREATED

  """自身の作成スタンプ（公開）"""
  PUBLIC_CREATED
}

type StickerViewerNode implements Node {
  id: ID! @deprecated(reason: "")
  isLiked: Boolean! @deprecated(reason: "")
}

input StickersWhereInput {
  """カテゴリ"""
  categories: [String!]

  """作成者"""
  creatorUserId: ID

  """ジャンル"""
  genre: StickerGenre

  """ソート"""
  orderBy: StickerOrderBy

  """検索ワード"""
  search: String

  """昇順/降順"""
  sort: Sort
}

type SubWorkNode implements Node {
  id: ID!

  """画像のURL"""
  image: ImageNode! @deprecated(reason: "廃止")
  imageId: ID @deprecated(reason: "廃止")

  """画像のURL"""
  imageUrl: String

  """サムネイル画像のURL"""
  thumbnailImage: ImageNode! @deprecated(reason: "廃止")
  thumbnailImageId: ID! @deprecated(reason: "廃止")
}

"""タグ"""
type TagNode implements Node {
  """最初の作品"""
  firstWork: WorkNode
  id: ID!

  """いいねしている"""
  isLiked: Boolean!

  """ミュートしている"""
  isMuted: Boolean!

  """保存している"""
  isWatched: Boolean!

  """いいね数"""
  likesCount: Int!

  """名前"""
  name: String!
  viewer: TagViewerNode @deprecated(reason: "")

  """関連する作品"""
  works(limit: Int!, offset: Int!, where: WorksWhereInput): [WorkNode!]

  """作品数"""
  worksCount: Int!
}

type TagViewerNode implements Node {
  id: ID!
  isLiked: Boolean! @deprecated(reason: "")
  isMuted: Boolean! @deprecated(reason: "")
  isWatched: Boolean! @deprecated(reason: "")
}

"""タグ作品数の条件"""
input TagWorksCountWhereInput {
  """年齢種別"""
  ratings: [Rating!]

  """タグのID"""
  tagId: ID

  """タグの名前"""
  tagName: String
}

input TagsWhereInput {
  search: String
}

"""お題の並び順"""
enum ThemeOrderBy {
  """開催日でソート"""
  DATE_STARTED

  """英語名でソート"""
  EN_NAME

  """名前でソート"""
  NAME
}

"""お題提案"""
type ThemeProposalNode implements Node {
  adoptedSubjectId: ID
  allowOtherDate: Boolean!
  canCancel: Boolean!
  canceledAt: Int
  createdAt: Int!
  day: Int!
  decidedAt: Int
  decisionComment: String
  enTitle: String!
  id: ID!
  inputTheme: String!
  isLiked: Boolean!
  likesCount: Int!
  locale: String!
  month: Int!
  note: String
  precheckComment: String
  promptName: String!
  proposerIconUrl: String!
  proposerName: String!
  proposerUserId: ID!
  status: String!
  targetDate: String!
  title: String!
  updatedAt: Int!
  year: Int!
}

"""スタンプの公開状態変更の入力"""
input ToggleStickerAccessTypeInput {
  """公開状態（PUBLIC: 公開、PRIVATE: 非公開）"""
  accessType: String!

  """スタンプID"""
  stickerId: ID!
}

input ToggleUserCommentBanInput {
  """BAN状態"""
  isBanned: Boolean!

  """対象ユーザID"""
  targetUserId: ID!
}

input ToggleUserPostBanInput {
  """BAN状態"""
  isBanned: Boolean!

  """対象ユーザID"""
  targetUserId: ID!
}

input UnblockUserInput {
  userId: ID!
}

"""タグのフォローを解除する"""
input UnfollowTagInput {
  tagName: String!
}

input UnfollowUserInput {
  userId: ID!
}

"""ユーザープロバイダーの紐付けを解除するInput"""
input UnlinkUserProviderInput {
  """プロバイダーID (google.com, twitter.com など)"""
  providerId: String!
}

input UnmuteTagInput {
  tagName: String!
}

input UnmuteUserInput {
  userId: ID!
}

input UnwatchAlbumInput {
  albumId: ID!
}

input UnwatchFolderInput {
  userId: ID!
}

input UpdateAccountFcmTokenInput {
  token: String
}

input UpdateAccountInitialPasswordInput {
  newPassword: String!
}

input UpdateAccountLoginInput {
  login: String!
}

input UpdateAccountPasswordInput {
  currentPassword: String
  newPassword: String!
}

input UpdateAccountWebFcmTokenInput {
  token: String
}

input UpdateAlbumInput {
  albumId: ID!
  description: String

  """ヘッダー画像"""
  headerImageUrl: String

  """年齢制限"""
  rating: AlbumRating
  title: String
  workIds: [ID!]
}

"""お気に入りスタンプを更新する"""
input UpdateBookmarkedStickerInput {
  """お気に入りするか、解除するかどうか"""
  isBookmarked: Boolean!

  """スタンプID"""
  stickerId: ID!

  """お気に入りスタンプ種別（返信、コメント）"""
  type: BookmarkedStickerType!
}

"""広告更新"""
input UpdateCustomerAdvertisement {
  """表示確率（優先度、数字が多ければ多いほど表示確率が上がる）"""
  displayProbability: Int

  """配信終了日付"""
  endAt: String

  """ID"""
  id: ID!

  """画像URL"""
  imageUrl: String

  """有効かどうか"""
  isActive: Boolean

  """センシティブかどうか"""
  isSensitive: Boolean

  """表示対象画面の種類"""
  page: CustomerAdvertisementType

  """配信開始日付"""
  startAt: String

  """遷移先URL"""
  url: String
}

input UpdateFolderInput {
  folderId: ID!
  title: String!
}

input UpdateImageGenerationMemoInput {
  clipSkip: Int!
  explanation: String!
  height: Int!
  modelId: ID!
  nanoid: String!
  negativePrompts: String!
  prompts: String!
  sampler: String!
  scale: Int!
  seed: Int!
  steps: Int!
  title: String!
  vae: String!
  width: Int!
}

input UpdateNoteInput {
  noteId: ID!
}

input UpdateNovelInput {
  novelId: ID!
}

input UpdateProtectedImageGenerationResultInput {
  isProtected: Boolean!
  nanoid: String!
}

input UpdateRatingImageGenerationModelInput {
  modelId: ID!
  rating: Int!
}

input UpdateRatingImageGenerationResultInput {
  nanoid: String!
  rating: Int!
}

input UpdateStickerInput {
  """公開状態"""
  accessType: StickerAccessType!

  """カテゴリ"""
  categories: [String!]

  """ジャンル"""
  genre: StickerGenre
  stickerId: ID!

  """タイトル"""
  title: String
}

input UpdateUserEventInput {
  announcementText: String
  description: String
  endAt: Int!
  headerImageUrl: String
  mainTag: String!
  nextSlug: String!
  participationGuide: String
  rankingEnabled: Boolean!
  rankingType: String
  ratings: [Rating!]!
  slug: String!
  startAt: Int!
  tags: [String!]!
  thumbnailImageUrl: String
  title: String!
  visibilityType: String!
}

input UpdateUserEventStatusInput {
  forceEnd: Boolean
  slug: String!
  visibilityType: String!
}

input UpdateUserProfileInput {
  """紹介"""
  biography: String
  displayName: String

  """紹介（英語）"""
  enBiography: String

  """センシティブなピックアップ作品ID"""
  featuredSensitiveWorkIds: [ID!]

  """ピックアップ作品ID"""
  featuredWorkIds: [ID!]

  """GitHub"""
  githubAccountId: String

  """ヘッダー画像"""
  headerImageUrl: String

  """ホームURL"""
  homeUrl: String

  """アイコン画像"""
  iconUrl: String

  """Instagram"""
  instagramAccountId: String

  """メールアドレス"""
  mailAddress: String

  """X"""
  twitterAccountId: String
}

input UpdateUserSettingInput {
  """支援機能（チップ）リクエスト許可"""
  featurePromptonRequest: Boolean

  """全年齢作品へのいいねを匿名にする"""
  isAnonymousLikeAllAges: Boolean

  """センシティブ作品へのいいねを匿名にする"""
  isAnonymousLikeSensitive: Boolean

  """センシティブ画像をぼかす"""
  isBlurSensitiveImage: Boolean

  """コメント通知"""
  isNotifyComment: Boolean

  """ミュートユーザのコメントを表示する"""
  isShowingMutedUsersComments: Boolean

  """ミュートユーザの作品を表示する"""
  isShowingMutedUsersWorks: Boolean

  """閲覧コンテンツ"""
  preferenceRating: PreferenceRating

  """セーフモード（全年齢のみ表示）"""
  safetyMode: Boolean
}

input UpdateWorkInput {
  """生成情報の公開設定"""
  accessGenerationType: GenerationAccessType!

  """公開状態"""
  accessType: AccessType!

  """シリーズID"""
  albumId: ID

  """運営に向けての修正メッセージ"""
  correctionMessage: String
  enExplanation: String
  entitle: String

  """説明"""
  explanation: String

  """作品ID"""
  id: ID!
  imageHeight: Int!

  """テイスト"""
  imageStyle: ImageStyle!

  """画像"""
  imageUrls: [String!]!
  imageWidth: Int!

  """Bot採点を公開するか"""
  isBotGradingPublic: Boolean

  """Bot採点ランキングに参加するか"""
  isBotGradingRankingEnabled: Boolean

  """コメント許可"""
  isCommentEditable: Boolean!

  """宣伝作品かどうか"""
  isPromotion: Boolean!

  """タグ編集許可"""
  isTagEditable: Boolean!
  largeThumbnailImageHeight: Int!

  """大きいサムネイル画像(最大縦横600px)"""
  largeThumbnailImageURL: String!
  largeThumbnailImageWidth: Int!

  """Cloudflare Stream の動画UID"""
  streamUid: String

  """メイン画像のハッシュ値（同じ画像の重複投稿防止に使う）"""
  mainImageSha256: String!
  modelHash: String

  """モデル"""
  modelId: ID
  modelName: String
  negativePrompt: String
  noise: String

  """OGP画像URL"""
  ogpImageUrl: String
  otherGenerationParams: String
  pngInfo: String

  """生成情報"""
  prompt: String

  """年齢種別"""
  rating: Rating!

  """関連リンク"""
  relatedUrl: String

  """予約日"""
  reservedAt: Float
  sampler: String
  seed: String
  smallThumbnailImageHeight: Int!

  """小さいサムネイル画像(最大縦横400px)"""
  smallThumbnailImageURL: String!
  smallThumbnailImageWidth: Int!
  steps: String
  strength: String

  """お題ID"""
  subjectId: ID

  """タグ"""
  tags: [String!]

  """サムネイル位置"""
  thumbnailPosition: Float

  """題名"""
  title: String!

  """種別"""
  type: WorkType!

  """動画URL"""
  videoUrl: String
}

input UpdateWorkTagsInput {
  """作品ID"""
  id: ID!

  """タグ"""
  tags: [String!]
}

input UploadMaterialImageInput {
  """アップロードする画像のURL"""
  imageUrl: String!
}

input UserAlbumInput {
  isSensitive: Boolean
  search: String
}

input UserAlbumWhereInput {
  """リンク名"""
  link: String!

  """作成者のログインユーザID"""
  userId: ID!
}

input UserBadgesWhereInput {
  """ユーザID"""
  userId: ID!
}

"""イベント文面の生成結果"""
type UserEventContentNode {
  announcementTexts: [String!]!
  descriptions: [String!]!
  participationGuides: [String!]!
  titles: [String!]!
}

"""ユーザーイベント"""
type UserEventNode implements Node {
  announcementText: String!
  awardWorks(isSensitive: Boolean!, limit: Int!, offset: Int!): [WorkNode!]!
  description: String!
  endAt: Int!
  entryCount: Int!
  favoriteCount: Int!
  headerImageUrl: String!
  id: ID!
  isOfficial: Boolean!
  isSensitive: Boolean!
  mainTag: String!
  participantCount: Int!

  """参加方法"""
  participationGuide: String!
  rankingEnabled: Boolean!
  rankingType: String
  ratings: [Rating!]!
  remainingDays: Int!
  slug: String!
  startAt: Int!
  status: String!
  tags: [String!]!
  thumbnailImageUrl: String!
  title: String!
  userIconUrl: String
  userId: ID!
  userLogin: String
  userName: String!
  viewCount: Int!
  visibilityType: String!
  works(limit: Int!, offset: Int!, where: WorksWhereInput): [WorkNode!]!
  worksCount: Int!
}

input UserEventsWhereInput {
  endAt: String
  isSensitive: Boolean
  keyword: String
  onlyMine: Boolean
  rankingEnabled: Boolean
  searchInDescription: Boolean
  searchInTags: Boolean
  sort: String
  status: String
  userId: ID
}

input UserFolderInput {
  isSensitive: Boolean
  search: String
}

"""ユーザ"""
type UserNode implements Node {
  """シリーズ数"""
  albumCount(where: UserAlbumInput): Int!

  """シリーズ"""
  albums(limit: Int!, offset: Int!, where: UserAlbumInput): [AlbumNode!]!

  """入賞回数"""
  awardsCount: Int!

  """バッジ一覧"""
  badges(limit: Int!, offset: Int!): [BadgeNode!]

  """紹介"""
  biography: String

  """ブックマーク作品"""
  bookmarkWorks(limit: Int!, offset: Int!, where: UserWorksWhereInput): [WorkNode!]!

  """作成日"""
  createdAt: Int!

  """付けたブックマーク数"""
  createdBookmarksCount: Int!

  """送ったコメント数"""
  createdCommentsCount: Int!

  """送ったいいね数"""
  createdLikesCount: Int!

  """付けた閲覧数"""
  createdViewsCount: Int!

  """紹介（英語）"""
  enBiography: String

  """FCMトークン"""
  fcmToken: String

  """センシティブなピックアップ作品"""
  featuredSensitiveWorks: [WorkNode!]

  """ピックアップ作品"""
  featuredWorks: [WorkNode!]

  """最終投稿日時"""
  finalPostedAt: Int

  """フォルダ数"""
  folderCount(where: UserFolderInput): Int!

  """フォルダ"""
  folders(limit: Int!, offset: Int!, where: UserFolderInput): [FolderNode!]!

  """フォロー数"""
  followCount: Int!

  """フォロー（ユーザがフォローしているユーザ)"""
  followees(limit: Int!, offset: Int!, where: FolloweesWhereInput): [UserNode!]!

  """フォロー数（ユーザにフォローされているユーザの数）"""
  followeesCount: Int!

  """フォロワー（ユーザをフォローしているユーザ）"""
  followers(limit: Int!, offset: Int!, where: FollowerWhereInput): [UserNode!]!

  """フォロワー数（ユーザをフォローしているユーザの数）"""
  followersCount: Int!

  """生成済み回数"""
  generatedCount: Int!

  """GitHub"""
  githubAccountId: String

  """アルバムを持っているかどうか"""
  hasAlbums: Boolean!

  """バッジを持っているかどうか"""
  hasBadges: Boolean!

  """投稿したコラム作品を持っているかどうか"""
  hasColumnWorks: Boolean!

  """フォルダを持っているかどうか"""
  hasFolders: Boolean!

  """投稿した画像作品を持っているかどうか"""
  hasImageWorks: Boolean!

  """投稿した小説作品を持っているかどうか"""
  hasNovelWorks: Boolean!

  """公開スタンプを持っているかどうか"""
  hasPublicStickers: Boolean!

  """投稿したセンシティブなコラム作品を持っているかどうか"""
  hasSensitiveColumnWorks: Boolean!

  """センシティブなフォルダを持っているかどうか"""
  hasSensitiveFolders: Boolean!

  """投稿したセンシティブな画像作品を持っているかどうか"""
  hasSensitiveImageWorks: Boolean!

  """投稿したセンシティブな小説作品を持っているかどうか"""
  hasSensitiveNovelWorks: Boolean!

  """投稿したセンシティブな動画作品を持っているかどうか"""
  hasSensitiveVideoWorks: Boolean!

  """画像生成機能の利用規約に同意済みである"""
  hasSignedImageGenerationTerms: Boolean!

  """公開ユーザーイベントを持っているかどうか"""
  hasUserEvents: Boolean!

  """投稿した動画作品を持っているかどうか"""
  hasVideoWorks: Boolean!

  """ヘッダー画像"""
  headerImage: ImageNode @deprecated(reason: "廃止")

  """ヘッダー画像のID"""
  headerImageId: ID @deprecated(reason: "廃止")

  """ヘッダー画像URL"""
  headerImageUrl: String

  """アイコン画像"""
  iconImage: ImageNode @deprecated(reason: "廃止")

  """アイコン画像のID"""
  iconImageId: ID @deprecated(reason: "廃止")

  """アイコン画像URL"""
  iconUrl: String
  id: ID!

  """Instagram"""
  instagramAccountId: String

  """ブロックしている"""
  isBlocked: Boolean!

  """コメント投稿がBANされているかどうか"""
  isCommentBanned: Boolean!

  """フォローしている"""
  isFollowee: Boolean!

  """フォローされている"""
  isFollower: Boolean!

  """モデレーターかどうか"""
  isModerator: Boolean!

  """ミュートしている"""
  isMuted: Boolean!

  """作品投稿がBANされているかどうか"""
  isPostBanned: Boolean!

  """いいね作品"""
  likedWorks(limit: Int!, offset: Int!, where: UserWorksWhereInput): [WorkNode!]!

  """ログインID"""
  login: String!

  """MailAddress"""
  mailAddress: String

  """表示名"""
  name: String!
  nanoid: String

  """Open Graph 説明"""
  openGraphDescription: String

  """Open Graph 画像"""
  openGraphImageURL: String

  """Open Graph タイトル"""
  openGraphTitle: String

  """サブスク情報"""
  pass: PassNode

  """プロンプトンのユーザ"""
  promptonUser: PromptonUserNode

  """獲得したバッジ数"""
  receivedBadgesCount: Int!

  """受け取ったいいね数"""
  receivedLikesCount: Int!

  """受け取ったセンシティブな作品のいいね数"""
  receivedSensitiveLikesCount: Int!

  """受け取った閲覧数"""
  receivedViewsCount: Int!

  """シェア"""
  shareText: String

  """サイトURL"""
  siteURL: String

  """スタンプ"""
  stickers(limit: Int!, offset: Int!): [StickerNode!]!

  """X"""
  twitterAccountId: String

  """ユーザーが主催しているイベント"""
  userEvents(limit: Int!, offset: Int!, where: UserEventsWhereInput): [UserEventNode!]!

  """ユーザーが紐付けているSNSプロバイダー"""
  userProviders: [UserProviderNode!]!
  viewer: UserViewerNode

  """WebFCMトークン"""
  webFcmToken: String

  """アワード（作品）"""
  workAwards(limit: Int!, offset: Int!, where: AwardsWhereInput): [WorkAwardNode!]!
  workCreatedAt: Int

  """
  作品
  ※キャッシュ不可
  """
  works(limit: Int!, offset: Int!, where: UserWorksWhereInput): [WorkNode!]!

  """投稿した作品数"""
  worksCount: Int!
}

"""ユーザーが紐付けているSNSプロバイダー"""
type UserProviderNode implements Node {
  """プロバイダーID"""
  id: ID!

  """プロバイダーID (google.com, twitter.com など)"""
  providerId: String!

  """プロバイダーのユーザーID"""
  providerUserUid: String!
}

"""ユーザランキング"""
type UserRankingNode {
  """平均いいね数"""
  avgLikes: Float!

  """作成日"""
  createdAt: Int!

  """日付"""
  date: String!

  """ID"""
  id: ID!

  """センシティブかどうか"""
  isSensitive: Boolean!

  """いいね数"""
  likesCount: Int!

  """ランク"""
  rank: Int!

  """ユーザ"""
  user: UserNode!

  """作品数"""
  worksCount: Int!
}

"""ユーザランキングの並び順"""
enum UserRankingOrderBy {
  """平均いいね数でソート"""
  AVG_LIKES

  """いいね数でソート"""
  LIKES_COUNT

  """ランク順でソート"""
  RANK

  """作品数でソート"""
  WORKS_COUNT
}

"""ユーザランキングの絞り込み条件"""
input UserRankingsWhereInput {
  """日付 (YYYY-MM-DD形式)"""
  date: String

  """ソート"""
  orderBy: UserRankingOrderBy

  """昇順/降順"""
  sort: Sort
}

"""ユーザの設定"""
type UserSettingNode implements Node {
  enabledEditCategory: Boolean!
  favoritedImageGenerationModelIds: [Int!]!
  featurePromptonRequest: Boolean!
  id: ID!

  """全年齢作品へのいいねを匿名にするかどうか"""
  isAnonymousLikeAllAges: Boolean!

  """センシティブ作品へのいいねを匿名にするかどうか"""
  isAnonymousLikeSensitive: Boolean!

  """コメント投稿がBAN されているかどうか"""
  isCommentBanned: Boolean!

  """コメント通知するかどうか"""
  isNotifyComment: Boolean!

  """作品投稿がBAN されているかどうか"""
  isPostBanned: Boolean!

  """ミュートしているユーザのコメントを表示するかどうか"""
  isShowingMutedUsersComments: Boolean!

  """ミュートしているユーザの作品を表示するかどうか"""
  isShowingMutedUsersWorks: Boolean!

  """閲覧コンテンツ"""
  preferenceRating: PreferenceRating!

  """ダークモードを使用する"""
  useDarkMode: Boolean!
  useDisableGenerateTime: Int!
  user: UserNode!
  userId: ID!
}

input UserStickersWhereInput {
  """カテゴリ"""
  categories: [String!]

  """スタンプの保存状態"""
  savedTypes: [StickerSavedType!]

  """検索ワード"""
  search: String
}

type UserViewerNode implements Node {
  id: ID! @deprecated(reason: "")
  isFollowee: Boolean! @deprecated(reason: "")
  isFollower: Boolean! @deprecated(reason: "")
  isMuted: Boolean! @deprecated(reason: "")
}

input UserWorksWhereInput {
  """Aipictorsで生成された作品を取得するかどうか"""
  isGeneration: Boolean

  """センシティブな作品を取得するかどうか"""
  isSensitive: Boolean

  """モデル名"""
  modelName: String

  """年齢種別"""
  ratings: [Rating!]

  """検索ワード"""
  search: String
}

input UsersWhereInput {
  search: String
}

"""ログイン中のユーザ"""
type Viewer {
  """シリーズ数"""
  albumCount(where: ViewerAlbumsWhereInput): Int!

  """シリーズ"""
  albums(limit: Int!, offset: Int!, where: ViewerAlbumsWhereInput): [AlbumNode!]!

  """連続で生成可能な最大タスク数"""
  availableConsecutiveImageGenerationsCount: Int!

  """利用可能なLoRA数"""
  availableImageGenerationLoraModelsCount: Int!

  """レーティング可能な最大数"""
  availableImageGenerationMaxRatingCount: Int!

  """利用可能な最大タスク数"""
  availableImageGenerationMaxTasksCount: Int!

  """保存したスタンプ"""
  availableStickers(limit: Int!, offset: Int!): [StickerNode!]!

  """ブロックしたユーザ"""
  blockedUsers(limit: Int!, offset: Int!): [UserNode!]!

  """ブックマークフォルダID"""
  bookmarkFolderId: String

  """ブックマークしたモデル"""
  bookmarkedImageGenerationModels: [ImageModelNode!]!

  """お気に入りスタンプ一覧"""
  bookmarkedStickers(limit: Int!, offset: Int!, type: BookmarkedStickerType): [StickerNode!]!

  """通知確認時間一覧"""
  checkedNotificationTimes(where: NotificationsWhereInput): [CheckedNotificationTimeNode!]!

  """現在の有効な画像生成のメモ"""
  currentImageGenerationMemos: [ImageGenerationMemoNode!]!

  """現在の有効な画像生成のタスク"""
  currentImageGenerationResults: [ImageGenerationResultNode!]!

  """現在のパス"""
  currentPass: PassNode

  """自分の広告一覧"""
  customerAdvertisements(limit: Int!, offset: Int!, where: CustomerAdvertisementsWhereInput): [CustomerAdvertisementNode!]!

  """
  カスタマーポータル
  ※非推奨
  """
  customerPortalURL: String

  """お気に入りのモデル一覧"""
  favoritedImageGenerationModels: [ImageModelNode!]!

  """機能 - 全年齢作品の匿名いいね（選択可能）"""
  featureAnonymousLike: Boolean!

  """機能 - センシティブ作品の匿名いいね（選択可能）"""
  featureAnonymousSensitiveLike: Boolean!

  """機能 - コメント通知"""
  featureCommentNotification: Boolean!

  """機能 - センシティブな画像のぼかし"""
  featureSensitiveBlur: Boolean!

  """フィードの作品"""
  feedWorks(limit: Int!, offset: Int!): [WorkNode!]!

  """コレクション数"""
  folderCount(where: ViewerFoldersWhereInput): Int!

  """コレクション"""
  folders(limit: Int!, offset: Int!, where: ViewerFoldersWhereInput): [FolderNode!]!

  """フォローしているタグ一覧"""
  followingTags(limit: Int!, offset: Int!): [TagNode!]!

  """新しい通知がある"""
  hasUnreadNotifications(limit: Int!, offset: Int!, where: NotificationsWhereInput): Boolean!
  id: ID!

  """画像生成ジョブ"""
  imageGenerationJobs(limit: Int!, offset: Int!, where: ImageGenerationJobsWhereInput): [ImageGenerationJobNode!]!

  """有効な画像生成の結果"""
  imageGenerationResults(limit: Int!, offset: Int!, where: ImageGenerationResultsWhereInput): [ImageGenerationResultNode!]!

  """有効な画像生成のタスク"""
  imageGenerationTasks(limit: Int!, offset: Int!, where: ImageGenerationTasksWhereInput): [ImageGenerationTaskNode!]!

  """生成待ち人数（自身も含む）"""
  imageGenerationWaitCount: Int!

  """現在の予約生成中の画像生成のタスク"""
  inProgressImageGenerationReservedTasksCount: Int!

  """現在の生成中の画像生成のコスト"""
  inProgressImageGenerationTasksCost: Int!

  """現在の生成中の画像生成のタスク"""
  inProgressImageGenerationTasksCount: Int!

  """広告主かどうか"""
  isAdvertiser: Boolean!

  """センシティブ画像をぼかすかどうか"""
  isBlurSensitiveImage: Boolean!

  """新しい通知があるかどうか"""
  isExistedNewNotification: Boolean! @deprecated(reason: "hasUnreadNotifications")

  """過去にパス情報が存在したかどうか"""
  isExistedPreviousPass: Boolean!

  """モデレーターかどうか"""
  isModerator: Boolean!

  """いいねした作品"""
  likedPosts(limit: Int!, offset: Int!): [PostNode!]!

  """いいねした作品"""
  likedWorks(limit: Int!, offset: Int!): [WorkNode!]!

  """LINEアカウントID"""
  lineUserId: String

  """メッセージのスレッド"""
  messageThread(threadId: ID!): MessageThreadNode

  """メッセージのスレッド"""
  messageThreads(limit: Int!, offset: Int!): [MessageThreadNode!]!

  """ミュートしたタグ"""
  mutedTags(limit: Int!, offset: Int!): [MutedTagNode!]!

  """ミュートしたユーザ"""
  mutedUsers(limit: Int!, offset: Int!): [UserNode!]!

  """通知"""
  notifications(limit: Int!, offset: Int!, where: NotificationsWhereInput): [NotificationNode!]!

  """通知数"""
  notificationsCount(where: NotificationsWhereInput): Int!

  """決済履歴"""
  payments: [PaymentNode!]!

  """自分の投稿"""
  posts(limit: Int!, offset: Int!): [PostNode!]!

  """最近使ったタグ一覧"""
  recentlyUsedTags: [TagNode!]!

  """今日の有効な画像生成のタスクの数"""
  remainingImageGenerationTasksCount: Int!

  """現在の有効な画像生成の累計タスクの数"""
  remainingImageGenerationTasksTotalCount: Int!

  """作成したスタンプ"""
  stickers(limit: Int!, offset: Int!): [StickerNode!]!

  """お問い合わせ対応のメッセージ"""
  supportMessages(limit: Int!, offset: Int!): [MessageNode!]!

  """認証トークン"""
  token: String

  """ユーザ"""
  user: UserNode!

  """保存したスタンプ"""
  userStickers(limit: Int!, offset: Int!, orderBy: StickerOrderBy, where: UserStickersWhereInput): [StickerNode!]!

  """保存したスタンプ総数"""
  userStickersCount(orderBy: StickerOrderBy, where: UserStickersWhereInput): Int!

  """本人確認のURL"""
  verificationUrl: String!

  """閲覧した作品"""
  viewedWorks(limit: Int!, offset: Int!): [WorkNode!]!

  """保存したコレクション"""
  watchedFolders(limit: Int!, offset: Int!): [FolderNode!]!

  """自分の作品"""
  works(limit: Int!, offset: Int!): [WorkNode!]!
}

input ViewerAlbumsWhereInput {
  """ソート"""
  orderBy: AlbumOrderBy

  """年齢種別"""
  ratings: [AlbumRating!]

  """昇順/降順"""
  sort: Sort
}

input ViewerFoldersWhereInput {
  """ソート"""
  orderBy: FolderOrderBy

  """昇順/降順"""
  sort: Sort
}

input WatchAlbumInput {
  albumId: ID!
}

input WatchFolderInput {
  folderId: ID!
}

input WhiteListTagsInput {
  isSensitive: Boolean
  search: String
}

"""アワード（作品）"""
type WorkAwardNode implements Node {
  dateText: String!
  id: ID!
  index: Int!

  """ランキング集計時のいいね数"""
  snapshotLikedCount: Int!

  """ユーザ"""
  user: UserNode!
  userId: ID!

  """作品"""
  work: WorkNode
  workId: ID
}

"""通知（作品のランキング）"""
type WorkAwardNotificationNode implements Node {
  """時刻"""
  createdAt: Int!
  id: ID!

  """メッセージ"""
  message: String

  """種別"""
  type: String!

  """作品"""
  work: WorkNode
  workId: ID
}

input WorkAwardsWhereInput {
  date: String
  day: Int
  isSensitive: Boolean
  month: Int
  type: AwardType
  weekIndex: Int
  year: Int
}

"""通知（コメント）"""
type WorkCommentNotificationNode implements Node {
  createdAt: Int!
  id: ID!
  message: String
  myReplies: [CommentNode!]
  sticker: StickerNode
  stickerId: ID

  """種別"""
  type: String!
  user: UserNode
  userId: ID
  work: WorkNode
  workId: ID
}

"""通知（リプライ）"""
type WorkCommentReplyNotificationNode implements Node {
  """返信元のコメント"""
  comment: CommentNode
  createdAt: Int!
  id: ID!

  """メッセージ"""
  message: String

  """返信ID"""
  replyId: String!

  """スタンプ"""
  sticker: StickerNode
  stickerId: ID

  """種別"""
  type: String!

  """ユーザ"""
  user: UserNode
  userId: ID

  """作品"""
  work: WorkNode
  workId: ID
}

"""Bot評価情報"""
type WorkEvaluationNode {
  """美しさスコア（0-100）"""
  beautyScore: Int

  """色彩スコア（0-100）"""
  colorScore: Int

  """評価コメント"""
  comment(
    """言語（ja, en）"""
    locale: String
  ): String

  """構図スコア（0-100）"""
  compositionScore: Int

  """一貫性スコア（0-100）"""
  consistencyScore: Int

  """かっこよさスコア（0-100）"""
  coolnessScore: Int

  """可愛らしさスコア（0-100）"""
  cutenessScore: Int

  """細部描写スコア（0-100）"""
  detailScore: Int

  """独創性スコア（0-100）"""
  originalityScore: Int

  """総合スコア（0-100）"""
  overallScore: Int

  """評価者の性格タイプ"""
  personality: BotPersonality
}

"""作品"""
type WorkNode implements Node {
  """閲覧権限の種類"""
  accessType: AccessType!

  """運営による閲覧権限の種類"""
  adminAccessType: AdminAccessType!

  """シリーズ情報"""
  album: AlbumNode

  """ブックマーク数"""
  bookmarksCount: Int!

  """Bot評価情報（統合版）"""
  botEvaluation: WorkEvaluationNode

  """Bot評価：美しさスコア（0-100）"""
  botEvaluationBeautyScore: Int @deprecated(reason: "botEvaluationフィールドを使用してください")

  """Bot評価：色彩スコア（0-100）"""
  botEvaluationColorScore: Int @deprecated(reason: "botEvaluationフィールドを使用してください")

  """Bot評価コメント"""
  botEvaluationComment(
    """言語（ja, en）"""
    locale: String
  ): String @deprecated(reason: "botEvaluationフィールドを使用してください")

  """Bot評価：構図スコア（0-100）"""
  botEvaluationCompositionScore: Int @deprecated(reason: "botEvaluationフィールドを使用してください")

  """Bot評価：一貫性スコア（0-100）"""
  botEvaluationConsistencyScore: Int @deprecated(reason: "botEvaluationフィールドを使用してください")

  """Bot評価：かっこよさスコア（0-100）"""
  botEvaluationCoolnessScore: Int @deprecated(reason: "botEvaluationフィールドを使用してください")

  """Bot評価：可愛らしさスコア（0-100）"""
  botEvaluationCutenessScore: Int @deprecated(reason: "botEvaluationフィールドを使用してください")

  """Bot評価：細部描写スコア（0-100）"""
  botEvaluationDetailScore: Int @deprecated(reason: "botEvaluationフィールドを使用してください")

  """Bot評価：独創性スコア（0-100）"""
  botEvaluationOriginalityScore: Int @deprecated(reason: "botEvaluationフィールドを使用してください")

  """Bot評価：総合スコア（0-100）"""
  botEvaluationOverallScore: Int @deprecated(reason: "botEvaluationフィールドを使用してください")

  """Bot評価の性格タイプ"""
  botEvaluationPersonality: String

  """clipSkip"""
  clipSkip: Int

  """コメント"""
  comment(id: ID!): CommentNode! @deprecated(reason: "")

  """コメント"""
  comments(limit: Int!, offset: Int!): [CommentNode!]!

  """コメント数"""
  commentsCount: Int!

  """作成日"""
  createdAt: Int!

  """デイリーランキング"""
  dailyRanking: Int

  """テーマ"""
  dailyTheme: DailyThemeNode

  """説明"""
  description: String

  """説明(英語)"""
  enDescription: String

  """タイトル(英語)"""
  enTitle: String!

  """生成情報公開設定"""
  generationAccessType: String!

  """生成機で生成した場合のモデルID"""
  generationModelId: ID
  id: ID!

  """画像"""
  image: ImageNode @deprecated(reason: "廃止")

  """画像の比率"""
  imageAspectRatio: Float!

  """画像の高さ"""
  imageHeight: Int!

  """画像ID"""
  imageId: ID! @deprecated(reason: "廃止")

  """画像URL"""
  imageURL: String!

  """画像の幅"""
  imageWidth: Int!

  """ブックマークしている"""
  isBookmarked: Boolean!

  """Bot採点を使用するか"""
  isBotGradingEnabled: Boolean!

  """Bot採点を公開するか"""
  isBotGradingPublic: Boolean!

  """Bot採点ランキングに参加するか"""
  isBotGradingRankingEnabled: Boolean!

  """コメント編集許可"""
  isCommentsEditable: Boolean!

  """削除済み"""
  isDeleted: Boolean!

  """生成画像でプロンプト公開作品かどうか"""
  isGeneration: Boolean!

  """コレクションに追加している"""
  isInCollection: Boolean!

  """いいねしている"""
  isLiked: Boolean!

  """自分自身が推薦しているかどうか"""
  isMyRecommended: Boolean!

  """プロモーション作品かどうか"""
  isPromotion: Boolean!

  """センシティブである"""
  isSensitive: Boolean!

  """タグ編集許可"""
  isTagEditable: Boolean!

  """画像（大）URL（サムネイル）"""
  largeThumbnailImage: ImageNode @deprecated(reason: "廃止")

  """画像（大）の高さ"""
  largeThumbnailImageHeight: Int!
  largeThumbnailImageId: ID! @deprecated(reason: "廃止")

  """画像（大）のURL"""
  largeThumbnailImageURL: String!

  """画像（大）の幅"""
  largeThumbnailImageWidth: Int!

  """いいねしたユーザ"""
  likedUsers(limit: Int!, offset: Int!): [UserNode!]!

  """いいね数"""
  likesCount: Int!

  """マークダウン（コラム、小説用）のURL"""
  mdUrl: String!

  """画像生成関連の設定"""
  model: String

  """画像生成関連の設定"""
  modelHash: String

  """モデレータによる通知一覧"""
  moderatorReport: ModerationReportNode

  """マンスリーランキング"""
  monthlyRanking: Int

  """nanoid"""
  nanoid: String

  """ネガティブプロンプト"""
  negativePrompt: String

  """次の作品"""
  nextWork: WorkNode

  """画像生成関連の設定"""
  noise: String

  """画像URL（サムネイル）"""
  ogpThumbnailImage: ImageNode @deprecated(reason: "廃止")

  """OGP画像"""
  ogpThumbnailImageId: ID! @deprecated(reason: "廃止")

  """OGP画像URL"""
  ogpThumbnailImageUrl: String

  """Open Graph 説明"""
  openGraphDescription: String

  """Open Graph 画像"""
  openGraphImageURL: String

  """Open Graph タイトル"""
  openGraphTitle: String

  """その他の画像生成関連の設定"""
  otherGenerationParams: String

  """pngInfo"""
  pngInfo: String

  """前の作品"""
  previousWork: WorkNode

  """プロンプト"""
  prompt: String

  """プロンプトの閲覧権限の種類"""
  promptAccessType: AccessType!

  """年齢制限"""
  rating: Rating

  """関連するタグ"""
  relatedTags(limit: Int!, offset: Int!): [TagNode!]!

  """関連URL"""
  relatedUrl: String

  """関連する作品"""
  relatedWorks(limit: Int!, offset: Int!): [WorkNode!]!

  """画像生成関連の設定"""
  sampler: String

  """画像生成関連の設定"""
  scale: Float

  """シード値"""
  seed: Float

  """シェア"""
  shareText: String

  """画像（小）の高さ"""
  smallThumbnailImageHeight: Int!

  """画像（小）のURL"""
  smallThumbnailImageURL: String!

  """画像（小）の幅"""
  smallThumbnailImageWidth: Int!

  """画像生成関連の設定"""
  steps: Int

  """画像生成関連の設定"""
  strength: String

  """テイスト"""
  style: ImageStyle!

  """作品"""
  subWorks: [SubWorkNode!]!

  """複数画像数"""
  subWorksCount: Int!

  """タグ名"""
  tagNames: [String!]!
  tags: [TagNode!]!
  thumbnailImage: ImageNode @deprecated(reason: "廃止")

  """画像URL（サムネイル）"""
  thumbnailImageId: ID! @deprecated(reason: "廃止")

  """サムネイル画像の位置"""
  thumbnailImagePosition: Float

  """タイトル"""
  title: String!

  """種類"""
  type: String!

  """Cloudflare Stream の動画UID"""
  streamUid: String

  """更新日"""
  updatedAt: Int!

  """URL"""
  url: String

  """ユーザ"""
  user: UserNode

  """ユーザID"""
  userId: ID!

  """uuid"""
  uuid: String

  """VAE"""
  vae: String

  """非推奨"""
  viewer: WorkViewerNode @deprecated(reason: "isLikedを使用する")

  """閲覧数"""
  viewsCount: Int!

  """ウィークリーランキング"""
  weeklyRanking: Int

  """作品投稿時に選択したモデルID"""
  workModelId: Int
}

"""投稿（旧）の並び順"""
enum WorkOrderBy {
  """公開状態でソート"""
  ACCESS_TYPE

  """年齢種別でソート"""
  AGE_TYPE

  """ブックマーク数でソート"""
  BOOKMARKS_COUNT

  """コメント数でソート"""
  COMMENTS_COUNT

  """投稿日でソート"""
  DATE_CREATED

  """英語名でソート"""
  EN_NAME

  """広告作品かどうか"""
  IS_PROMOTION

  """いいね数でソート"""
  LIKES_COUNT

  """名前でソート"""
  NAME

  """閲覧数でソート"""
  VIEWS_COUNT

  """作品種別でソート"""
  WORK_TYPE
}

"""管理者権限で作品の設定を変更する内容"""
input WorkSettingsWithAdminInput {
  """公開状態"""
  accessType: AccessType

  """テイスト"""
  imageStyle: ImageStyle

  """利用者向けの対応理由メッセージ"""
  moderationMessage: String

  """年齢種別"""
  rating: Rating
  workId: ID!
}

"""作品の種類"""
enum WorkType {
  """コラム"""
  COLUMN

  """小説"""
  NOVEL

  """動画"""
  VIDEO

  """画像"""
  WORK
}

type WorkViewerNode implements Node {
  id: ID! @deprecated(reason: "")
  isBookmarked: Boolean! @deprecated(reason: "")
  isLiked: Boolean! @deprecated(reason: "")
}

input WorksFromOwnerWhereInput {
  """公開範囲"""
  accessTypes: [AccessType!]

  """(〜)作成日 ISO 8601フォーマット"""
  beforeCreatedAt: String

  """作成日(〜)"""
  createdAtAfter: String

  """生成モデル"""
  generationModelId: ID

  """プロンプトが存在する"""
  hasPrompt: Boolean

  """ID"""
  ids: [ID!]

  """画像生成の作品"""
  isFeatured: Boolean

  """フォロー中のユーザのみ"""
  isFollowing: Boolean

  """フォロー外のユーザのみ"""
  isNotFollowing: Boolean

  """(〜)最新の日付"""
  isNowCreatedAt: Boolean

  """1人1作品"""
  isOneWorkPerUser: Boolean

  """プロンプト公開"""
  isPromptPublic: Boolean

  """推薦"""
  isRecommended: Boolean

  """センシティブである"""
  isSensitive: Boolean

  """お題参加"""
  isThemeParticipated: Boolean

  """使用モデル名"""
  modelNames: [String!]

  """ソート"""
  orderBy: WorkOrderBy

  """投稿者名"""
  ownerName: String!

  """プロンプト"""
  prompts: [String!]

  """年齢種別"""
  ratings: [Rating!]

  """検索"""
  search: String

  """使用サービス"""
  serviceNames: [String!]

  """昇順/降順"""
  sort: Sort

  """スタイル(テイスト)"""
  style: ImageStyle

  """お題"""
  subjectId: Int

  """タグの名前"""
  tagNames: [String!]

  """作品形式"""
  workType: WorkType

  """作品形式"""
  workTypes: [WorkType!]
}

input WorksWhereInput {
  """公開範囲"""
  accessTypes: [AccessType!]

  """(〜)作成日 ISO 8601フォーマット"""
  beforeCreatedAt: String

  """作成日(〜)"""
  createdAtAfter: String

  """生成モデル"""
  generationModelId: ID

  """プロンプトが存在する"""
  hasPrompt: Boolean

  """ID"""
  ids: [ID!]

  """画像生成の作品"""
  isFeatured: Boolean

  """フォロー中のユーザのみ"""
  isFollowing: Boolean

  """非公開作品も含む"""
  isIncludePrivate: Boolean

  """フォロー外のユーザのみ"""
  isNotFollowing: Boolean

  """(〜)最新の日付"""
  isNowCreatedAt: Boolean

  """1人1作品"""
  isOneWorkPerUser: Boolean

  """プロンプト公開"""
  isPromptPublic: Boolean

  """推薦"""
  isRecommended: Boolean

  """センシティブである"""
  isSensitive: Boolean

  """お題参加"""
  isThemeParticipated: Boolean

  """使用モデル名"""
  modelNames: [String!]

  """投稿時に選択した使用モデルID"""
  modelPostedIds: [String!]

  """ソート"""
  orderBy: WorkOrderBy

  """投稿者名"""
  ownerName: String

  """プロンプト"""
  prompts: [String!]

  """年齢種別"""
  ratings: [Rating!]

  """作品を推薦したユーザID"""
  recommendedWorksUserId: ID

  """検索"""
  search: String

  """説明文も検索対象に含める"""
  searchInDescription: Boolean

  """タグも検索対象に含める"""
  searchInTags: Boolean

  """使用サービス"""
  serviceNames: [String!]

  """昇順/降順"""
  sort: Sort

  """スタイル(テイスト)"""
  style: ImageStyle

  """お題"""
  subjectId: Int

  """タグの名前"""
  tagNames: [String!]

  """ユーザID"""
  userId: ID

  """作品形式"""
  workType: WorkType

  """作品形式"""
  workTypes: [WorkType!]
}