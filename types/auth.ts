
export interface Root {
  data: Data;
}

export interface Data {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  type: string;
  confirmed: boolean;
  createdAt: string;
  job: any[];
  updatedAt: string;
  __v: number;
  education: Education;
  image: string;
  token: string;
}

export interface Education {
  major: string;
  enrollmentYear: any;
  studentId: string;
  schoolId: any;
  schoolProvince: any;
  advisorId: any;
  _id: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}
