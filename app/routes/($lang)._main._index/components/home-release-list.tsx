import { Link, useNavigate } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import type { MicroCmsApiReleaseResponse } from "~/types/micro-cms-release-response"

type Props = {
  releaseList: MicroCmsApiReleaseResponse
}

export function HomeReleaseList({ releaseList }: Props) {
  const navigate = useNavigate()

  const onMore = () => {
    navigate("/releases")
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-md">お知らせ</h2>
        <Button
          onClick={onMore}
          variant={"secondary"}
          className="rounded-md px-4 py-1"
        >
          {"お知らせ一覧"}
        </Button>
      </div>
      <div className="">
        {releaseList.contents.map((release) => (
          <Link
            key={release.id}
            className="flex items-center space-x-4 border-t p-4"
            to={`/releases/${release.id}`}
          >
            <div className="w-24 text-sm opacity-50">
              {new Date(release.createdAt).toLocaleDateString("ja-JP")}
            </div>
            <div className="flex flex-col">
              <p className="text-md">{release.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
