import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo } from "react"

type Props = {
  userId: string
}

export const UserTabs = (props: Props) => {
  const pathname = usePathname()

  const index = useMemo(() => {
    switch (pathname) {
      case `/users/${props.userId}`:
        return 0
      case `/users/${props.userId}/novels`:
        return 1
      case `/users/${props.userId}/notes`:
        return 2
      case `/users/${props.userId}/albums`:
        return 3
      case `/users/${props.userId}/collections`:
        return 4
      case `/users/${props.userId}/stickers`:
        return 5
      case `/users/${props.userId}/supports`:
        return 6
      default:
        return 0
    }
  }, [pathname, props.userId])

  return (
    <div className="flex overflow-x-auto w-full">
      <div className="w-full">
        <Button asChild>
          <Link href={`/users/${props.userId}`} className={"min-w-32"}>
            {"画像"}
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/users/${props.userId}/novels`} className={"min-w-32"}>
            {"小説"}
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/users/${props.userId}/notes`} className={"min-w-32"}>
            {"コラム"}
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/users/${props.userId}/albums`} className={"min-w-32"}>
            {"シリーズ"}
          </Link>
        </Button>
        <Button asChild>
          <Link
            href={`/users/${props.userId}/collections`}
            className={"min-w-32"}
          >
            {"コレクション"}
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/users/${props.userId}/stickers`} className={"min-w-32"}>
            {"スタンプ"}
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/users/${props.userId}/supports`} className={"min-w-32"}>
            {"支援応援"}
          </Link>
        </Button>
      </div>
    </div>
  )
}
