import type { UserQuery } from "@/__generated__/apollo"

type Props = {
  user: NonNullable<UserQuery["user"]>
}

export const UserProfileHeader = (props: Props) => {
  return (
    <div>
      <img
        src={props.user.headerImage?.downloadURL ?? ""}
        alt={props.user.name}
      />
    </div>
  )
}
