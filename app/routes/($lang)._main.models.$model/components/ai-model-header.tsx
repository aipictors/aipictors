import { useNavigate } from "@remix-run/react"
import { EllipsisIcon, RefreshCcwIcon } from "lucide-react"
import { AppConfirmDialog } from "~/components/app/app-confirm-dialog"
import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "~/components/ui/popover"
import { Switch } from "~/components/ui/switch"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"

type Props = {
  name: string
  thumbnailImageURL: string | null
  isSensitive: boolean
  isMoreRatings: boolean
  hasPrompt: boolean
  worksCount: number
}

export function AiModelHeader(props: Props) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/models">モデル一覧</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${props.name}`}>
              {props.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-col items-center justify-between space-y-4 rounded-lg md:flex-row md:space-x-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          {props.thumbnailImageURL && (
            <img
              src={props.thumbnailImageURL}
              alt={props.name}
              className="h-12 w-12 rounded-md border border-gray-300 object-cover"
            />
          )}
          <div className="flex flex-col">
            {props.isSensitive ? (
              <h1 className="font-semibold text-2xl">
                {props.name}で生成されたR18作品一覧（{props.worksCount}件）
              </h1>
            ) : (
              <h1 className="font-semibold text-2xl">
                {props.name}で生成された作品一覧（{props.worksCount}件）
              </h1>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          {props.isSensitive ? (
            <div className="flex items-center space-x-2">
              <Switch
                onClick={() => {
                  navigate(
                    `/porn/models/${props.name}?r18g=${props.isMoreRatings ? "0" : "1"}&prompt=${props.hasPrompt ? "1" : "0"}`,
                  )
                }}
                checked={props.isMoreRatings}
              />
              <span className="text-sm">R18Gを表示</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Switch
                onClick={() => {
                  navigate(
                    `/models/${props.name}?r15=${props.isMoreRatings ? "0" : "1"}&prompt=${props.hasPrompt ? "1" : "0"}`,
                  )
                }}
                checked={props.isMoreRatings}
              />
              <span className="text-sm">R15を表示</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Switch
              onClick={() => {
                if (props.isSensitive) {
                  navigate(
                    `/porn/models/${props.name}?r18g=${props.isMoreRatings ? "1" : "0"}&prompt=${props.hasPrompt ? "0" : "1"}`,
                  )
                } else {
                  navigate(
                    `/models/${props.name}?r15=${props.isMoreRatings ? "1" : "0"}&prompt=${props.hasPrompt ? "0" : "1"}`,
                  )
                }
              }}
              checked={props.hasPrompt}
            />
            <span className="text-sm">プロンプト有</span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button size={"icon"} variant="secondary">
                <EllipsisIcon className="w-16" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="relative grid gap-4">
                {!props.isSensitive ? (
                  <AppConfirmDialog
                    title={"確認"}
                    description={
                      "センシティブな作品を表示します、あなたは18歳以上ですか？"
                    }
                    onNext={() => {
                      navigate(`/porn/models/${props.name}`)
                    }}
                    cookieKey={"check-sensitive-ranking"}
                    onCancel={() => {}}
                  >
                    <Button
                      variant={"secondary"}
                      className="flex w-full transform cursor-pointer items-center"
                    >
                      <RefreshCcwIcon className="mr-1 w-3" />
                      <p className="text-sm">{"対象年齢"}</p>
                    </Button>
                  </AppConfirmDialog>
                ) : (
                  <Button
                    onClick={() => {
                      navigate(`/models/${props.name}`)
                    }}
                    variant={"secondary"}
                    className="flex w-full transform cursor-pointer items-center"
                  >
                    <RefreshCcwIcon className="mr-1 w-3" />
                    <p className="text-sm">{"対象年齢"}</p>
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
