
import { ApiClient } from './api.client';
import { Root } from '@/types/classroom';

export class ClassroomService {
  static async getStudentsByYear(year: string): Promise<Root> {
    return ApiClient.get<Root>(`/class/${year}`);
  }
}
