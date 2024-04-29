import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/_components/ui/accordion"
import { Button } from "@/_components/ui/button"
import { ScrollArea } from "@/_components/ui/scroll-area"
import { aiModelsQuery } from "@/_graphql/queries/model/models"
import { CaptionInput } from "@/routes/($lang)._main.new.image/_components/caption-input"
import { DateInput } from "@/routes/($lang)._main.new.image/_components/date-input"
import { ModelInput } from "@/routes/($lang)._main.new.image/_components/model-input"
import { RatingInput } from "@/routes/($lang)._main.new.image/_components/rating-input"
import { TasteInput } from "@/routes/($lang)._main.new.image/_components/taste-input"
import { TitleInput } from "@/routes/($lang)._main.new.image/_components/title-input"
import { ViewInput } from "@/routes/($lang)._main.new.image/_components/view-input"
import type { AiModel } from "@/routes/($lang)._main.new.image/_types/model"
import { useQuery } from "@apollo/client/index.js"
import {} from "@dnd-kit/core"
import { useContext, useState } from "react"
import type { Tag } from "@/_components/tag/tag-input"
import { TagsInput } from "@/routes/($lang)._main.new.image/_components/tag-input"
import { dailyThemeQuery } from "@/_graphql/queries/daily-theme/daily-theme"
import { ThemeInput } from "@/routes/($lang)._main.new.image/_components/theme-input"
import { CategoryEditableInput } from "@/routes/($lang)._main.new.image/_components/category-editable-input"
import { albumsQuery } from "@/_graphql/queries/album/albums"
import { AlbumInput } from "@/routes/($lang)._main.new.image/_components/series-input"
import { AuthContext } from "@/_contexts/auth-context"
import { RelatedLinkInput } from "@/routes/($lang)._main.new.image/_components/related-link-input"
import { AdWorkInput } from "@/routes/($lang)._main.new.image/_components/ad-work-input"
import type { PNGInfo } from "@/_utils/get-extract-info-from-png"
import { GenerationParamsInput } from "@/routes/($lang)._main.new.image/_components/generation-params-input"
import { Checkbox } from "@/_components/ui/checkbox"
import { whiteListTagsQuery } from "@/_graphql/queries/tag/white-list-tags"
import { ImagesAndVideoInput } from "@/routes/($lang)._main.new.image/_components/images-and-video.input"
import { recommendedTagsFromPromptsQuery } from "@/_graphql/queries/tag/recommended-tags-from-prompts"
import { Loader2Icon } from "lucide-react"
export const NewImageForm = () => {
  const authContext = useContext(AuthContext)

  const { data: aiModels } = useQuery(aiModelsQuery, {
    variables: {
      limit: 124,
      offset: 0,
      where: {},
    },
    fetchPolicy: "cache-first",
  })

  const [pngInfo, setPngInfo] = useState<PNGInfo | null>(null)

  const { data: recommendedTagsRet, loading: recommendedTagsLoading } =
    useQuery(recommendedTagsFromPromptsQuery, {
      variables: {
        prompts: pngInfo?.params.prompt ?? "girl",
      },
    })

  const recommendedTags = recommendedTagsRet?.recommendedTagsFromPrompts?.map(
    (tag) =>
      ({
        id: tag.id,
        text: tag.name,
      }) as Tag,
  )

  const [date, setDate] = useState(new Date())

  const [isHideTheme, setIsHideTheme] = useState(false)

  const [isSensitiveWhiteTags, setIsSensitiveWhiteTags] = useState(false)

  const { data: whiteTagsRet } = useQuery(whiteListTagsQuery, {
    variables: {
      where: {
        isSensitive: isSensitiveWhiteTags,
      },
    },
    fetchPolicy: "cache-first",
  })

  const whiteTags = whiteTagsRet?.whiteListTags
    ? whiteTagsRet.whiteListTags.map(
        (tag) =>
          ({
            id: tag.id,
            text: tag.name,
          }) as Tag,
      )
    : []

  const {
    data: theme,
    loading: themeLoading,
    error,
  } = useQuery(dailyThemeQuery, {
    variables: {
      year: date.getFullYear(),
      month: date.getMonth() + 1, // getMonth()は0から始まるので、1を足す
      day: date.getDate(), // getDate()は月の日にちを返す
      offset: 0,
      limit: 0,
    },
    fetchPolicy: "cache-first",
  })

  const { data: albums } = useQuery(albumsQuery, {
    skip: authContext.isLoading,
    variables: {
      limit: 124,
      offset: 0,
      where: {
        ownerUserId: authContext.userId,
        isSensitiveAndAllRating: true,
        needInspected: false,
        needsThumbnailImage: false,
      },
    },
  })

  console.log(albums)

  const optionAlbums = albums?.albums
    ? (albums?.albums.map((album) => ({
        id: album.id,
        name: album.title,
      })) as AiModel[])
    : []

  const optionModels = aiModels
    ? (aiModels?.aiModels.map((model) => ({
        id: model.workModelId,
        name: model.name,
      })) as AiModel[])
    : []

  /**
   * 画像の配列を保持する状態
   */
  const [isHovered, setIsHovered] = useState(false)

  const [videoFile, setVideoFile] = useState<File | null>(null)

  const [title, setTitle] = useState("")

  const [enTitle, setEnTitle] = useState("")

  const [caption, setCaption] = useState("")

  const [enCaption, setEnCaption] = useState("")

  const [themeId, setThemeId] = useState("")

  const [imageBase64List, setImageBase64List] = useState([""])

  const [albumId, setAlbumId] = useState("")

  const [link, setLink] = useState("")

  const [tags, setTags] = useState<Tag[]>([])

  const [isTagEditable, setIsTagEditable] = useState(false)

  const [isAd, setIsAd] = useState(false)

  const [ratingRestriction, setRatingRestriction] = useState("G")

  const [viewMode, setViewMode] = useState("public")

  const [taste, setTaste] = useState("illust")

  const [aiUsed, setAiUsed] = useState("1")

  const [reservationDate, setReservationDate] = useState("")

  const [reservationTime, setReservationTime] = useState("")

  const [isSetGenerationParams, setIsSetGenerationParams] = useState(true)

  return (
    <>
      <div className="relative w-[100%]">
        <div className="mb-4 bg-gray-100 dark:bg-black">
          <div
            // biome-ignore lint/nursery/useSortedClasses: <explanation>
            className={`items-center mb-2 p-2 rounded bg-gray-800 ${
              isHovered ? "border-2 border-white border-dashed" : ""
            }`}
          >
            {/* <ImagesInput
              onChangePngInfo={setPngInfo}
              onChange={setImageBase64List}
              onDelete={() => {
                // もし全ての画像が削除されたらPNGInfoをnullにする
                if (imageBase64List.length === 1) {
                  setPngInfo(null)
                }
              }}
            /> */}

            <ImagesAndVideoInput
              onChangePngInfo={setPngInfo}
              onChange={setImageBase64List}
              onDelete={() => {
                // もし全ての画像が削除されたらPNGInfoをnullにする
                if (imageBase64List.length === 1) {
                  setPngInfo(null)
                }
              }}
              onVideoChange={(videoFile: File | null) => {
                setVideoFile(videoFile)
              }}
            />

            <div className="m-4 flex flex-col text-white">
              <p className="text-center text-sm">
                JPEG、PNG、GIF、WEBP、BMP、MP4
              </p>
              <p className="text-center text-sm">
                1枚32MB以内、最大200枚、動画は32MB、12秒まで
              </p>
            </div>
          </div>
          <ScrollArea className="max-h-[100%] overflow-y-auto p-2 md:max-h-[64vh]">
            <TitleInput onChange={setTitle} />
            <CaptionInput setCaption={setCaption} />
            <Accordion type="single" collapsible>
              <AccordionItem value="setting">
                <AccordionTrigger>
                  <Button variant={"secondary"} className="w-full">
                    英語キャプションを入力
                  </Button>
                </AccordionTrigger>
                <AccordionContent className="space-y-2">
                  <TitleInput label={"英語タイトル"} onChange={setEnTitle} />
                  <CaptionInput
                    label={"英語キャプション"}
                    setCaption={setEnCaption}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <RatingInput
              rating={ratingRestriction}
              setRating={setRatingRestriction}
            />
            <ViewInput viewMode={viewMode} setViewMode={setViewMode} />
            <TasteInput taste={taste} setTaste={setTaste} />
            <ModelInput
              model={aiUsed}
              models={optionModels}
              setModel={setAiUsed}
            />
            {pngInfo && (
              <div className="items-center">
                <Checkbox
                  checked={isSetGenerationParams}
                  onCheckedChange={() => {
                    setIsSetGenerationParams((prev) => !prev)
                  }}
                  id="set-generation-check"
                />
                <label
                  htmlFor="set-generation-check"
                  className="ml-2 font-medium text-sm"
                >
                  生成情報を公開する
                </label>
              </div>
            )}
            {pngInfo && isSetGenerationParams && (
              <Accordion type="single" collapsible>
                <AccordionItem value="setting">
                  <AccordionTrigger>
                    <Button variant={"secondary"} className="w-full">
                      生成情報を確認する
                    </Button>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <GenerationParamsInput
                      pngInfo={pngInfo}
                      setPngInfo={setPngInfo}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            <DateInput
              date={reservationDate}
              time={reservationTime}
              setDate={(value: string) => {
                setReservationDate(value)
                const today = new Date()
                today.setHours(0, 0, 0, 0) // 今日の日付の始まりに時間をセット
                const threeDaysLater = new Date(today)
                threeDaysLater.setDate(today.getDate() + 3) // 3日後の日付を設定

                const changeDate = new Date(value)
                changeDate.setHours(0, 0, 0, 0) // 入力された日付の時間をリセット

                // 入力された日付が今日または未来（今日から3日後まで）である場合のみ更新
                if (changeDate >= today && changeDate <= threeDaysLater) {
                  setDate(changeDate)
                  setIsHideTheme(false)
                } else {
                  setIsHideTheme(true)
                }
                setThemeId("")
              }}
              setTime={setReservationTime}
            />
            {!isHideTheme && (
              <ThemeInput
                onChange={(value: boolean) => {
                  if (value) {
                    setThemeId(theme?.dailyTheme?.id ?? "")
                    // タグをセット
                    setTags([
                      ...tags,
                      {
                        id: 9999,
                        text: theme?.dailyTheme?.title,
                      } as unknown as Tag,
                    ])
                  } else {
                    setThemeId("")
                    // タグを削除
                    const newTags = tags.filter(
                      (tag) => tag.text !== theme?.dailyTheme?.title,
                    )
                    setTags(newTags)
                  }
                }}
                title={theme?.dailyTheme?.title ?? ""}
                isLoading={themeLoading}
              />
            )}
            <TagsInput
              whiteListTags={whiteTags}
              tags={tags}
              setTags={setTags}
              recommendedTags={recommendedTags ?? []}
            />

            {recommendedTagsLoading && (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            )}
            <CategoryEditableInput
              isChecked={isTagEditable}
              onChange={setIsTagEditable}
            />
            <AlbumInput
              album={albumId}
              albums={optionAlbums}
              setAlbumId={(value: string) => {
                setAlbumId(value)
              }}
            />
            <RelatedLinkInput link={link} onChange={setLink} />
            <AdWorkInput isChecked={isAd} onChange={setIsAd} />
          </ScrollArea>
        </div>
        <Button
          className="bottom-0 mb-2 w-full"
          type="submit"
          onClick={() => {
            // ここに投稿処理を書く
            console.log(imageBase64List)
          }}
        >
          投稿
        </Button>
      </div>
    </>
  )
}
