import { graphql } from "gql.tada"

export const VIEWER_TOKEN_QUERY = graphql(`
  query ViewerToken {
    viewer {
      id
      token
    }
  }
`)

export const VIEWER_CURRENT_PASS = graphql(`
  query ViewerCurrentPass {
    viewer {
      id
      currentPass {
        id
        type
        remainingImageGenerations
        maxImageGenerations
      }
    }
  }
`)

export const CREATE_EXPRESSIONS_FROM_IMAGE = graphql(
  `mutation CreateExpressionsFromImage($input: CreateExpressionsFromImageInput!) {
    createExpressionsFromImage(input: $input) {
      totalCostUsed
      maxCostLimit
      generatedExpressions
      totalExpressions
      results {
        id
      }
      skippedExpressions
    }
  }`,
)

export const VIEWER_CHARACTERS = graphql(
  `query ViewerCharacters($offset: Int!, $limit: Int!) {
    characters(offset: $offset, limit: $limit) {
      id
      name
      description
      baseImageUrl
      thumbnailUrl
      isPublic
      createdAt
      nanoid
      expressions {
        id
        expressionName
        imageUrl
        createdAt
      }
    }
  }`,
)

export const CHARACTER_WITH_EXPRESSIONS = graphql(
  `query CharacterWithExpressions($characterId: String!) {
    character(id: $characterId) {
      id
      name
      description
      baseImageUrl
      thumbnailUrl
      isPublic
      createdAt
      expressions {
        id
        expressionName
        imageUrl
        createdAt
      }
    }
  }`,
)

export const CHARACTER_DETAIL = graphql(
  `query CharacterDetail($characterId: String!) {
    character(id: $characterId) {
      id
      name
      description
      baseImageUrl
      thumbnailUrl
      isPublic
      createdAt
      expressions {
        id
        expressionName
        imageUrl
        createdAt
      }
    }
  }`,
)

export const DELETE_IMAGE_GENERATION_RESULT = graphql(
  `mutation DeleteImageGenerationResult($input: DeleteImageGenerationResultInput!) {
    deleteImageGenerationResult(input: $input) {
      id
    }
  }`,
)

export const CREATE_CHARACTER_EXPRESSION = graphql(
  `mutation CreateCharacterExpression($input: CreateCharacterExpressionInput!) {
    createCharacterExpression(input: $input) {
      id
      expressionName
      imageUrl
      createdAt
    }
  }`,
)

export const DELETE_CHARACTER = graphql(
  `mutation DeleteCharacter($characterId: String!) {
    deleteCharacter(characterId: $characterId)
  }`,
)
