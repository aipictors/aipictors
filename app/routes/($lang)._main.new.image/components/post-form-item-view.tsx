import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { Card, CardContent } from "~/components/ui/card"

type Props = {
  accessType: IntrospectionEnum<"AccessType">
  setAccessType: (value: IntrospectionEnum<"AccessType">) => void
}

/**
 * 公開モード入力
 */
export const PostFormItemView = (props: Props) => {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">公開モード</p>
        <RadioGroup
          value={props.accessType}
          onValueChange={(value) => {
            props.setAccessType(value as IntrospectionEnum<"AccessType">)
          }}
          className="flex flex-wrap space-x-0 md:space-x-4"
        >
          <div className="w-1/2 md:w-auto">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PUBLIC" id="view-public" />
              <label htmlFor="view-public">{"公開"}</label>
            </div>
          </div>
          <div className="w-1/2 md:w-auto">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PRIVATE" id="view-archive" />
              <label htmlFor="view-archive">{"非公開"}</label>
            </div>
          </div>
          <div className="w-1/2 md:w-auto">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="LIMITED" id="view-limited" />
              <label htmlFor="view-limited">{"限定公開"}</label>
            </div>
          </div>
          <div className="w-1/2 md:w-auto">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="SILENT" id="view-silent" />
              <label htmlFor="view-silent">{"新着非公開"}</label>
            </div>
          </div>
          <div className="w-1/2 md:w-auto">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="DRAFT" id="view-draft" />
              <label htmlFor="view-draft">{"下書き"}</label>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
