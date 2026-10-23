import { 
  ClassInfo, 
  Student, 
  GradeRecord, 
  GradeConfig, 
  ScheduleItem, 
  NotificationItem, 
  LessonPlan, 
  LearningResource, 
  TeacherProfile,
  AttendanceSession
} from '../types';

export const initialTeacherProfile: TeacherProfile = {
  name: 'Hoàng Việt Dũng',
  school: 'TRƯỜNG THPT TRÀNG ĐỊNH',
  schoolBadgeSubtitle: 'Tri thức - Nhân văn - Phát triển',
  defaultSubject: 'Hóa học',
  slogan: 'Tri thức – Nhân văn – Phát triển',
  academicYear: '2024-2025',
  semester: 'HKI',
  email: 'hoangvietdungls@gmail.com',
  phone: '0983.123.456',
  notificationCount: 3,
};

export const initialGradeConfig: GradeConfig = {
  txWeight: 1,
  gkWeight: 2,
  ckWeight: 3,
  txCount: 4,
  roundDecimals: 1,
  minScoresToCalculate: 3,
  goodThreshold: 8.0,
  fairThreshold: 6.5,
  avgThreshold: 5.0,
};

export const initialClasses: ClassInfo[] = [
  {
    id: 'cls-10a1',
    code: '10A1',
    name: 'Lớp 10A1',
    grade: 10,
    academicYear: '2024-2025',
    teacher: 'Hoàng Việt Dũng',
    subject: 'Hóa học',
    room: 'Phòng 201 - Dãy nhà A',
    studentCount: 35,
    note: 'Lớp chuyên ban Tự nhiên, học sinh chăm chỉ, tiếp thu nhanh.',
    isSample: true,
  },
  {
    id: 'cls-10a2',
    code: '10A2',
    name: 'Lớp 10A2',
    grade: 10,
    academicYear: '2024-2025',
    teacher: 'Hoàng Việt Dũng',
    subject: 'Hóa học',
    room: 'Phòng 202 - Dãy nhà A',
    studentCount: 30,
    note: 'Lớp cơ bản, tinh thần học tập sôi nổi, thích thực hành hóa học.',
    isSample: true,
  },
  {
    id: 'cls-10a3',
    code: '10A3',
    name: 'Lớp 10A3',
    grade: 10,
    academicYear: '2024-2025',
    teacher: 'Hoàng Việt Dũng',
    subject: 'Hóa học',
    room: 'Phòng 203 - Dãy nhà A',
    studentCount: 25,
    note: 'Cần củng cố thêm kỹ năng cân bằng phản ứng oxi hóa - khử.',
    isSample: true,
  },
  {
    id: 'cls-11a1',
    code: '11A1',
    name: 'Lớp 11A1',
    grade: 11,
    academicYear: '2024-2025',
    teacher: 'Hoàng Việt Dũng',
    subject: 'Hóa học',
    room: 'Phòng 301 - Dãy nhà B',
    studentCount: 15,
    note: 'Đội tuyển HSG Hóa học trường, năng lực phân tích tốt.',
    isSample: true,
  },
  {
    id: 'cls-11a2',
    code: '11A2',
    name: 'Lớp 11A2',
    grade: 11,
    academicYear: '2024-2025',
    teacher: 'Hoàng Việt Dũng',
    subject: 'Hóa học',
    room: 'Phòng 302 - Dãy nhà B',
    studentCount: 15,
    note: 'Đang học chương Cân bằng Hóa học và Dung dịch.',
    isSample: true,
  },
];

// Helper to calculate tier
export function calculateTier(avg: number | null | undefined, config: GradeConfig): 'Giỏi' | 'Khá' | 'Trung bình' | 'Yếu' | null {
  if (avg === null || avg === undefined || isNaN(avg)) return null;
  if (avg >= config.goodThreshold) return 'Giỏi';
  if (avg >= config.fairThreshold) return 'Khá';
  if (avg >= config.avgThreshold) return 'Trung bình';
  return 'Yếu';
}

// Helper to calculate average
export function calculateStudentAverage(record: Partial<GradeRecord>, config: GradeConfig = initialGradeConfig): number | null {
  const txScores = [record.tx1, record.tx2, record.tx3, record.tx4].filter((s): s is number => s !== undefined && s !== null && !isNaN(s));
  const hasGk = record.gk !== undefined && record.gk !== null && !isNaN(record.gk);
  const hasCk = record.ck !== undefined && record.ck !== null && !isNaN(record.ck);

  // Require minimum scores
  if (txScores.length === 0 && !hasGk && !hasCk) return null;

  let totalPoints = 0;
  let totalWeights = 0;

  txScores.forEach(score => {
    totalPoints += score * config.txWeight;
    totalWeights += config.txWeight;
  });

  if (hasGk) {
    totalPoints += record.gk! * config.gkWeight;
    totalWeights += config.gkWeight;
  }

  if (hasCk) {
    totalPoints += record.ck! * config.ckWeight;
    totalWeights += config.ckWeight;
  }

  if (totalWeights === 0) return null;
  const rawAvg = totalPoints / totalWeights;
  const factor = Math.pow(10, config.roundDecimals);
  return Math.round(rawAvg * factor) / factor;
}

// 120 Students with 10A1 starting with exact 8 from screenshot
export const initialStudents: Student[] = [
  // Lớp 10A1 (35 học sinh)
  { id: 'std-1', code: 'HS001', name: 'Nguyễn Văn An', dob: '2009-03-15', gender: 'Nam', classId: 'cls-10a1', className: '10A1', phone: '0981110001', parentPhone: '0912110001', notes: 'Học sinh giỏi toàn diện, lớp trưởng' },
  { id: 'std-2', code: 'HS002', name: 'Trần Thị Bình', dob: '2009-07-22', gender: 'Nữ', classId: 'cls-10a1', className: '10A1', phone: '0981110002', parentPhone: '0912110002', notes: 'Chăm chỉ, làm bài cẩn thận' },
  { id: 'std-3', code: 'HS003', name: 'Lê Minh Cường', dob: '2009-11-05', gender: 'Nam', classId: 'cls-10a1', className: '10A1', phone: '0981110003', parentPhone: '0912110003', notes: 'Tư duy logic tốt' },
  { id: 'std-4', code: 'HS004', name: 'Phạm Thị Dung', dob: '2009-02-18', gender: 'Nữ', classId: 'cls-10a1', className: '10A1', phone: '0981110004', parentPhone: '0912110004', notes: 'Cần chú ý ôn lại lý thuyết liên kết hóa học' },
  { id: 'std-5', code: 'HS005', name: 'Hoàng Văn Em', dob: '2009-09-30', gender: 'Nam', classId: 'cls-10a1', className: '10A1', phone: '0981110005', parentPhone: '0912110005', notes: 'Năng nổ phát biểu bài' },
  { id: 'std-6', code: 'HS006', name: 'Vũ Thị Hằng', dob: '2009-05-14', gender: 'Nữ', classId: 'cls-10a1', className: '10A1', phone: '0981110006', parentPhone: '0912110006', notes: 'Làm bài tập đầy đủ' },
  { id: 'std-7', code: 'HS007', name: 'Đặng Văn Hải', dob: '2009-08-25', gender: 'Nam', classId: 'cls-10a1', className: '10A1', phone: '0981110007', parentPhone: '0912110007', notes: 'Cần kèm cặp thêm dạng bài tính nồng độ mol' },
  { id: 'std-8', code: 'HS008', name: 'Bùi Thị Hoa', dob: '2009-12-10', gender: 'Nữ', classId: 'cls-10a1', className: '10A1', phone: '0981110008', parentPhone: '0912110008', notes: 'Điểm các bài kiểm tra đều xuất sắc' },
  { id: 'std-9', code: 'HS009', name: 'Nông Văn Kiên', dob: '2009-04-12', gender: 'Nam', classId: 'cls-10a1', className: '10A1', phone: '0981110009', parentPhone: '0912110009', notes: 'Học sinh huyện Tràng Định năng nổ' },
  { id: 'std-10', code: 'HS010', name: 'Hoàng Thị Lan', dob: '2009-06-20', gender: 'Nữ', classId: 'cls-10a1', className: '10A1', phone: '0981110010', parentPhone: '0912110010', notes: 'Yêu thích thí nghiệm thực hành' },
  { id: 'std-11', code: 'HS011', name: 'Lương Đình Long', dob: '2009-01-08', gender: 'Nam', classId: 'cls-10a1', className: '10A1', phone: '0981110011', parentPhone: '0912110011', notes: 'Làm bài kiểm tra tiến bộ rõ rệt' },
  { id: 'std-12', code: 'HS012', name: 'Triệu Thu Mai', dob: '2009-10-15', gender: 'Nữ', classId: 'cls-10a1', className: '10A1', phone: '0981110012', parentPhone: '0912110012', notes: 'Thường xuyên giúp đỡ bạn học nhóm' },
  { id: 'std-13', code: 'HS013', name: 'Chu Văn Nam', dob: '2009-03-27', gender: 'Nam', classId: 'cls-10a1', className: '10A1', phone: '0981110013', parentPhone: '0912110013', notes: 'Có tiềm năng thi học sinh giỏi' },
  { id: 'std-14', code: 'HS014', name: 'Lý Thị Oanh', dob: '2009-07-03', gender: 'Nữ', classId: 'cls-10a1', className: '10A1', phone: '0981110014', parentPhone: '0912110014', notes: 'Chăm chỉ, ghi chép cẩn thận' },
  { id: 'std-15', code: 'HS015', name: 'Đoàn Hải Phúc', dob: '2009-09-19', gender: 'Nam', classId: 'cls-10a1', className: '10A1', phone: '0981110015', parentPhone: '0912110015', notes: 'Cần lưu ý kiểm tra lại đơn vị bài toán' },
  { id: 'std-16', code: 'HS016', name: 'Dương Thị Quỳnh', dob: '2009-11-28', gender: 'Nữ', classId: 'cls-10a1', className: '10A1', phone: '0981110016', parentPhone: '0912110016', notes: 'Vở sạch chữ đẹp, trình bày khoa học' },
  { id: 'std-17', code: 'HS017', name: 'Phùng Văn Sơn', dob: '2009-02-04', gender: 'Nam', classId: 'cls-10a1', className: '10A1', phone: '0981110017', parentPhone: '0912110017', notes: 'Tích cực tham gia câu lạc bộ STEM Hóa học' },
  { id: 'std-18', code: 'HS018', name: 'Lê Thị Tâm', dob: '2009-08-11', gender: 'Nữ', classId: 'cls-10a1', className: '10A1', phone: '0981110018', parentPhone: '0912110018', notes: 'Nắm vững lý thuyết bảng tuần hoàn' },
  { id: 'std-19', code: 'HS019', name: 'Nguyễn Tiến Tuấn', dob: '2009-05-23', gender: 'Nam', classId: 'cls-10a1', className: '10A1', phone: '0981110019', parentPhone: '0912110019', notes: 'Cần bổ sung bài tập về phản ứng oxi hóa khử' },
  { id: 'std-20', code: 'HS020', name: 'Vũ Ngọc Uyên', dob: '2009-12-01', gender: 'Nữ', classId: 'cls-10a1', className: '10A1', phone: '0981110020', parentPhone: '0912110020', notes: 'Khả năng tự học cao' },
  { id: 'std-21', code: 'HS021', name: 'Lâm Văn Vinh', dob: '2009-04-17', gender: 'Nam', classId: 'cls-10a1', className: '10A1', phone: '0981110021', parentPhone: '0912110021', notes: 'Cần rèn luyện tính kiên nhẫn khi giải toán' },
  { id: 'std-22', code: 'HS022', name: 'Trần Thảo Vy', dob: '2009-06-09', gender: 'Nữ', classId: 'cls-10a1', className: '10A1', phone: '0981110022', parentPhone: '0912110022', notes: 'Học sinh tích cực' },
  { id: 'std-23', code: 'HS023', name: 'Hoàng Quốc Việt', dob: '2009-10-02', gender: 'Nam', classId: 'cls-10a1', className: '10A1', phone: '0981110023', parentPhone: '0912110023', notes: 'Điểm kiểm tra ổn định ở mức Khá' },
  { id: 'std-24', code: 'HS024', name: 'Đỗ Thị Ánh', dob: '2009-03-31', gender: 'Nữ', classId: 'cls-10a1', className: '10A1', phone: '0981110024', parentPhone: '0912110024', notes: 'Hiểu bài nhanh' },
  { id: 'std-25', code: 'HS025', name: 'Mã Văn Bắc', dob: '2009-07-16', gender: 'Nam', classId: 'cls-10a1', className: '10A1', phone: '0981110025', parentPhone: '0912110025', notes: 'Cần chú ý nghe giảng hơn' },
  { id: 'std-26', code: 'HS026', name: 'Đặng Kim Chi', dob: '2009-09-05', gender: 'Nữ', classId: 'cls-10a1', className: '10A1', phone: '0981110026', parentPhone: '0912110026', notes: 'Chăm học, điểm số tăng đều' },
  { id: 'std-27', code: 'HS027', name: 'Lương Văn Đạt', dob: '2009-12-24', gender: 'Nam', classId: 'cls-10a1', className: '10A1', phone: '0981110027', parentPhone: '0912110027', notes: 'Kỹ năng giải bài tập trắc nghiệm tốt' },
  { id: 'std-28', code: 'HS028', name: 'Hà Thị Giang', dob: '2009-01-29', gender: 'Nữ', classId: 'cls-10a1', className: '10A1', phone: '0981110028', parentPhone: '0912110028', notes: 'Giao tiếp tốt, tích cực trao đổi với giáo viên' },
  { id: 'std-29', code: 'HS029', name: 'Nông Hải Hưng', dob: '2009-08-08', gender: 'Nam', classId: 'cls-10a1', className: '10A1', phone: '0981110029', parentPhone: '0912110029', notes: 'Cần làm thêm bài tập về cấu tạo nguyên tử' },
  { id: 'std-30', code: 'HS030', name: 'Bế Thị Loan', dob: '2009-11-14', gender: 'Nữ', classId: 'cls-10a1', className: '10A1', phone: '0981110030', parentPhone: '0912110030', notes: 'Có tiến bộ trong đợt kiểm tra giữa kỳ' },
  { id: 'std-31', code: 'HS031', name: 'Lý Quốc Minh', dob: '2009-02-22', gender: 'Nam', classId: 'cls-10a1', className: '10A1', phone: '0981110031', parentPhone: '0912110031', notes: 'Khá, có tinh thần tương trợ bạn' },
  { id: 'std-32', code: 'HS032', name: 'Phan Thị Nga', dob: '2009-05-18', gender: 'Nữ', classId: 'cls-10a1', className: '10A1', phone: '0981110032', parentPhone: '0912110032', notes: 'Ngoan ngoãn, hoàn thành bài tập đúng hạn' },
  { id: 'std-33', code: 'HS033', name: 'Hứa Văn Phong', dob: '2009-09-09', gender: 'Nam', classId: 'cls-10a1', className: '10A1', phone: '0981110033', parentPhone: '0912110033', notes: 'Cần chú ý dạng bài xác định nguyên tố' },
  { id: 'std-34', code: 'HS034', name: 'Triệu Thúy Quỳnh', dob: '2009-10-27', gender: 'Nữ', classId: 'cls-10a1', className: '10A1', phone: '0981110034', parentPhone: '0912110034', notes: 'Chăm chỉ, điểm giữa kỳ tốt' },
  { id: 'std-35', code: 'HS035', name: 'Võ Minh Vũ', dob: '2009-12-30', gender: 'Nam', classId: 'cls-10a1', className: '10A1', phone: '0981110035', parentPhone: '0912110035', notes: 'Tự tin, sáng tạo trong giờ thực hành' },

  // Lớp 10A2 (30 học sinh)
  ...Array.from({ length: 30 }, (_, i) => {
    const num = i + 36;
    const code = `HS${String(num).padStart(3, '0')}`;
    const names = ['Nguyễn Thị Mai', 'Trần Văn Hùng', 'Lê Thị Thu', 'Phạm Quốc Bảo', 'Hoàng Minh Tuấn', 'Vũ Thị Ngọc', 'Đinh Văn Nam', 'Đỗ Thúy Hằng', 'Bùi Văn Dũng', 'Dương Thị Phương', 'Ngô Quang Huy', 'Mai Thu Trang'];
    const name = `${names[i % names.length]} (${code})`;
    return {
      id: `std-${num}`,
      code,
      name,
      dob: '2009-06-15',
      gender: (i % 2 === 0 ? 'Nữ' : 'Nam') as 'Nam' | 'Nữ',
      classId: 'cls-10a2',
      className: '10A2',
      phone: `098222${String(num).padStart(4, '0')}`,
      parentPhone: `091333${String(num).padStart(4, '0')}`,
      notes: 'Học sinh lớp 10A2',
    };
  }),

  // Lớp 10A3 (25 học sinh)
  ...Array.from({ length: 25 }, (_, i) => {
    const num = i + 66;
    const code = `HS${String(num).padStart(3, '0')}`;
    const names = ['Lý Văn Quân', 'Chu Thị Huệ', 'Hà Quang Sáng', 'Nông Thị Diệp', 'Phùng Văn Thái', 'Đào Thu Thảo'];
    const name = `${names[i % names.length]} (${code})`;
    return {
      id: `std-${num}`,
      code,
      name,
      dob: '2009-04-10',
      gender: (i % 2 === 0 ? 'Nam' : 'Nữ') as 'Nam' | 'Nữ',
      classId: 'cls-10a3',
      className: '10A3',
      phone: `098333${String(num).padStart(4, '0')}`,
      parentPhone: `091444${String(num).padStart(4, '0')}`,
      notes: 'Học sinh lớp 10A3',
    };
  }),

  // Lớp 11A1 (15 học sinh)
  ...Array.from({ length: 15 }, (_, i) => {
    const num = i + 91;
    const code = `HS${String(num).padStart(3, '0')}`;
    const names = ['Hoàng Nhật Quang', 'Đỗ Minh Trí', 'Vũ Khánh Linh', 'Lê Quỳnh Nga', 'Nguyễn Đức Anh'];
    const name = `${names[i % names.length]} (${code})`;
    return {
      id: `std-${num}`,
      code,
      name,
      dob: '2008-08-20',
      gender: (i % 2 === 0 ? 'Nam' : 'Nữ') as 'Nam' | 'Nữ',
      classId: 'cls-11a1',
      className: '11A1',
      phone: `098444${String(num).padStart(4, '0')}`,
      parentPhone: `091555${String(num).padStart(4, '0')}`,
      notes: 'Học sinh lớp 11A1 đội tuyển HSG Hóa',
    };
  }),

  // Lớp 11A2 (15 học sinh) -> Tổng cộng 35 + 30 + 25 + 15 + 15 = 120 học sinh!
  ...Array.from({ length: 15 }, (_, i) => {
    const num = i + 106;
    const code = `HS${String(num).padStart(3, '0')}`;
    const names = ['Trịnh Hải Đăng', 'Bùi Yến Nhi', 'Vương Đình Trọng', 'Tô Thúy Hiền', 'Đặng Thành Long'];
    const name = `${names[i % names.length]} (${code})`;
    return {
      id: `std-${num}`,
      code,
      name,
      dob: '2008-11-12',
      gender: (i % 2 === 0 ? 'Nam' : 'Nữ') as 'Nam' | 'Nữ',
      classId: 'cls-11a2',
      className: '11A2',
      phone: `098555${String(num).padStart(4, '0')}`,
      parentPhone: `091666${String(num).padStart(4, '0')}`,
      notes: 'Học sinh lớp 11A2',
    };
  }),
];

// Grade records calibrated so that:
// 10A1: avg 7.1, 10A2: avg 7.5, 10A3: avg 6.8, 11A1: avg 7.3, 11A2: avg 7.0
// Total average = 7.2
// Exact 8 initial students match screenshot:
// HS001 -> 8.5 (Giỏi)
// HS002 -> 7.8 (Khá)
// HS003 -> 6.9 (Khá)
// HS004 -> 5.6 (Trung bình)
// HS005 -> 8.2 (Giỏi)
// HS006 -> 7.1 (Khá)
// HS007 -> 4.8 (Yếu)
// HS008 -> 8.9 (Giỏi)
export const initialGradeRecords: GradeRecord[] = [
  // 10A1 First 8 students (exact match to screenshot)
  { id: 'grd-1', studentId: 'std-1', studentCode: 'HS001', studentName: 'Nguyễn Văn An', classCode: '10A1', subject: 'Hóa học', semester: 'HKI', academicYear: '2024-2025', tx1: 8.5, tx2: 8.0, tx3: 9.0, tx4: 8.5, gk: 8.5, ck: 8.5, avg: 8.5, tier: 'Giỏi', note: 'Xuất sắc' },
  { id: 'grd-2', studentId: 'std-2', studentCode: 'HS002', studentName: 'Trần Thị Bình', classCode: '10A1', subject: 'Hóa học', semester: 'HKI', academicYear: '2024-2025', tx1: 7.5, tx2: 8.0, tx3: 7.5, tx4: 8.0, gk: 7.8, ck: 7.8, avg: 7.8, tier: 'Khá', note: 'Chăm chỉ' },
  { id: 'grd-3', studentId: 'std-3', studentCode: 'HS003', studentName: 'Lê Minh Cường', classCode: '10A1', subject: 'Hóa học', semester: 'HKI', academicYear: '2024-2025', tx1: 7.0, tx2: 6.5, tx3: 7.0, tx4: 7.0, gk: 6.8, ck: 7.0, avg: 6.9, tier: 'Khá', note: 'Khá' },
  { id: 'grd-4', studentId: 'std-4', studentCode: 'HS004', studentName: 'Phạm Thị Dung', classCode: '10A1', subject: 'Hóa học', semester: 'HKI', academicYear: '2024-2025', tx1: 5.5, tx2: 5.5, tx3: 6.0, tx4: 5.0, gk: 5.8, ck: 5.6, avg: 5.6, tier: 'Trung bình', note: 'Cần cố gắng' },
  { id: 'grd-5', studentId: 'std-5', studentCode: 'HS005', studentName: 'Hoàng Văn Em', classCode: '10A1', subject: 'Hóa học', semester: 'HKI', academicYear: '2024-2025', tx1: 8.0, tx2: 8.5, tx3: 8.0, tx4: 8.5, gk: 8.0, ck: 8.3, avg: 8.2, tier: 'Giỏi', note: 'Học tốt' },
  { id: 'grd-6', studentId: 'std-6', studentCode: 'HS006', studentName: 'Vũ Thị Hằng', classCode: '10A1', subject: 'Hóa học', semester: 'HKI', academicYear: '2024-2025', tx1: 7.0, tx2: 7.5, tx3: 7.0, tx4: 7.0, gk: 7.0, ck: 7.2, avg: 7.1, tier: 'Khá', note: 'Tốt' },
  { id: 'grd-7', studentId: 'std-7', studentCode: 'HS007', studentName: 'Đặng Văn Hải', classCode: '10A1', subject: 'Hóa học', semester: 'HKI', academicYear: '2024-2025', tx1: 4.5, tx2: 5.0, tx3: 4.5, tx4: 5.0, gk: 4.8, ck: 4.8, avg: 4.8, tier: 'Yếu', note: 'Cần phụ đạo thêm' },
  { id: 'grd-8', studentId: 'std-8', studentCode: 'HS008', studentName: 'Bùi Thị Hoa', classCode: '10A1', subject: 'Hóa học', semester: 'HKI', academicYear: '2024-2025', tx1: 9.0, tx2: 9.0, tx3: 8.5, tx4: 9.0, gk: 8.8, ck: 9.0, avg: 8.9, tier: 'Giỏi', note: 'Rất xuất sắc' },

  // Remaining 27 students in 10A1 (bringing 10A1 average to 7.1)
  ...initialStudents.slice(8, 35).map((std, i) => {
    const scores = [
      [8.0, 8.5, 7.5, 8.0, 8.0, 8.0], // 8.0 Giỏi
      [7.0, 7.0, 7.5, 7.0, 7.2, 7.5], // 7.2 Khá
      [6.5, 7.0, 6.0, 6.5, 6.8, 7.0], // 6.7 Khá
      [5.5, 6.0, 5.0, 5.5, 5.8, 6.0], // 5.7 TB
      [8.5, 9.0, 8.0, 8.5, 8.8, 8.5], // 8.6 Giỏi
      [7.5, 7.0, 7.0, 7.5, 7.2, 7.5], // 7.3 Khá
      [4.0, 4.5, 5.0, 4.5, 4.2, 4.5], // 4.4 Yếu
      [9.0, 9.5, 8.5, 9.0, 9.0, 9.2], // 9.1 Giỏi
      [6.0, 6.5, 6.0, 6.0, 6.2, 6.5], // 6.2 TB
    ];
    const s = scores[i % scores.length];
    const avg = calculateStudentAverage({ tx1: s[0], tx2: s[1], tx3: s[2], tx4: s[3], gk: s[4], ck: s[5] });
    return {
      id: `grd-${std.id}`,
      studentId: std.id,
      studentCode: std.code,
      studentName: std.name,
      classCode: '10A1',
      subject: 'Hóa học',
      semester: 'HKI' as const,
      academicYear: '2024-2025',
      tx1: s[0],
      tx2: s[1],
      tx3: s[2],
      tx4: s[3],
      gk: s[4],
      ck: s[5],
      avg: avg,
      tier: calculateTier(avg, initialGradeConfig),
      note: 'Dữ liệu HKI',
    };
  }),

  // 10A2 students (targeted avg ~7.5)
  ...initialStudents.filter(s => s.classId === 'cls-10a2').map((std, i) => {
    const base = [7.5, 8.0, 7.5, 7.5, 7.8, 7.5];
    if (i % 3 === 0) base[0] = 8.5;
    const avg = calculateStudentAverage({ tx1: base[0], tx2: base[1], tx3: base[2], tx4: base[3], gk: base[4], ck: base[5] });
    return {
      id: `grd-${std.id}`,
      studentId: std.id,
      studentCode: std.code,
      studentName: std.name,
      classCode: '10A2',
      subject: 'Hóa học',
      semester: 'HKI' as const,
      academicYear: '2024-2025',
      tx1: base[0],
      tx2: base[1],
      tx3: base[2],
      tx4: base[3],
      gk: base[4],
      ck: base[5],
      avg: avg,
      tier: calculateTier(avg, initialGradeConfig),
      note: 'Dữ liệu HKI',
    };
  }),

  // 10A3 students (targeted avg ~6.8)
  ...initialStudents.filter(s => s.classId === 'cls-10a3').map((std, i) => {
    const base = [6.5, 7.0, 6.5, 6.5, 7.0, 6.8];
    if (i % 4 === 0) base[0] = 5.5;
    const avg = calculateStudentAverage({ tx1: base[0], tx2: base[1], tx3: base[2], tx4: base[3], gk: base[4], ck: base[5] });
    return {
      id: `grd-${std.id}`,
      studentId: std.id,
      studentCode: std.code,
      studentName: std.name,
      classCode: '10A3',
      subject: 'Hóa học',
      semester: 'HKI' as const,
      academicYear: '2024-2025',
      tx1: base[0],
      tx2: base[1],
      tx3: base[2],
      tx4: base[3],
      gk: base[4],
      ck: base[5],
      avg: avg,
      tier: calculateTier(avg, initialGradeConfig),
      note: 'Dữ liệu HKI',
    };
  }),

  // 11A1 students (targeted avg ~7.3)
  ...initialStudents.filter(s => s.classId === 'cls-11a1').map((std) => {
    const base = [7.5, 7.0, 7.5, 7.0, 7.5, 7.3];
    const avg = calculateStudentAverage({ tx1: base[0], tx2: base[1], tx3: base[2], tx4: base[3], gk: base[4], ck: base[5] });
    return {
      id: `grd-${std.id}`,
      studentId: std.id,
      studentCode: std.code,
      studentName: std.name,
      classCode: '11A1',
      subject: 'Hóa học',
      semester: 'HKI' as const,
      academicYear: '2024-2025',
      tx1: base[0],
      tx2: base[1],
      tx3: base[2],
      tx4: base[3],
      gk: base[4],
      ck: base[5],
      avg: avg,
      tier: calculateTier(avg, initialGradeConfig),
      note: 'Dữ liệu HKI',
    };
  }),

  // 11A2 students (targeted avg ~7.0)
  ...initialStudents.filter(s => s.classId === 'cls-11a2').map((std) => {
    const base = [7.0, 7.0, 7.0, 7.0, 7.0, 7.0];
    const avg = calculateStudentAverage({ tx1: base[0], tx2: base[1], tx3: base[2], tx4: base[3], gk: base[4], ck: base[5] });
    return {
      id: `grd-${std.id}`,
      studentId: std.id,
      studentCode: std.code,
      studentName: std.name,
      classCode: '11A2',
      subject: 'Hóa học',
      semester: 'HKI' as const,
      academicYear: '2024-2025',
      tx1: base[0],
      tx2: base[1],
      tx3: base[2],
      tx4: base[3],
      gk: base[4],
      ck: base[5],
      avg: avg,
      tier: calculateTier(avg, initialGradeConfig),
      note: 'Dữ liệu HKI',
    };
  }),
];

// Schedule items for week (matching the screenshot)
export const initialSchedule: ScheduleItem[] = [
  // Thứ 2 (28/4)
  { id: 'sch-1', dayOfWeek: 'T2', dayDate: '28/4', period: 'Tiết 1', classCode: '10A1', subject: 'Hóa học', topic: 'Bài 32: Luyện tập Oxi - Lưu huỳnh', room: 'P.201' },
  { id: 'sch-2', dayOfWeek: 'T2', dayDate: '28/4', period: 'Tiết 2', classCode: '10A2', subject: 'Hóa học', topic: 'Bài 33: Axit sunfuric và muối sunfat', room: 'P.202' },
  { id: 'sch-3', dayOfWeek: 'T2', dayDate: '28/4', period: 'Tiết 3', classCode: '11A1', subject: 'Hóa học', topic: 'Ôn tập chương Halogen nâng cao', room: 'P.301' },
  { id: 'sch-4', dayOfWeek: 'T2', dayDate: '28/4', period: 'Tiết 4', classCode: '11A2', subject: 'Hóa học', topic: 'Kiểm tra 15 phút chương Halogen', room: 'P.302' },

  // Thứ 3 (29/4)
  { id: 'sch-5', dayOfWeek: 'T3', dayDate: '29/4', period: 'Tiết 1', classCode: '10A3', subject: 'Hóa học', topic: 'Bài 30: Lưu huỳnh và hợp chất', room: 'P.203' },
  { id: 'sch-6', dayOfWeek: 'T3', dayDate: '29/4', period: 'Tiết 2', classCode: '10A1', subject: 'Hóa học', topic: 'Thực hành tính chất của Oxi, Lưu huỳnh', room: 'Phòng TN Hóa' },
  { id: 'sch-7', dayOfWeek: 'T3', dayDate: '29/4', period: 'Tiết 4', classCode: '11A1', subject: 'Hóa học', topic: 'Chuyên đề Cân bằng Ion trong dung dịch', room: 'P.301' },

  // Thứ 4 (30/4)
  { id: 'sch-8', dayOfWeek: 'T4', dayDate: '30/4', period: 'Tiết 1', classCode: '10A2', subject: 'Hóa học', topic: 'Thực hành: Nhận biết gốc Sunfat', room: 'Phòng TN Hóa' },
  { id: 'sch-9', dayOfWeek: 'T4', dayDate: '30/4', period: 'Tiết 3', classCode: '11A2', subject: 'Hóa học', topic: 'Bài tập pH và độ điện ly', room: 'P.302' },

  // Thứ 5 (1/5)
  { id: 'sch-10', dayOfWeek: 'T5', dayDate: '1/5', period: 'Tiết 2', classCode: '10A1', subject: 'Hóa học', topic: 'Kiểm tra định kỳ 1 tiết', room: 'P.201' },
  { id: 'sch-11', dayOfWeek: 'T5', dayDate: '1/5', period: 'Tiết 3', classCode: '10A3', subject: 'Hóa học', topic: 'Bài 31: Hiđro sunfua - Lưu huỳnh đioxit', room: 'P.203' },

  // Thứ 6 (2/5)
  { id: 'sch-12', dayOfWeek: 'T6', dayDate: '2/5', period: 'Tiết 1', classCode: '11A1', subject: 'Hóa học', topic: 'Bồi dưỡng học sinh giỏi hóa học', room: 'P.301' },
  { id: 'sch-13', dayOfWeek: 'T6', dayDate: '2/5', period: 'Tiết 2', classCode: '11A2', subject: 'Hóa học', topic: 'Chữa bài kiểm tra 15 phút', room: 'P.302' },
  { id: 'sch-14', dayOfWeek: 'T6', dayDate: '2/5', period: 'Tiết 4', classCode: '10A2', subject: 'Hóa học', topic: 'Sinh hoạt tổ chuyên môn Tự nhiên', room: 'Văn phòng tổ' },

  // Thứ 7 (3/5)
  { id: 'sch-15', dayOfWeek: 'T7', dayDate: '3/5', period: 'Tiết 2', classCode: '10A1', subject: 'Hóa học', topic: 'Hoạt động trải nghiệm: Hóa học và Đời sống', room: 'Hội trường' },

  // Chủ Nhật (4/5)
  { id: 'sch-16', dayOfWeek: 'CN', dayDate: '4/5', period: 'Tiết 1', classCode: '11A1', subject: 'Hóa học', topic: 'Tập huấn giáo viên trực tuyến (Sở GD&ĐT Lạng Sơn)', room: 'Trực tuyến' },
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Đã có điểm kiểm tra 15 phút lớp 10A1',
    type: 'exam',
    timeAgo: '2 giờ trước',
    date: '2025-04-28 07:45',
    read: false,
    content: 'Đã hoàn tất chấm và nhập điểm bài kiểm tra 15 phút chuyên đề Oxi - Lưu huỳnh lớp 10A1. Điểm trung bình đạt 8.1.',
  },
  {
    id: 'notif-2',
    title: 'Cập nhật tài liệu: Bài tập Hóa học 10',
    type: 'resource',
    timeAgo: '5 giờ trước',
    date: '2025-04-28 04:30',
    read: false,
    content: 'Tổ bộ môn Hóa học THPT Tràng Định vừa bổ sung ngân hàng 100 câu hỏi trắc nghiệm chương Nhóm Halogen và Oxi - Lưu huỳnh.',
  },
  {
    id: 'notif-3',
    title: 'Hạn nộp kế hoạch dạy học tuần',
    type: 'deadline',
    timeAgo: '1 ngày trước',
    date: '2025-04-27 16:00',
    read: false,
    content: 'Nhắc nhở nộp giáo án điện tử và kế hoạch dạy học tuần 33 trước 17h00 thứ Sáu cho Tổ trưởng chuyên môn phê duyệt.',
  },
  {
    id: 'notif-4',
    title: 'Thông báo từ Ban giám hiệu',
    type: 'school',
    timeAgo: '2 ngày trước',
    date: '2025-04-26 09:15',
    read: true,
    content: 'Kế hoạch tổ chức Hội thi Giáo viên dạy giỏi cấp trường năm học 2024-2025. Các thầy cô nộp hồ sơ đăng ký tiết dạy thao giảng.',
  },
];

export const initialLessonPlans: LessonPlan[] = [
  {
    id: 'lp-1',
    title: 'Bài 32: Luyện tập Oxi - Lưu huỳnh',
    subject: 'Hóa học',
    classCode: '10A1',
    grade: 10,
    chapter: 'Chương 6: Oxi - Lưu huỳnh',
    periodNumber: 52,
    scheduledDate: '2025-04-28',
    objectives: 'Củng cố kiến thức về tính chất hóa học của oxi, ozon, lưu huỳnh và các hợp chất sunfua, sunfit, sunfat; rèn kỹ năng viết phương trình phản ứng oxi hóa khử.',
    mainContent: 'Hệ thống hóa lý thuyết bằng sơ đồ tư duy; Giải bài tập nhận biết dung dịch; Bài toán hỗn hợp kim loại tác dụng với H2SO4 đặc nóng.',
    status: 'Đang thực hiện',
    resourceLinks: ['Giáo án điện tử Bài 32', 'Phiếu học tập số 1'],
    notes: 'Chuẩn bị thêm bảng phụ cho học sinh thảo luận nhóm.',
  },
  {
    id: 'lp-2',
    title: 'Bài 33: Axit sunfuric và muối sunfat',
    subject: 'Hóa học',
    classCode: '10A2',
    grade: 10,
    chapter: 'Chương 6: Oxi - Lưu huỳnh',
    periodNumber: 53,
    scheduledDate: '2025-04-28',
    objectives: 'Nắm vững tính chất vật lý, tính axit mạnh và tính oxi hóa đặc biệt của H2SO4 đặc; quy tắc an toàn khi pha loãng axit.',
    mainContent: 'Thí nghiệm chứng minh H2SO4 đặc làm than hóa đường saccarozo; Tác dụng với Cu; Cách nhận biết ion sunfat bằng muối Bari.',
    status: 'Chưa thực hiện',
    resourceLinks: ['Video thí nghiệm H2SO4 đặc than hóa đường', 'Slide trình chiếu Bài 33'],
    notes: 'Phòng thí nghiệm cần chuẩn bị kính bảo hộ và dung dịch NaHCO3 cấp cứu axit.',
  },
  {
    id: 'lp-3',
    title: 'Ôn tập chương Halogen nâng cao',
    subject: 'Hóa học',
    classCode: '11A1',
    grade: 11,
    chapter: 'Chuyên đề bồi dưỡng HSG',
    periodNumber: 48,
    scheduledDate: '2025-04-28',
    objectives: 'Nâng cao kỹ năng cân bằng phản ứng oxi hóa khử phức tạp, bài toán muối halogenua tác dụng với AgNO3.',
    mainContent: 'Phân tích các phản ứng của Flo, Clo, Brom, Iot; So sánh tính oxi hóa và tính khử; Bài tập tự luận chuyên sâu.',
    status: 'Đang thực hiện',
    resourceLinks: ['Tài liệu bồi dưỡng HSG Hóa học 11'],
    notes: 'Lớp học sôi nổi, nhiều học sinh giải tốt cách bảo toàn electron.',
  },
  {
    id: 'lp-4',
    title: 'Kiểm tra 15 phút chương Halogen',
    subject: 'Hóa học',
    classCode: '11A2',
    grade: 11,
    chapter: 'Kiểm tra đánh giá thường xuyên',
    periodNumber: 49,
    scheduledDate: '2025-04-28',
    objectives: 'Đánh giá mức độ nắm bắt kiến thức về Clo và axit clohiđric của học sinh 11A2.',
    mainContent: 'Đề kiểm tra gồm 10 câu trắc nghiệm (5 điểm) và 1 bài tập tự luận tính toán (5 điểm).',
    status: 'Đã hoàn thành',
    resourceLinks: ['Ma trận đề kiểm tra 15 phút', 'Đáp án và thang điểm'],
    notes: 'Đã nhập điểm đầy đủ vào hệ thống.',
  },
  {
    id: 'lp-5',
    title: 'Bài 30: Lưu huỳnh và hợp chất',
    subject: 'Hóa học',
    classCode: '10A3',
    grade: 10,
    chapter: 'Chương 6: Oxi - Lưu huỳnh',
    periodNumber: 50,
    scheduledDate: '2025-04-29',
    objectives: 'Hiểu cấu tạo phân tử, hai dạng thù hình của lưu huỳnh, tính chất hóa học vừa có tính oxi hóa vừa có tính khử.',
    mainContent: 'Tác dụng với kim loại (Fe, Hg), phi kim (O2, F2); Ứng dụng của lưu huỳnh trong sản xuất cao su lưu hóa.',
    status: 'Chưa thực hiện',
    resourceLinks: ['Mẫu lưu huỳnh thật', 'Bài giảng tương tác'],
    notes: 'Lưu ý nhắc nhở học sinh về tính độc hại khi đốt lưu huỳnh trong không khí.',
  },
];

export const initialResources: LearningResource[] = [
  {
    id: 'res-1',
    title: 'Giáo án điện tử Hóa học 10 - Chương Oxi Lưu huỳnh',
    type: 'Giáo án',
    subject: 'Hóa học',
    grade: 10,
    chapter: 'Chương 6: Oxi - Lưu huỳnh',
    description: 'Bộ giáo án chuẩn theo công văn 5512 của Bộ GD&ĐT, đầy đủ hoạt động khởi động, hình thành kiến thức, luyện tập và vận dụng.',
    fileSize: '4.2 MB',
    downloadUrl: '#',
    tags: ['Giáo án 5512', 'Hóa 10', 'Oxi', 'Lưu huỳnh'],
    uploadDate: '2025-04-15',
    author: 'Hoàng Việt Dũng',
  },
  {
    id: 'res-2',
    title: 'Bài giảng trình chiếu PowerPoint Bài 33: Axit Sunfuric',
    type: 'Bài trình chiếu',
    subject: 'Hóa học',
    grade: 10,
    chapter: 'Chương 6: Oxi - Lưu huỳnh',
    description: 'Slide thiết kế trực quan sinh động với hình ảnh thí nghiệm mô phỏng, bảng so sánh và câu hỏi trắc nghiệm tương tác.',
    fileSize: '12.8 MB',
    downloadUrl: '#',
    tags: ['PowerPoint', 'H2SO4', 'Hóa 10'],
    uploadDate: '2025-04-20',
    author: 'Hoàng Việt Dũng',
  },
  {
    id: 'res-3',
    title: 'Ngân hàng 200 câu trắc nghiệm Hóa học 10 có lời giải chi tiết',
    type: 'PDF',
    subject: 'Hóa học',
    grade: 10,
    chapter: 'Tổng hợp HKI và HKII',
    description: 'Tài liệu ôn thi cuối kỳ gồm 4 mức độ nhận biết, thông hiểu, vận dụng và vận dụng cao kèm bảng đáp án chi tiết.',
    fileSize: '3.5 MB',
    downloadUrl: '#',
    tags: ['Trắc nghiệm', 'Đề cương', 'PDF'],
    uploadDate: '2025-04-22',
    author: 'Tổ Hóa - THPT Tràng Định',
  },
  {
    id: 'res-4',
    title: 'Video thí nghiệm: Phản ứng than hóa của Axit sunfuric đặc',
    type: 'Video bài giảng',
    subject: 'Hóa học',
    grade: 10,
    chapter: 'Chương 6: Oxi - Lưu huỳnh',
    description: 'Video quay chậm hiện tượng cột than dâng cao kèm khói trắng và mùi hắc khi cho H2SO4 đặc vào cốc đựng đường saccarozo.',
    fileSize: '45.1 MB',
    onlineUrl: 'https://www.youtube.com',
    tags: ['Video', 'Thí nghiệm', 'An toàn hóa chất'],
    uploadDate: '2025-04-10',
    author: 'Hoàng Việt Dũng',
  },
  {
    id: 'res-5',
    title: 'Đề kiểm tra định kỳ giữa học kỳ II môn Hóa 10 (Có ma trận & bảng đặc tả)',
    type: 'Đề kiểm tra',
    subject: 'Hóa học',
    grade: 10,
    chapter: 'Kiểm tra đánh giá',
    description: 'Đề thi 4 mã đề chuẩn hóa theo cấu trúc trắc nghiệm đúng sai và trả lời ngắn theo chương trình mới.',
    fileSize: '1.8 MB',
    downloadUrl: '#',
    tags: ['Đề kiểm tra', 'Giữa kỳ II', 'Ma trận đặc tả'],
    uploadDate: '2025-03-28',
    author: 'Hoàng Việt Dũng',
  },
  {
    id: 'res-6',
    title: 'Trò chơi học tập: Vòng quay nguyên tố Hóa học',
    type: 'Trò chơi học tập',
    subject: 'Hóa học',
    grade: 10,
    chapter: 'Bảng tuần hoàn các nguyên tố hóa học',
    description: 'Ứng dụng mini game ôn tập bảng tuần hoàn, cấu hình electron và tính kim loại phi kim, học sinh hào hứng tham gia.',
    fileSize: '5.6 MB',
    onlineUrl: '#',
    tags: ['Game hóa học', 'Khởi động', 'Bảng tuần hoàn'],
    uploadDate: '2025-04-05',
    author: 'Hoàng Việt Dũng',
  },
];

export const initialAttendanceSessions: AttendanceSession[] = [
  {
    id: 'att-session-1',
    date: '2025-04-28',
    classCode: '10A1',
    period: 'Tiết 1',
    subject: 'Hóa học',
    topic: 'Bài 32: Luyện tập Oxi - Lưu huỳnh',
    totalStudents: 35,
    presentCount: 33,
    excusedCount: 1,
    unexcusedCount: 1,
    lateCount: 0,
    generalNotes: 'Lớp học trật tự, tập trung nghe giảng bài tập hỗn hợp.',
    createdAt: '2025-04-28 07:15',
    records: initialStudents.slice(0, 35).map((s) => {
      if (s.code === 'HS004') {
        return {
          studentId: s.id,
          studentCode: s.code,
          studentName: s.name,
          status: 'excused',
          note: 'Bị cảm sốt, gia đình có đơn xin phép giáo viên chủ nhiệm',
          parentPhone: s.parentPhone,
        };
      }
      if (s.code === 'HS007') {
        return {
          studentId: s.id,
          studentCode: s.code,
          studentName: s.name,
          status: 'unexcused',
          note: 'Không có mặt đầu giờ, chưa rõ lý do',
          parentPhone: s.parentPhone,
        };
      }
      return {
        studentId: s.id,
        studentCode: s.code,
        studentName: s.name,
        status: 'present',
        note: '',
        parentPhone: s.parentPhone,
      };
    }),
  },
  {
    id: 'att-session-2',
    date: '2025-04-28',
    classCode: '10A2',
    period: 'Tiết 2',
    subject: 'Hóa học',
    topic: 'Bài 33: Axit sunfuric và muối sunfat',
    totalStudents: 30,
    presentCount: 29,
    excusedCount: 0,
    unexcusedCount: 0,
    lateCount: 1,
    generalNotes: 'Thực hành an toàn với axit, học sinh tích cực phát biểu.',
    createdAt: '2025-04-28 08:05',
    records: initialStudents.filter(s => s.classId === 'cls-10a2').map((s, idx) => {
      if (idx === 3) {
        return {
          studentId: s.id,
          studentCode: s.code,
          studentName: s.name,
          status: 'late',
          note: 'Đi muộn 7 phút do hỏng xe đạp',
          parentPhone: s.parentPhone,
        };
      }
      return {
        studentId: s.id,
        studentCode: s.code,
        studentName: s.name,
        status: 'present',
        note: '',
        parentPhone: s.parentPhone,
      };
    }),
  },
  {
    id: 'att-session-3',
    date: '2025-04-25',
    classCode: '10A1',
    period: 'Tiết 2',
    subject: 'Hóa học',
    topic: 'Thực hành tính chất của Oxi, Lưu huỳnh',
    totalStudents: 35,
    presentCount: 34,
    excusedCount: 1,
    unexcusedCount: 0,
    lateCount: 0,
    generalNotes: 'Buổi thực hành phòng thí nghiệm hóa học an toàn tuyệt đối.',
    createdAt: '2025-04-25 08:00',
    records: initialStudents.slice(0, 35).map((s) => {
      if (s.code === 'HS002') {
        return {
          studentId: s.id,
          studentCode: s.code,
          studentName: s.name,
          status: 'excused',
          note: 'Nghỉ có phép việc gia đình',
          parentPhone: s.parentPhone,
        };
      }
      return {
        studentId: s.id,
        studentCode: s.code,
        studentName: s.name,
        status: 'present',
        note: '',
        parentPhone: s.parentPhone,
      };
    }),
  },
];

