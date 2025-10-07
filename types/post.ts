
export interface Root {
  data: Daum[]
}

export interface Daum {
  _id: string
  content: string
  createdBy: CreatedBy
  like: Like[]
  comment: Comment[]
  createdAt: string
  updatedAt: string
  __v: number
}

export interface CreatedBy {
  _id: string
  firstname: string
  lastname: string
  email: string
  image?: string
}

export interface Like {
  _id: string
  firstname: string
  lastname: string
  email: string
}

export interface Comment {
  _id: string
  content: string
  createdBy: CreatedBy
  createdAt: string
  updatedAt: string
}

export interface CreatePostRequest {
  content: string
}

export interface CreateCommentRequest {
  content: string
  statusId: string
}

export interface DeleteCommentRequest {
  statusId: string
  commentId: string
}

export interface LikeRequest {
  statusId: string
}

export interface UnlikeRequest {
  statusId: string
}

export interface DeletePostRequest {
  statusId: string;
}
