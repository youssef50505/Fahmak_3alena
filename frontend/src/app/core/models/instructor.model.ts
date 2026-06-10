export interface InstructorStats {
  totalActiveStudents: number;
  avgCourseScore: number;
  completionRate: number;
}

export interface StudentProgress {
  id: string;
  studentName: string;
  studentEmail: string;
  enrolledCourse: string;
  progressPercentage: number;
  currentScore: number;
  avatarUrl: string;
}

export interface InstructorDashboardResponse {
  stats: InstructorStats;
  studentProgress: StudentProgress[];
  totalStudents: number;
  flaggedSessionCount: number;
}
