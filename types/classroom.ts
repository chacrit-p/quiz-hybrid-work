export interface Root {
  data: Daum[]
}

export interface Daum {
  _id: string
  firstname: string
  lastname: string
  email: string
  role: string
  type: string
  confirmed: boolean
  createdAt: string
  job: any[]
  updatedAt: string
  __v: number
  education: Education
  image?: string
}

export interface Education {
  major: string
  enrollmentYear: string
  studentId: string
  schoolId?: string
  schoolProvince?: string
  advisorId: any
  _id: string
  school?: School
}

export interface School {
  _id: string
  name: string
  province: string
  logo: string
}