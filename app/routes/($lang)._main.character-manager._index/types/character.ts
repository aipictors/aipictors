export type Character = {
  id: string
  name: string
  description?: string | null
  promptText?: string | null
  imageUrl?: string
  createdAt?: string
  updatedAt?: string
}

export type Expression = {
  id: string
  name: string
  description?: string
  imageUrl?: string
  promptModifier: string
  tags: string[]
  createdAt: string
}
