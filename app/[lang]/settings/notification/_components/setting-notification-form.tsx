"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const SettingNotificationForm: React.FC = () => {
  return (
    <>
      <div className="space-y-4">
        <p>{"匿名いいね"}</p>
        <div className="flex justify-between">
          <Label>{"全年齢いいね"}</Label>
          <Input type="checkbox" className="form-switch" />
        </div>
        <div className="flex justify-between">
          <Label>{"R-18いいね"}</Label>
          <Input type="checkbox" className="form-switch" />
        </div>
      </div>
      <div className="space-y-4">
        <p>{"オフにすると次回以降の通知がされなくなります"}</p>
        <div className="flex justify-between">
          <Label>{"定期いいね通知"}</Label>
          <Input type="checkbox" className="form-switch" />
        </div>
        <div className="flex justify-between">
          <Label>{"リアルタイムいいね通知"}</Label>
          <Input type="checkbox" className="form-switch" />
        </div>
        <div className="flex justify-between">
          <Label>{"コメント"}</Label>
          <Input type="checkbox" className="form-switch" />
        </div>
      </div>
    </>
  )
}
