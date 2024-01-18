export default function MainPageLoading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="flex justify-center items-center w-full h-screen">
      <div className="animate-spin h-12 w-12 rounded-full border-t-4" />
    </div>
  )
}
