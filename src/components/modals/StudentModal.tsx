import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';
import { Student, ClassInfo } from '../../types';

interface StudentModalProps {
  isOpen: boolean;
  student: Student | null; // if null, add mode
  classes: ClassInfo[];
  existingCodes: string[];
  onClose: () => void;
  onSave: (studentData: Omit<Student, 'id'> | Student) => void;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  student,
  classes,
  existingCodes,
  onClose,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('2009-01-01');
  const [gender, setGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [classCode, setClassCode] = useState('10A1');
  const [phone, setPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setCode(student.code);
      setName(student.name);
      setDob(student.dob || '2009-01-01');
      setGender(student.gender);
      setClassCode(student.className);
      setPhone(student.phone || '');
      setParentPhone(student.parentPhone || '');
      setNotes(student.notes || '');
      setError(null);
    } else {
      // Auto generate next code
      const highestNum = existingCodes.reduce((max, c) => {
        const match = c.match(/HS(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          return num > max ? num : max;
        }
        return max;
      }, 0);
      setCode(`HS${String(highestNum + 1).padStart(3, '0')}`);
      setName('');
      setDob('2009-01-01');
      setGender('Nam');
      setClassCode(classes[0]?.code || '10A1');
      setPhone('');
      setParentPhone('');
      setNotes('');
      setError(null);
    }
  }, [student, isOpen, classes, existingCodes]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = name.trim();

    if (!trimmedCode) {
      setError('Mã học sinh không được để trống.');
      return;
    }
    if (!trimmedName) {
      setError('Họ và tên học sinh không được để trống.');
      return;
    }

    // Check duplicate code
    if (!student && existingCodes.includes(trimmedCode)) {
      setError(`Mã học sinh ${trimmedCode} đã tồn tại trong hệ thống.`);
      return;
    }
    if (student && student.code !== trimmedCode && existingCodes.includes(trimmedCode)) {
      setError(`Mã học sinh ${trimmedCode} đã tồn tại trong hệ thống.`);
      return;
    }

    const targetClass = classes.find(c => c.code === classCode);
    const classId = targetClass ? targetClass.id : 'cls-10a1';

    if (student) {
      onSave({
        ...student,
        code: trimmedCode,
        name: trimmedName,
        dob,
        gender,
        classId,
        className: classCode,
        phone: phone.trim(),
        parentPhone: parentPhone.trim(),
        notes: notes.trim(),
      });
    } else {
      onSave({
        code: trimmedCode,
        name: trimmedName,
        dob,
        gender,
        classId,
        className: classCode,
        phone: phone.trim(),
        parentPhone: parentPhone.trim(),
        notes: notes.trim(),
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="bg-[#063B7A] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-sky-300" />
            <h3 className="text-base font-bold">
              {student ? 'Chỉnh sửa thông tin học sinh' : 'Thêm học sinh mới'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mã học sinh (*)</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="VD: HS036"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500 focus:outline-none uppercase font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Lớp (*)</label>
              <select
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500 focus:outline-none"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.code}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Họ và tên học sinh (*)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Nguyễn Văn Hoàng"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500 focus:outline-none text-sm font-semibold"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Ngày sinh</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Giới tính</label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="Nam"
                    checked={gender === 'Nam'}
                    onChange={() => setGender('Nam')}
                    className="text-[#0756A8]"
                  />
                  <span>Nam</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="Nữ"
                    checked={gender === 'Nữ'}
                    onChange={() => setGender('Nữ')}
                    className="text-[#0756A8]"
                  />
                  <span>Nữ</span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Số điện thoại học sinh</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0988.xxx.xxx"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Số điện thoại Phụ huynh</label>
              <input
                type="tel"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="VD: 0912.xxx.xxx"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Ghi chú học tập / Hạnh kiểm</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Tích cực phát biểu, cần rèn luyện tính cẩn thận khi giải bài..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 font-bold"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#063B7A] hover:bg-[#0756A8] text-white rounded-md font-bold flex items-center gap-1.5 shadow"
            >
              <Save className="w-4 h-4" />
              <span>{student ? 'Lưu thay đổi' : 'Thêm học sinh'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
