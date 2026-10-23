import React, { useState, useEffect } from 'react';
import { X, Building2, Save } from 'lucide-react';
import { ClassInfo } from '../../types';

interface ClassModalProps {
  isOpen: boolean;
  classItem: ClassInfo | null;
  onClose: () => void;
  onSave: (classData: Omit<ClassInfo, 'id'> | ClassInfo) => void;
}

export const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  classItem,
  onClose,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(10);
  const [room, setRoom] = useState('Phòng 201');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [teacher, setTeacher] = useState('Hoàng Việt Dũng');
  const [subject, setSubject] = useState('Hóa học');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (classItem) {
      setCode(classItem.code);
      setName(classItem.name);
      setGrade(classItem.grade);
      setRoom(classItem.room);
      setAcademicYear(classItem.academicYear);
      setTeacher(classItem.teacher);
      setSubject(classItem.subject);
      setNote(classItem.note || '');
    } else {
      setCode('');
      setName('');
      setGrade(10);
      setRoom('Phòng 201');
      setAcademicYear('2024-2025');
      setTeacher('Hoàng Việt Dũng');
      setSubject('Hóa học');
      setNote('');
    }
  }, [classItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    if (classItem) {
      onSave({
        ...classItem,
        code: code.trim().toUpperCase(),
        name: name.trim() || `Lớp ${code.trim().toUpperCase()}`,
        grade,
        room,
        academicYear,
        teacher,
        subject,
        note,
      });
    } else {
      onSave({
        code: code.trim().toUpperCase(),
        name: name.trim() || `Lớp ${code.trim().toUpperCase()}`,
        grade,
        room,
        academicYear,
        teacher,
        subject,
        studentCount: 0,
        note,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="bg-[#063B7A] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-300" />
            <h3 className="text-base font-bold">
              {classItem ? 'Chỉnh sửa thông tin lớp' : 'Thêm lớp học mới'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mã lớp (*)</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="VD: 10A4"
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-bold uppercase focus:ring-1 focus:ring-sky-500"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Khối lớp (*)</label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold"
              >
                <option value={10}>Khối 10</option>
                <option value={11}>Khối 11</option>
                <option value={12}>Khối 12</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tên hiển thị</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Lớp 10A4 - Ban Tự nhiên"
              className="w-full px-3 py-1.5 border border-slate-300 rounded font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phòng học</label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Năm học</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Giáo viên giảng dạy</label>
              <input
                type="text"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Môn học</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Ghi chú về lớp</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Đặc điểm lớp, năng lực học sinh..."
              className="w-full px-3 py-1.5 border border-slate-300 rounded"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-bold"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#063B7A] hover:bg-[#0756A8] text-white rounded font-bold flex items-center gap-1.5 shadow"
            >
              <Save className="w-4 h-4" />
              <span>{classItem ? 'Lưu thay đổi' : 'Thêm lớp'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
