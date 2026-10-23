import React, { useState, useMemo } from 'react';
import {
  CalendarCheck2,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit2,
  Trash2,
  FileText,
  Calendar,
  X,
  Save,
  BookOpen
} from 'lucide-react';
import { LessonPlan, ClassInfo } from '../types';
import { StorageService } from '../services/storage';

interface LessonPlanViewProps {
  lessonPlans: LessonPlan[];
  classes: ClassInfo[];
  onRefreshData: () => void;
}

export const LessonPlanView: React.FC<LessonPlanViewProps> = ({
  lessonPlans,
  classes,
  onRefreshData,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'week'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Chưa thực hiện' | 'Đang thực hiện' | 'Đã hoàn thành'>('all');
  const [gradeFilter, setGradeFilter] = useState<'all' | '10' | '11' | '12'>('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<LessonPlan | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [classCode, setClassCode] = useState('10A1');
  const [grade, setGrade] = useState(10);
  const [chapter, setChapter] = useState('Chương 6: Oxi - Lưu huỳnh');
  const [periodNumber, setPeriodNumber] = useState(52);
  const [scheduledDate, setScheduledDate] = useState('2025-04-28');
  const [objectives, setObjectives] = useState('');
  const [mainContent, setMainContent] = useState('');
  const [status, setStatus] = useState<'Chưa thực hiện' | 'Đang thực hiện' | 'Đã hoàn thành'>('Chưa thực hiện');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingPlan(null);
    setTitle('');
    setClassCode('10A1');
    setGrade(10);
    setChapter('Chương 6: Oxi - Lưu huỳnh');
    setPeriodNumber(52);
    setScheduledDate('2025-04-28');
    setObjectives('');
    setMainContent('');
    setStatus('Chưa thực hiện');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (plan: LessonPlan) => {
    setEditingPlan(plan);
    setTitle(plan.title);
    setClassCode(plan.classCode);
    setGrade(plan.grade);
    setChapter(plan.chapter);
    setPeriodNumber(plan.periodNumber);
    setScheduledDate(plan.scheduledDate);
    setObjectives(plan.objectives);
    setMainContent(plan.mainContent);
    setStatus(plan.status);
    setNotes(plan.notes || '');
    setIsModalOpen(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingPlan) {
      StorageService.updateLessonPlan({
        ...editingPlan,
        title: title.trim(),
        classCode,
        grade,
        chapter,
        periodNumber,
        scheduledDate,
        objectives,
        mainContent,
        status,
        notes,
      });
    } else {
      StorageService.addLessonPlan({
        title: title.trim(),
        subject: 'Hóa học',
        classCode,
        grade,
        chapter,
        periodNumber,
        scheduledDate,
        objectives,
        mainContent,
        status,
        resourceLinks: ['Giáo án điện tử', 'Phiếu học tập'],
        notes,
      });
    }
    setIsModalOpen(false);
    onRefreshData();
  };

  const handleDeletePlan = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa kế hoạch bài dạy này?')) {
      StorageService.deleteLessonPlan(id);
      onRefreshData();
    }
  };

  const handleToggleStatus = (plan: LessonPlan) => {
    const nextStatus: Record<string, 'Chưa thực hiện' | 'Đang thực hiện' | 'Đã hoàn thành'> = {
      'Chưa thực hiện': 'Đang thực hiện',
      'Đang thực hiện': 'Đã hoàn thành',
      'Đã hoàn thành': 'Chưa thực hiện',
    };
    StorageService.updateLessonPlan({
      ...plan,
      status: nextStatus[plan.status],
    });
    onRefreshData();
  };

  // Filtered plans
  const filteredPlans = useMemo(() => {
    return lessonPlans.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (gradeFilter !== 'all' && String(p.grade) !== gradeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchChapter = p.chapter.toLowerCase().includes(q);
        const matchClass = p.classCode.toLowerCase().includes(q);
        if (!matchTitle && !matchChapter && !matchClass) return false;
      }
      return true;
    });
  }, [lessonPlans, statusFilter, gradeFilter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck2 className="w-6 h-6 text-[#0756A8]" />
            <span>Kế hoạch Dạy học &amp; Phân phối Chương trình</span>
          </h1>
          <p className="text-xs text-slate-500">
            Môn Hóa học • Trường THPT Tràng Định • Giáo viên: Hoàng Việt Dũng
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center text-xs font-bold text-slate-600">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'list' ? 'bg-white text-[#0756A8] shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Danh sách
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'week' ? 'bg-white text-[#0756A8] shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Lịch tuần
            </button>
          </div>

          <button
            onClick={openAddModal}
            className="px-3.5 py-1.5 bg-[#063B7A] hover:bg-[#0756A8] text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo kế hoạch bài dạy</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên bài học, chương, lớp..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-600">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-md font-semibold bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Chưa thực hiện">Chưa thực hiện</option>
              <option value="Đang thực hiện">Đang thực hiện</option>
              <option value="Đã hoàn thành">Đã hoàn thành</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-600">Khối:</span>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value as any)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-md font-semibold bg-white"
            >
              <option value="all">Tất cả các khối</option>
              <option value="10">Khối 10</option>
              <option value="11">Khối 11</option>
            </select>
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredPlans.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-slate-400 italic border border-slate-100">
              Không có kế hoạch dạy học nào phù hợp với bộ lọc.
            </div>
          ) : (
            filteredPlans.map((plan) => {
              const isCompleted = plan.status === 'Đã hoàn thành';
              const isInProgress = plan.status === 'Đang thực hiện';

              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sky-100 text-[#0756A8] flex flex-col items-center justify-center font-bold flex-shrink-0 text-xs">
                        <span>Tiết</span>
                        <span>{plan.periodNumber}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-base text-slate-900">{plan.title}</h3>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-800">
                            {plan.classCode}
                          </span>
                          <span className="text-xs text-slate-400">• {plan.chapter}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Ngày dự kiến: {plan.scheduledDate}</span>
                        </p>
                      </div>
                    </div>

                    {/* Status Badge with toggle */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(plan)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : isInProgress
                            ? 'bg-sky-50 text-sky-800 border-sky-300 hover:bg-sky-100'
                            : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                        }`}
                        title="Bấm để đổi trạng thái"
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        ) : isInProgress ? (
                          <Clock className="w-3.5 h-3.5 text-sky-600" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span>{plan.status}</span>
                      </button>

                      <button
                        onClick={() => openEditModal(plan)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                        title="Sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Body details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                      <span className="font-bold text-slate-700 block mb-1">Mục tiêu bài dạy:</span>
                      <p className="text-slate-600 leading-relaxed">{plan.objectives}</p>
                    </div>

                    <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                      <span className="font-bold text-slate-700 block mb-1">Nội dung chính &amp; Thí nghiệm:</span>
                      <p className="text-slate-600 leading-relaxed">{plan.mainContent}</p>
                    </div>
                  </div>

                  {plan.notes && (
                    <p className="text-[11px] text-amber-800 italic mt-2.5 bg-amber-50/50 p-2 rounded border border-amber-100">
                      Ghi chú: {plan.notes}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Week Timetable View */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4">
          <h3 className="font-bold text-sm text-slate-800 mb-3">Lịch tiến độ dạy học tuần này (28/4 - 4/5/2025)</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            {['Thứ 2 (28/4)', 'Thứ 3 (29/4)', 'Thứ 4 (30/4)', 'Thứ 5 (1/5)', 'Thứ 6 (2/5)'].map((day, dIdx) => {
              const plansOfDay = lessonPlans.filter((_, idx) => idx % 5 === dIdx);
              return (
                <div key={day} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-2">
                  <div className="font-bold text-center text-[#063B7A] pb-2 border-b border-slate-200">
                    {day}
                  </div>
                  {plansOfDay.map((p) => (
                    <div key={p.id} className="p-2 bg-white rounded border border-sky-100 shadow-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#0756A8]">Tiết {p.periodNumber}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-100 font-bold text-sky-800">
                          {p.classCode}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-800 text-[11px] line-clamp-2">{p.title}</p>
                      <span className="text-[10px] text-emerald-700 block font-medium">{p.status}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="bg-[#063B7A] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editingPlan ? 'Chỉnh sửa kế hoạch bài dạy' : 'Tạo kế hoạch bài dạy mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded hover:bg-white/20 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên bài dạy (*)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Bài 33: Axit sunfuric và muối sunfat"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold focus:ring-1 focus:ring-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lớp giảng dạy</label>
                  <select
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.code}>{c.code}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tiết PPCT</label>
                  <input
                    type="number"
                    value={periodNumber}
                    onChange={(e) => setPeriodNumber(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày thực hiện</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chương / Chủ đề</label>
                <input
                  type="text"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mục tiêu bài học</label>
                <textarea
                  rows={2}
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  placeholder="Kiến thức, năng lực thực hành thí nghiệm..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung chính / Thí nghiệm</label>
                <textarea
                  rows={2}
                  value={mainContent}
                  onChange={(e) => setMainContent(e.target.value)}
                  placeholder="Các hoạt động khởi động, thí nghiệm than hóa, bài toán..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng thái</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold"
                  >
                    <option value="Chưa thực hiện">Chưa thực hiện</option>
                    <option value="Đang thực hiện">Đang thực hiện</option>
                    <option value="Đã hoàn thành">Đã hoàn thành</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ghi chú</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Chuẩn bị hóa chất, dụng cụ..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#063B7A] hover:bg-[#0756A8] text-white rounded font-bold flex items-center gap-1.5 shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingPlan ? 'Lưu kế hoạch' : 'Tạo kế hoạch'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
