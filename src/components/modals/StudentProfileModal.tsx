import React from 'react';
import { X, User, Phone, Calendar, BookOpen, Award, CheckCircle, AlertTriangle } from 'lucide-react';
import { Student, GradeRecord, GradeConfig } from '../../types';

interface StudentProfileModalProps {
  student: Student | null;
  gradeRecord: GradeRecord | null;
  gradeConfig: GradeConfig;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (student: Student) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  gradeRecord,
  gradeConfig,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !student) return null;

  const avg = gradeRecord?.avg ?? null;
  const tier = gradeRecord?.tier ?? 'Chưa xếp loại';

  const getTierColor = (t: string | null | undefined) => {
    switch (t) {
      case 'Giỏi':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Khá':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Trung bình':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'Yếu':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#063B7A] to-[#0756A8] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Hồ sơ học tập học sinh</h2>
              <p className="text-xs text-sky-200">Trường THPT Tràng Định - Môn Hóa học</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* General Information */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-800">{student.name}</h3>
                <span className="px-2 py-0.5 text-xs font-bold rounded bg-sky-100 text-sky-800">
                  {student.code}
                </span>
                <span className="px-2 py-0.5 text-xs font-bold rounded bg-slate-100 text-slate-700">
                  Lớp {student.className}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Giới tính: {student.gender} • Ngày sinh: {student.dob || 'Chưa cập nhật'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getTierColor(tier)}`}>
                Xếp loại: {tier}
              </span>
              <div className="bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">
                ĐTB: {avg !== null ? avg.toFixed(1) : '--'}
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-sky-600" />
              <div>
                <span className="text-slate-500 block">SĐT Phụ huynh:</span>
                <span className="font-bold text-slate-800">{student.parentPhone || 'Chưa cập nhật'}</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-slate-500 block">Giáo viên phụ trách:</span>
                <span className="font-bold text-slate-800">Hoàng Việt Dũng</span>
              </div>
            </div>
          </div>

          {/* Chemistry Grade Details */}
          <div>
            <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#0756A8]" />
              <span>Bảng điểm môn Hóa học (Học kỳ I)</span>
            </h4>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs text-center">
                <thead className="bg-[#063B7A] text-white">
                  <tr>
                    <th className="py-2 px-3">TX1 (Hệ số 1)</th>
                    <th className="py-2 px-3">TX2 (Hệ số 1)</th>
                    <th className="py-2 px-3">TX3 (Hệ số 1)</th>
                    <th className="py-2 px-3">TX4 (Hệ số 1)</th>
                    <th className="py-2 px-3 bg-[#0756A8]">Giữa kỳ (HS 2)</th>
                    <th className="py-2 px-3 bg-[#052c5c]">Cuối kỳ (HS 3)</th>
                    <th className="py-2 px-3 bg-amber-600 font-bold">Điểm TB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr className="font-semibold text-slate-800">
                    <td className="py-2.5 px-3">{gradeRecord?.tx1 ?? '-'}</td>
                    <td className="py-2.5 px-3">{gradeRecord?.tx2 ?? '-'}</td>
                    <td className="py-2.5 px-3">{gradeRecord?.tx3 ?? '-'}</td>
                    <td className="py-2.5 px-3">{gradeRecord?.tx4 ?? '-'}</td>
                    <td className="py-2.5 px-3 font-bold text-sky-700 bg-sky-50/50">{gradeRecord?.gk ?? '-'}</td>
                    <td className="py-2.5 px-3 font-bold text-indigo-700 bg-indigo-50/50">{gradeRecord?.ck ?? '-'}</td>
                    <td className="py-2.5 px-3 font-bold text-amber-700 bg-amber-50 text-sm">
                      {avg !== null ? avg.toFixed(1) : '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-500 mt-2 italic">
              * Công thức tính: (Tổng điểm TX + Giữa kỳ × 2 + Cuối kỳ × 3) / Tổng hệ số. Làm tròn 1 chữ số thập phân.
            </p>
          </div>

          {/* Teacher's Evaluation & Notes */}
          <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200 text-xs">
            <h5 className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-amber-700" />
              <span>Nhận xét của giáo viên Hoàng Việt Dũng:</span>
            </h5>
            <p className="text-slate-700 italic">
              {student.notes || gradeRecord?.note || 'Học sinh có ý thức học tập tốt, hoàn thành đầy đủ nhiệm vụ được giao trên lớp.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={() => {
              onClose();
              onEdit(student);
            }}
            className="px-4 py-1.5 text-xs font-bold text-[#063B7A] bg-sky-100 hover:bg-sky-200 rounded-md transition-colors"
          >
            Chỉnh sửa thông tin học sinh
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-white bg-[#063B7A] hover:bg-[#0756A8] rounded-md transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
