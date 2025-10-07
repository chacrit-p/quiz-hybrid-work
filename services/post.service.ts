
import {
  CreateCommentRequest,
  CreatePostRequest,
  DeleteCommentRequest,
  DeletePostRequest,
  LikeRequest,
  Root,
  UnlikeRequest
} from '@/types/post';
import { ApiClient } from './api.client';

export class PostService {
  static async getAllPosts(): Promise<Root> {
    return ApiClient.get<Root>('/status');
  }

  static async createPost(data: CreatePostRequest): Promise<any> {
    return ApiClient.post('/status', data);
  }

  static async deletePost(statusId: DeletePostRequest): Promise<any> {
    return ApiClient.request(`/status/${statusId}`, {
      method: 'DELETE',
    });
  }

  static async createComment(data: CreateCommentRequest): Promise<any> {
    return ApiClient.request('/comment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async deleteComment(commentId: string, data: DeleteCommentRequest): Promise<any> {
    return ApiClient.request(`/comment/${commentId}`, {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  }

  static async toggleLike(data: LikeRequest): Promise<any> {
    return ApiClient.request('/like', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async toggleUnlike(data: UnlikeRequest): Promise<any> {
    return ApiClient.request('/like', {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  }
}
