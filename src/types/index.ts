export type TabType = 
  | 'dashboard' 
  | 'classes' 
  | 'students' 
  | 'attendance'
  | 'gradebook' 
  | 'analytics' 
  | 'lesson-plan' 
  | 'resources' 
  | 'reports' 
  | 'settings';

export type AttendanceStatus = 'present' | 'excused' | 'unexcused' | 'late';

export interface StudentAttendanceItem {
  studentId: string;
  studentCode: string;
  studentName: string;
  status: AttendanceStatus;
  note?: string;
  parentPhone?: string;
}

export interface AttendanceSession {
  id: string;
  date: string; // YYYY-MM-DD
  classCode: string;
  period: string; // "Tiết 1", "Tiết 2", etc.
  subject: string;
  topic?: string;
  totalStudents: number;
  presentCount: number;
  excusedCount: number;
  unexcusedCount: number;
  lateCount: number;
  records: StudentAttendanceItem[];
  generalNotes?: string;
  createdAt?: string;
}

export type AcademicSemester = 'HKI' | 'HKII';

export type PerformanceTier = 'Giỏi' | 'Khá' | 'Trung bình' | 'Yếu';

export interface ClassInfo {
  id: string;
  code: string; // e.g. "10A1"
  name: string; // e.g. "Lớp 10A1"
  grade: number; // 10, 11, 12
  academicYear: string; // "2024-2025"
  teacher: string; // "Hoàng Việt Dũng"
  subject: string; // "Hóa học"
  room: string;
  studentCount: number;
  note?: string;
  isSample?: boolean;
}

export interface Student {
  id: string;
  code: string; // "HS001"
  name: string;
  dob: string;
  gender: 'Nam' | 'Nữ';
  classId: string;
  className: string;
  phone?: string;
  parentPhone?: string;
  notes?: string;
  isSample?: boolean;
}

export interface GradeItem {
  id: string;
  name: string; // "TX1", "TX2", "GK", "CK"
  type: 'TX' | 'GK' | 'CK';
  weight: number;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  classCode: string;
  subject: string;
  semester: AcademicSemester;
  academicYear: string;
  tx1?: number | null;
  tx2?: number | null;
  tx3?: number | null;
  tx4?: number | null;
  gk?: number | null;
  ck?: number | null;
  avg?: number | null;
  tier?: PerformanceTier | null;
  note?: string;
  updatedAt?: string;
}

export interface GradeConfig {
  txWeight: number; // 1
  gkWeight: number; // 2
  ckWeight: number; // 3
  txCount: number;  // 3 or 4
  roundDecimals: number; // 1
  minScoresToCalculate: number; // min required
  goodThreshold: number; // 8.0
  fairThreshold: number; // 6.5
  avgThreshold: number;  // 5.0
}

export interface ScheduleItem {
  id: string;
  dayOfWeek: 'T2' | 'T3' | 'T4' | 'T5' | 'T6' | 'T7' | 'CN';
  dayDate: string; // e.g. "28/4"
  period: string; // "Tiết 1", "Tiết 2", etc.
  classCode: string;
  subject: string;
  topic: string;
  room?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  type: 'exam' | 'resource' | 'deadline' | 'school';
  timeAgo: string;
  date: string;
  read: boolean;
  content?: string;
}

export interface LessonPlan {
  id: string;
  title: string; // "Bài 32: Luyện tập Oxi - Lưu huỳnh"
  subject: string;
  classCode: string;
  grade: number;
  chapter: string;
  periodNumber: number; // Tiết PPCT
  scheduledDate: string;
  objectives: string;
  mainContent: string;
  status: 'Chưa thực hiện' | 'Đang thực hiện' | 'Đã hoàn thành';
  resourceLinks: string[];
  notes?: string;
}

export interface LearningResource {
  id: string;
  title: string;
  type: 'Giáo án' | 'Bài trình chiếu' | 'PDF' | 'Tài liệu Word' | 'Video bài giảng' | 'Đề kiểm tra' | 'Trò chơi học tập' | 'Liên kết trực tuyến';
  subject: string;
  grade: number;
  chapter: string;
  description: string;
  fileSize?: string;
  downloadUrl?: string;
  onlineUrl?: string;
  tags: string[];
  uploadDate: string;
  author: string;
}

export interface TeacherProfile {
  name: string;
  school: string;
  schoolBadgeSubtitle: string;
  defaultSubject: string;
  slogan: string;
  academicYear: string;
  semester: AcademicSemester;
  email: string;
  phone: string;
  notificationCount: number;
}
