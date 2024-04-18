import { Avatar } from "@/_components/ui/avatar"
import { Button } from "@/_components/ui/button"
import { Input } from "@/_components/ui/input"
import { PlusIcon } from "lucide-react"
import { useState } from "react"

export const AccountProfileForm = () => {
  const [userName, setUserName] = useState("")

  const [userProfile, setUserProfile] = useState("")

  const [userProfileEn, setUserProfileEn] = useState("")

  const [userTwitter, setUserTwitter] = useState("")

  const [userInstagram, setUserInstagram] = useState("")

  const [userGitHub, setUserGitHub] = useState("")

  const [userHomePage, setUserHomePage] = useState("")

  const [userMail, setUserMail] = useState("")

  return (
    <div className="w-full space-y-8">
      <div className="flex space-x-4">
        <Button aria-label="Search database">
          <PlusIcon className="mr-2" />
          {"ヘッダー追加ボタン"}
        </Button>
      </div>
      <div className="flex space-x-4">
        <Avatar />
        <Button>{"アイコン追加ボタン"}</Button>
      </div>
      <div className="space-y-4">
        <div>
          <p>{"ユーザ名"}</p>
          <Input
            placeholder="ユーザ名"
            value={userName}
            onChange={(event) => {
              setUserName(event.target.value)
            }}
          />
        </div>
        <div>
          <p>{"プロフィール"}</p>
          <Input
            placeholder="プロフィール"
            value={userProfile}
            onChange={(event) => {
              setUserProfile(event.target.value)
            }}
          />
        </div>
        <div>
          <p>{"英語環境向けプロフィール"}</p>
          <Input
            placeholder="プロフィール"
            value={userProfileEn}
            onChange={(event) => {
              setUserProfileEn(event.target.value)
            }}
          />
        </div>
        <div>
          <p>{"Twitter"}</p>
          <Input
            placeholder="ユーザID"
            value={userTwitter}
            onChange={(event) => {
              setUserTwitter(event.target.value)
            }}
          />
        </div>
        <div>
          <p>{"Instagram"}</p>
          <Input
            placeholder="ユーザID"
            value={userInstagram}
            onChange={(event) => {
              setUserInstagram(event.target.value)
            }}
          />
        </div>
        <div>
          <p>{"GitHub"}</p>
          <Input
            placeholder="ユーザID"
            value={userGitHub}
            onChange={(event) => {
              setUserGitHub(event.target.value)
            }}
          />
        </div>
        <div>
          <p>{"ホームページ"}</p>
          <Input
            placeholder="URL"
            value={userHomePage}
            onChange={(event) => {
              setUserHomePage(event.target.value)
            }}
          />
        </div>
        <div>
          <p>{"メール"}</p>
          <Input
            placeholder="メールアドレス"
            value={userMail}
            onChange={(event) => {
              setUserMail(event.target.value)
            }}
          />
        </div>
      </div>
      <Button onClick={() => {}}>{"変更を保存"}</Button>
    </div>
  )
}
