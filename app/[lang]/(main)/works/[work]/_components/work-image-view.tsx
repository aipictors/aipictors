type Props = {
  workImageURL?: string
  subWorkImageURLs: string[]
}

export const WorkImageView = (props: Props) => {
  return (
    <div className="space-y-4">
      <img
        className="w-full h-full object-cover rounded"
        alt=""
        src={props.workImageURL}
      />
      {props.subWorkImageURLs.map((imageURL) => (
        <img
          key={imageURL}
          className="w-full h-full rounded"
          alt=""
          src={imageURL}
        />
      ))}
    </div>
  )
}
