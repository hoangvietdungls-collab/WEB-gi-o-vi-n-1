import React, { useState, useMemo } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  FileText,
  Video,
  FileSpreadsheet,
  Download,
  ExternalLink,
  Tag,
  Trash2,
  Edit2,
  Eye,
  X,
  Save,
  CheckCircle,
  Gamepad2,
  BookOpen
} from 'lucide-react';
import { LearningResource } from '../types';
import { StorageService } from '../services/storage';

interface ResourcesViewProps {
  resources: LearningResource[];
  onRefreshData: () => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  resources,
  onRefreshData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState<'all' | '10' | '11'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<LearningResource | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<LearningResource['type']>('Giáo án');
  const [grade, setGrade] = useState(10);
  const [chapter, setChapter] = useState('Chương 6: Oxi - Lưu huỳnh');
  const [description, setDescription] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [onlineUrl, setOnlineUrl] = useState('');

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      if (typeFilter !== 'all' && res.type !== typeFilter) return false;
      if (gradeFilter !== 'all' && String(res.grade) !== gradeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = res.title.toLowerCase().includes(q);
        const matchDesc = res.description.toLowerCase().includes(q);
        const matchTag = res.tags.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTag) return false;
      }
      return true;
    });
  }, [resources, typeFilter, gradeFilter, searchQuery]);

  const handleOpenAdd = () => {
    setEditingResource(null);
    setTitle('');
    setType('Giáo án');
    setGrade(10);
    setChapter('Chương 6: Oxi - Lưu huỳnh');
    setDescription('');
    setTagsStr('Hóa 10, Bài giảng, Thí nghiệm');
    setOnlineUrl('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (res: LearningResource) => {
    setEditingResource(res);
    setTitle(res.title);
    setType(res.type);
    setGrade(res.grade);
    setChapter(res.chapter);
    setDescription(res.description);
    setTagsStr(res.tags.join(', '));
    setOnlineUrl(res.onlineUrl || '');
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);

    if (editingResource) {
      StorageService.updateResource({
        ...editingResource,
        title: title.trim(),
        type,
        grade,
        chapter,
        description,
        tags,
        onlineUrl: onlineUrl.trim() || undefined,
      });
    } else {
      StorageService.addResource({
        title: title.trim(),
        type,
        subject: 'Hóa học',
        grade,
        chapter,
        description,
        fileSize: '3.5 MB',
        downloadUrl: '#',
        onlineUrl: onlineUrl.trim() || undefined,
        tags,
        uploadDate: new Date().toISOString().slice(0, 10),
        author: 'Hoàng Việt Dũng',
      });
    }
    setIsAddModalOpen(false);
    onRefreshData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa học liệu này?')) {
      StorageService.deleteResource(id);
      onRefreshData();
    }
  };

  // Real download of a text or markdown summary of the chemistry learning resource
  const handleDownloadFile = (res: LearningResource) => {
    const content = `TRƯỜNG THPT TRÀNG ĐỊNH - TỔ HÓA HỌC
Tài liệu: ${res.title}
Loại học liệu: ${res.type} - Khối: ${res.grade}
Tác giả biên soạn: ${res.author}
Ngày tải lên: ${res.uploadDate}

MÔ TẢ CHI TIẾT:
${res.description}

TỪ KHÓA / TAGS:
${res.tags.join(', ')}

---------------------------------------------------------
Học liệu được đồng bộ từ Hệ thống Quản lý Dạy học Thông minh
Giáo viên: Hoàng Việt Dũng - Trường THPT Tràng Định (Lạng Sơn)
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${res.title.replace(/[^a-zA-Z0-9à-ỹÀ-Ỹ\s]/g, '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTypeIcon = (t: string) => {
    switch (t) {
      case 'Video bài giảng':
        return <Video className="w-5 h-5 text-rose-600" />;
      case 'Đề kiểm tra':
      case 'Câu hỏi trắc nghiệm':
        return <FileSpreadsheet className="w-5 h-5 text-amber-600" />;
      case 'Trò chơi học tập':
        return <Gamepad2 className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-[#0756A8]" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-[#0756A8]" />
            <span>Kho Học liệu Số &amp; Tài nguyên Dạy học</span>
          </h1>
          <p className="text-xs text-slate-500">
            Giáo án, bài giảng PowerPoint, đề kiểm tra, video thí nghiệm Hóa học • THPT Tràng Định
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-[#063B7A] hover:bg-[#0756A8] text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm học liệu mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề tài liệu, mô tả, từ khóa..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-600">Loại:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-md font-semibold bg-white"
            >
              <option value="all">Tất cả loại học liệu</option>
              <option value="Giáo án">Giáo án</option>
              <option value="Bài trình chiếu">Bài trình chiếu</option>
              <option value="PDF">PDF</option>
              <option value="Video bài giảng">Video bài giảng</option>
              <option value="Đề kiểm tra">Đề kiểm tra</option>
              <option value="Trò chơi học tập">Trò chơi học tập</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-600">Khối:</span>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value as any)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-md font-semibold bg-white"
            >
              <option value="all">Tất cả</option>
              <option value="10">Khối 10</option>
              <option value="11">Khối 11</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-100 flex-shrink-0">
                  {getTypeIcon(res.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-[#0756A8]">
                      {res.type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">Khối {res.grade}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mt-1 line-clamp-2 leading-snug">
                    {res.title}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                {res.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-3">
                {res.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 flex items-center gap-1"
                  >
                    <Tag className="w-2.5 h-2.5 text-slate-400" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">
                {res.fileSize || 'Tài liệu số'} • {res.uploadDate}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadFile(res)}
                  className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-[#0756A8] rounded font-bold flex items-center gap-1 transition-colors"
                  title="Tải tệp tài liệu"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải về</span>
                </button>

                <button
                  onClick={() => handleOpenEdit(res)}
                  className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                  title="Sửa"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(res.id)}
                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-[#063B7A] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editingResource ? 'Chỉnh sửa thông tin học liệu' : 'Thêm tài nguyên học liệu số'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded text-white hover:bg-white/20">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề học liệu (*)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Bài giảng điện tử: Oxi và Ozon"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold focus:ring-1 focus:ring-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loại học liệu</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold"
                  >
                    <option value="Giáo án">Giáo án</option>
                    <option value="Bài trình chiếu">Bài trình chiếu</option>
                    <option value="PDF">PDF</option>
                    <option value="Tài liệu Word">Tài liệu Word</option>
                    <option value="Video bài giảng">Video bài giảng</option>
                    <option value="Câu hỏi trắc nghiệm">Câu hỏi trắc nghiệm</option>
                    <option value="Đề kiểm tra">Đề kiểm tra</option>
                    <option value="Trò chơi học tập">Trò chơi học tập</option>
                    <option value="Liên kết trực tuyến">Liên kết trực tuyến</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối lớp</label>
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
                <label className="block font-bold text-slate-700 mb-1">Chương / Chủ đề</label>
                <input
                  type="text"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả nội dung</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tóm tắt nội dung chính của tài liệu..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Từ khóa gắn thẻ (cách nhau bởi dấu phẩy)</label>
                <input
                  type="text"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  placeholder="VD: Hóa 10, Oxi, Thí nghiệm ảo"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#063B7A] hover:bg-[#0756A8] text-white rounded font-bold flex items-center gap-1.5 shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingResource ? 'Lưu thay đổi' : 'Thêm học liệu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
