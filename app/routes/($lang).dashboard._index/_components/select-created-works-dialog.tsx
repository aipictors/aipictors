import { useContext, useState } from "react"
import { Dialog, DialogTrigger, DialogContent } from "@/_components/ui/dialog"
import { Button } from "@/_components/ui/button"
import type { WorksQuery } from "@/_graphql/__generated__/graphql"
import { worksQuery } from "@/_graphql/queries/work/works"
import { useSuspenseQuery } from "@apollo/client/index"
import { AuthContext } from "@/_contexts/auth-context"
import { ImageIcon } from "lucide-react"

type Props = {
  children?: React.ReactNode
}

/**
 * 作成済みの作品選択ダイアログ
 */
export const SelectCreatedWorksDialog = (props: Props) => {
  const appContext = useContext(AuthContext)

  const [isOpen, setIsOpen] = useState<boolean>(false)

  const [selectedWorks, setSelectedWorks] = useState<WorksQuery["works"]>([])

  const worksResult = useSuspenseQuery(worksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: 0,
      limit: 32,
      where: {
        userId: appContext.userId,
        orderBy: "DATE_CREATED",
        sort: "DESC",
      },
    },
  })

  const works = worksResult.data?.works

  function setTitle(value: string) {
    throw new Error("Function not implemented.")
  }

  function setDescription(value: string) {
    throw new Error("Function not implemented.")
  }

  if (!works?.length) {
    return (
      <>
        <div className="p-4">
          <ImageIcon className="m-auto h-8 w-8 opacity-70" />
          <p className="p-4 text-center text-sm">作品がありません。</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(isOpen) => {
          setIsOpen((prev) => (prev !== isOpen ? isOpen : prev))
        }}
      >
        <DialogTrigger asChild>
          {props.children ? props.children : <Button>作品選択</Button>}
        </DialogTrigger>
        <DialogContent>
          {"作品選択"}
          {works.map((work) => {
            return (
              <div key={work.id}>
                <Button onClick={() => {}}>{work.title}</Button>
              </div>
            )
          })}
          <div className="space-y-4">{""}</div>
          <Button onClick={() => {}}>決定</Button>
          <Button
            variant={"secondary"}
            onClick={() => {
              setIsOpen(false)
            }}
          >
            キャンセル
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
