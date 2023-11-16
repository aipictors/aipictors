"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const TitleWorkCard = () => {
  return (
    <Card>
      <Button>
        <img src="https://source.unsplash.com/random/800x600" alt="" />
      </Button>
      <p className="text-xs">{"title"}</p>
    </Card>
  )
}
