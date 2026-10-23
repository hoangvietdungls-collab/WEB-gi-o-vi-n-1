import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Filter,
  FileText,
  CheckCircle,
  Building,
  User,
  Calendar
} from 'lucide-react';
import { ClassInfo, Student, GradeRecord, TeacherProfile, GradeConfig, LessonPlan } from '../types';
import { StorageService } from '../services/storage';

interface ReportsViewProps {
  teacher: TeacherProfile;
  classes: ClassInfo[];
  students: Student[];
  grades: GradeRecord[];
  lessonPlans: LessonPlan[];
  gradeConfig: GradeConfig;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  teacher,
  classes,
  students,
  grades,
  lessonPlans,
  gradeConfig,
}) => {
  const [reportType, setReportType] = useState<
    'student_list' | 'grade_sheet' | 'tier_stat' | 'missing_grades' | 'remedial' | 'progress' | 'attendance'
  >('grade_sheet');

  const [selectedClass, setSelectedClass] = useState('10A1');
  const [selectedSemester, setSelectedSemester] = useState<'HKI' | 'HKII'>('HKI');

  // Filtered students & grades for selected class
  const classStudents = useMemo(() => {
    return students.filter(s => selectedClass === 'all' || s.className === selectedClass);
  }, [students, selectedClass]);

  const classGrades = useMemo(() => {
    return grades.filter(g => {
      if (selectedClass !== 'all' && g.classCode !== selectedClass) return false;
      if (g.semester !== selectedSemester) return false;
      return true;
    });
  }, [grades, selectedClass, selectedSemester]);

  const gradeMap = useMemo(() => {
    const map = new Map<string, GradeRecord>();
    classGrades.forEach(g => map.set(g.studentId, g));
    return map;
  }, [classGrades]);

  // Export CSV
  const handleExportCSV = () => {
    if (reportType === 'grade_sheet') {
      const headers = ['STT', 'Mã HS', 'Họ và tên', 'Lớp', 'TX1', 'TX2', 'TX3', 'TX4', 'Giữa kỳ', 'Cuối kỳ', 'Điểm TB', 'Xếp loại'];
      const rows = classStudents.map((s, idx) => {
        const g = gradeMap.get(s.id);
        return [
          idx + 1,
          s.code,
          s.name,
          s.className,
          g?.tx1 ?? '',
          g?.tx2 ?? '',
          g?.tx3 ?? '',
          g?.tx4 ?? '',
          g?.gk ?? '',
          g?.ck ?? '',
          g?.avg !== null && g?.avg !== undefined ? g.avg.toFixed(1) : '',
          g?.tier || '',
        ];
      });
      StorageService.exportCsv(`Bao-cao-bang-diem-${selectedClass}-${selectedSemester}.csv`, headers, rows);
    } else if (reportType === 'attendance') {
      const sessions = StorageService.getAttendanceSessions();
      const headers = ['STT', 'Mã HS', 'Họ và tên', 'Lớp', 'Tổng buổi', 'Có mặt', 'Có phép', 'Không phép', 'Đi muộn', 'Tỷ lệ chuyên cần (%)', 'Đánh giá'];
      const rows = classStudents.map((s, idx) => {
        let assessed = 0, p = 0, e = 0, u = 0, l = 0;
        sessions.filter(sess => sess.classCode === s.className).forEach(sess => {
          const r = sess.records.find(rec => rec.studentId === s.id || rec.studentCode === s.code);
          if (r) {
            assessed++;
            if (r.status === 'present') p++;
            else if (r.status === 'excused') e++;
            else if (r.status === 'unexcused') u++;
            else if (r.status === 'late') l++;
          }
        });
        const rate = assessed > 0 ? Math.round(((p + l) / assessed) * 100) : 100;
        const evaluation = u > 0 || (e + u) >= 2 ? 'Cần chấn chỉnh' : 'Tốt';
        return [idx + 1, s.code, s.name, s.className, assessed, p, e, u, l, `${rate}%`, evaluation];
      });
      StorageService.exportCsv(`Bao-cao-chuyen-can-${selectedClass}.csv`, headers, rows);
    } else {
      const headers = ['STT', 'Mã HS', 'Họ và tên', 'Lớp', 'Giới tính', 'Ngày sinh', 'SĐT Phụ huynh', 'Ghi chú'];
      const rows = classStudents.map((s, idx) => [
        idx + 1,
        s.code,
        s.name,
        s.className,
        s.gender,
        s.dob || '',
        s.parentPhone || '',
        s.notes || '',
      ]);
      StorageService.exportCsv(`Bao-cao-danh-sach-${selectedClass}.csv`, headers, rows);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Control */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 no-print space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-[#0756A8]" />
              <span>Phân hệ Báo cáo &amp; Xuất Dữ liệu Giảng dạy</span>
            </h1>
            <p className="text-xs text-slate-500">
              Xuất biểu mẫu chuẩn Sở GD&amp;ĐT Lạng Sơn • Trường THPT Tràng Định
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#063B7A] hover:bg-[#0756A8] text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Printer className="w-4 h-4" />
              <span>In báo cáo (PDF)</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Excel / CSV</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-700">Loại báo cáo:</span>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="px-3 py-1.5 border border-slate-300 rounded-md font-bold text-[#0756A8] bg-white"
              >
                <option value="grade_sheet">1. Bảng điểm môn Hóa học chi tiết</option>
                <option value="student_list">2. Danh sách học sinh theo lớp</option>
                <option value="tier_stat">3. Thống kê xếp loại học lực lớp</option>
                <option value="missing_grades">4. Danh sách học sinh còn thiếu điểm</option>
                <option value="remedial">5. Danh sách học sinh cần phụ đạo (ĐTB &lt; 5.0)</option>
                <option value="progress">6. Báo cáo tiến độ kế hoạch dạy học</option>
                <option value="attendance">7. Báo cáo theo dõi chuyên cần và điểm danh</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-700">Lớp:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-md font-semibold bg-white"
              >
                <option value="all">Tất cả các lớp</option>
                {classes.map(c => (
                  <option key={c.id} value={c.code}>{c.code}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-700">Học kỳ:</span>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value as any)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-md font-semibold bg-white"
              >
                <option value="HKI">Học kỳ I</option>
                <option value="HKII">Học kỳ II</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Report Sheet Layout - Official Vietnamese Educational Format */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 sm:p-12 text-slate-900 printable-doc">
        {/* Document Header */}
        <div className="flex justify-between items-start text-xs pb-6 border-b border-slate-200">
          <div className="text-center font-bold">
            <p className="uppercase text-slate-700">SỞ GD&amp;ĐT LẠNG SƠN</p>
            <p className="uppercase text-base font-bold text-[#063B7A]">TRƯỜNG THPT TRÀNG ĐỊNH</p>
            <p className="text-[11px] font-normal text-slate-500 mt-0.5">Tổ chuyên môn: Hóa - Sinh</p>
          </div>

          <div className="text-center font-bold">
            <p className="uppercase tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
            <p className="text-[11px] underline font-semibold mt-0.5">Độc lập - Tự do - Hạnh phúc</p>
            <p className="text-[11px] font-normal italic text-slate-500 mt-2">
              Tràng Định, ngày 28 tháng 04 năm 2025
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center my-6">
          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-slate-900">
            {reportType === 'grade_sheet' && `BẢNG TỔNG HỢP ĐIỂM ĐÁNH GIÁ MÔN HÓA HỌC`}
            {reportType === 'student_list' && `DANH SÁCH HỌC SINH THEO LỚP`}
            {reportType === 'tier_stat' && `BÁO CÁO THỐNG KÊ XẾP LOẠI HỌC LỰC MÔN HÓA HỌC`}
            {reportType === 'missing_grades' && `DANH SÁCH HỌC SINH CÒN THIẾU ĐẦU ĐIỂM MÔN HÓA HỌC`}
            {reportType === 'remedial' && `DANH SÁCH HỌC SINH CẦN PHỤ ĐẠO & BỒI DƯỠNG KIẾN THỨC`}
            {reportType === 'progress' && `BÁO CÁO TIẾN ĐỘ THỰC HIỆN KẾ HOẠCH BÀI DẠY`}
            {reportType === 'attendance' && `BÁO CÁO THEO DÕI CHUYÊN CẦN VÀ ĐIỂM DANH HỌC SINH`}
          </h2>
          <p className="text-xs text-slate-600 mt-1 font-semibold">
            {selectedClass !== 'all' ? `Lớp: ${selectedClass}` : 'Toàn khối giảng dạy'} • {selectedSemester === 'HKI' ? 'Học kỳ I' : 'Học kỳ II'} • Năm học 2024 - 2025
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Giáo viên bộ môn: <strong>Hoàng Việt Dũng</strong>
          </p>
        </div>

        {/* Content Table based on Report Type */}
        {reportType === 'grade_sheet' && (
          <div className="overflow-x-auto my-4">
            <table className="w-full text-xs text-center border-collapse border border-slate-300">
              <thead className="bg-slate-100 font-bold text-slate-800">
                <tr>
                  <th className="py-2 px-2 border border-slate-300 w-10">STT</th>
                  <th className="py-2 px-3 border border-slate-300 w-20 text-left">Mã HS</th>
                  <th className="py-2 px-4 border border-slate-300 text-left min-w-[140px]">Họ và tên</th>
                  <th className="py-2 px-2 border border-slate-300 w-12">Lớp</th>
                  <th className="py-2 px-2 border border-slate-300 w-12">TX1</th>
                  <th className="py-2 px-2 border border-slate-300 w-12">TX2</th>
                  <th className="py-2 px-2 border border-slate-300 w-12">TX3</th>
                  <th className="py-2 px-2 border border-slate-300 w-12">TX4</th>
                  <th className="py-2 px-2 border border-slate-300 w-16">GK (HS2)</th>
                  <th className="py-2 px-2 border border-slate-300 w-16">CK (HS3)</th>
                  <th className="py-2 px-2 border border-slate-300 w-16 font-bold">ĐTB</th>
                  <th className="py-2 px-2 border border-slate-300 w-20">Xếp loại</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {classStudents.map((s, idx) => {
                  const g = gradeMap.get(s.id);
                  const avg = g?.avg;
                  const tier = g?.tier;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-1.5 px-2 border border-slate-300">{idx + 1}</td>
                      <td className="py-1.5 px-3 border border-slate-300 text-left font-semibold">{s.code}</td>
                      <td className="py-1.5 px-4 border border-slate-300 text-left font-bold">{s.name}</td>
                      <td className="py-1.5 px-2 border border-slate-300">{s.className}</td>
                      <td className="py-1.5 px-2 border border-slate-300">{g?.tx1 ?? '-'}</td>
                      <td className="py-1.5 px-2 border border-slate-300">{g?.tx2 ?? '-'}</td>
                      <td className="py-1.5 px-2 border border-slate-300">{g?.tx3 ?? '-'}</td>
                      <td className="py-1.5 px-2 border border-slate-300">{g?.tx4 ?? '-'}</td>
                      <td className="py-1.5 px-2 border border-slate-300 font-bold">{g?.gk ?? '-'}</td>
                      <td className="py-1.5 px-2 border border-slate-300 font-bold">{g?.ck ?? '-'}</td>
                      <td className="py-1.5 px-2 border border-slate-300 font-bold bg-amber-50">
                        {avg !== null && avg !== undefined ? avg.toFixed(1) : '-'}
                      </td>
                      <td className="py-1.5 px-2 border border-slate-300 font-semibold">{tier || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'student_list' && (
          <div className="overflow-x-auto my-4">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead className="bg-slate-100 font-bold text-slate-800">
                <tr>
                  <th className="py-2 px-2 border border-slate-300 w-10 text-center">STT</th>
                  <th className="py-2 px-3 border border-slate-300 w-20">Mã HS</th>
                  <th className="py-2 px-4 border border-slate-300">Họ và tên</th>
                  <th className="py-2 px-2 border border-slate-300 text-center">Lớp</th>
                  <th className="py-2 px-3 border border-slate-300 text-center">Giới tính</th>
                  <th className="py-2 px-3 border border-slate-300">Ngày sinh</th>
                  <th className="py-2 px-3 border border-slate-300">SĐT Phụ huynh</th>
                  <th className="py-2 px-4 border border-slate-300">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {classStudents.map((s, idx) => (
                  <tr key={s.id}>
                    <td className="py-1.5 px-2 border border-slate-300 text-center">{idx + 1}</td>
                    <td className="py-1.5 px-3 border border-slate-300 font-bold">{s.code}</td>
                    <td className="py-1.5 px-4 border border-slate-300 font-semibold">{s.name}</td>
                    <td className="py-1.5 px-2 border border-slate-300 text-center">{s.className}</td>
                    <td className="py-1.5 px-3 border border-slate-300 text-center">{s.gender}</td>
                    <td className="py-1.5 px-3 border border-slate-300">{s.dob}</td>
                    <td className="py-1.5 px-3 border border-slate-300">{s.parentPhone || '-'}</td>
                    <td className="py-1.5 px-4 border border-slate-300 italic text-slate-600">{s.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'tier_stat' && (
          <div className="my-4 space-y-4">
            <table className="w-full text-xs text-center border-collapse border border-slate-300">
              <thead className="bg-slate-100 font-bold">
                <tr>
                  <th className="py-2 px-3 border border-slate-300">Mức xếp loại</th>
                  <th className="py-2 px-3 border border-slate-300">Tiêu chuẩn điểm</th>
                  <th className="py-2 px-3 border border-slate-300">Số lượng học sinh</th>
                  <th className="py-2 px-3 border border-slate-300">Tỷ lệ (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-3 border border-slate-300 font-bold text-emerald-800">Giỏi</td>
                  <td className="py-2 px-3 border border-slate-300">ĐTB &gt;= 8.0</td>
                  <td className="py-2 px-3 border border-slate-300 font-bold">
                    {classGrades.filter(g => (g.avg || 0) >= 8.0).length}
                  </td>
                  <td className="py-2 px-3 border border-slate-300 font-bold">
                    {Math.round((classGrades.filter(g => (g.avg || 0) >= 8.0).length / (classGrades.length || 1)) * 100)}%
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border border-slate-300 font-bold text-amber-800">Khá</td>
                  <td className="py-2 px-3 border border-slate-300">6.5 &lt;= ĐTB &lt; 8.0</td>
                  <td className="py-2 px-3 border border-slate-300 font-bold">
                    {classGrades.filter(g => (g.avg || 0) >= 6.5 && (g.avg || 0) < 8.0).length}
                  </td>
                  <td className="py-2 px-3 border border-slate-300 font-bold">
                    {Math.round((classGrades.filter(g => (g.avg || 0) >= 6.5 && (g.avg || 0) < 8.0).length / (classGrades.length || 1)) * 100)}%
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border border-slate-300 font-bold text-sky-800">Trung bình</td>
                  <td className="py-2 px-3 border border-slate-300">5.0 &lt;= ĐTB &lt; 6.5</td>
                  <td className="py-2 px-3 border border-slate-300 font-bold">
                    {classGrades.filter(g => (g.avg || 0) >= 5.0 && (g.avg || 0) < 6.5).length}
                  </td>
                  <td className="py-2 px-3 border border-slate-300 font-bold">
                    {Math.round((classGrades.filter(g => (g.avg || 0) >= 5.0 && (g.avg || 0) < 6.5).length / (classGrades.length || 1)) * 100)}%
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border border-slate-300 font-bold text-rose-800">Yếu</td>
                  <td className="py-2 px-3 border border-slate-300">ĐTB &lt; 5.0</td>
                  <td className="py-2 px-3 border border-slate-300 font-bold">
                    {classGrades.filter(g => (g.avg || 0) < 5.0 && g.avg !== null).length}
                  </td>
                  <td className="py-2 px-3 border border-slate-300 font-bold">
                    {Math.round((classGrades.filter(g => (g.avg || 0) < 5.0 && g.avg !== null).length / (classGrades.length || 1)) * 100)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'attendance' && (
          <div className="overflow-x-auto my-4">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead className="bg-slate-100 font-bold text-slate-800">
                <tr>
                  <th className="py-2 px-2 border border-slate-300 w-10 text-center">STT</th>
                  <th className="py-2 px-3 border border-slate-300 w-20">Mã HS</th>
                  <th className="py-2 px-4 border border-slate-300">Họ và tên</th>
                  <th className="py-2 px-2 border border-slate-300 text-center">Lớp</th>
                  <th className="py-2 px-2 border border-slate-300 text-center">Tổng buổi</th>
                  <th className="py-2 px-2 border border-slate-300 text-center text-emerald-800">Có mặt</th>
                  <th className="py-2 px-2 border border-slate-300 text-center text-amber-800">Có phép</th>
                  <th className="py-2 px-2 border border-slate-300 text-center text-rose-800">K.Phép</th>
                  <th className="py-2 px-2 border border-slate-300 text-center text-orange-800">Muộn</th>
                  <th className="py-2 px-2 border border-slate-300 text-center font-bold">Chuyên cần</th>
                  <th className="py-2 px-3 border border-slate-300 text-center">Đánh giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {classStudents.map((s, idx) => {
                  const sessions = StorageService.getAttendanceSessions();
                  let assessed = 0, p = 0, e = 0, u = 0, l = 0;
                  sessions.filter(sess => sess.classCode === s.className).forEach(sess => {
                    const r = sess.records.find(rec => rec.studentId === s.id || rec.studentCode === s.code);
                    if (r) {
                      assessed++;
                      if (r.status === 'present') p++;
                      else if (r.status === 'excused') e++;
                      else if (r.status === 'unexcused') u++;
                      else if (r.status === 'late') l++;
                    }
                  });
                  const rate = assessed > 0 ? Math.round(((p + l) / assessed) * 100) : 100;
                  const needsAttention = u > 0 || (e + u) >= 2;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-1.5 px-2 border border-slate-300 text-center">{idx + 1}</td>
                      <td className="py-1.5 px-3 border border-slate-300 font-bold">{s.code}</td>
                      <td className="py-1.5 px-4 border border-slate-300 font-semibold">{s.name}</td>
                      <td className="py-1.5 px-2 border border-slate-300 text-center">{s.className}</td>
                      <td className="py-1.5 px-2 border border-slate-300 text-center font-bold">{assessed}</td>
                      <td className="py-1.5 px-2 border border-slate-300 text-center text-emerald-700 font-semibold">{p}</td>
                      <td className="py-1.5 px-2 border border-slate-300 text-center text-amber-700 font-semibold">{e}</td>
                      <td className="py-1.5 px-2 border border-slate-300 text-center text-rose-700 font-bold">{u}</td>
                      <td className="py-1.5 px-2 border border-slate-300 text-center text-orange-700 font-semibold">{l}</td>
                      <td className="py-1.5 px-2 border border-slate-300 text-center font-bold">{rate}%</td>
                      <td className="py-1.5 px-3 border border-slate-300 text-center">
                        {needsAttention ? (
                          <span className="text-rose-700 font-bold">Cần nhắc nhở</span>
                        ) : (
                          <span className="text-emerald-700 font-semibold">Đạt chuẩn</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Document Footer: Signatures */}
        <div className="grid grid-cols-2 gap-8 text-center text-xs mt-12 pt-6">
          <div>
            <p className="uppercase font-bold text-slate-800">TỔ TRƯỞNG CHUYÊN MÔN</p>
            <p className="text-[11px] text-slate-500 italic mt-0.5">(Ký và ghi rõ họ tên)</p>
            <div className="h-16"></div>
            <p className="font-semibold text-slate-700">Nguyễn Văn B</p>
          </div>

          <div>
            <p className="uppercase font-bold text-slate-800">GIÁO VIÊN BỘ MÔN</p>
            <p className="text-[11px] text-slate-500 italic mt-0.5">(Ký và ghi rõ họ tên)</p>
            <div className="h-16 flex items-center justify-center">
              <span className="font-serif italic text-sky-800 text-lg">Hoàng Việt Dũng</span>
            </div>
            <p className="font-bold text-slate-900">{teacher.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
