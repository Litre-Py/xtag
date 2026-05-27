import { FileShare } from '../types/card';
import { generateId } from '../utils/uuid';

const MOCK_FILES: FileShare[] = [
  { id: 'file-001', name: '项目方案.pdf', type: 'pdf', size: 2456000, sharedBy: '张三', sharedAt: Date.now() - 3600000 },
  { id: 'file-002', name: '设计稿v2.png', type: 'image', size: 5120000, sharedBy: '李四', sharedAt: Date.now() - 7200000 },
  { id: 'file-003', name: '会议纪要.docx', type: 'document', size: 340000, sharedBy: '王五', sharedAt: Date.now() - 86400000 },
  { id: 'file-004', name: '产品演示.mp4', type: 'video', size: 15360000, sharedBy: '赵六', sharedAt: Date.now() - 172800000 },
  { id: 'file-005', name: '数据报表.xlsx', type: 'spreadsheet', size: 890000, sharedBy: '孙七', sharedAt: Date.now() - 259200000 },
];

class FileShareServiceImpl {
  private files: FileShare[] = MOCK_FILES;

  async getAll(): Promise<FileShare[]> {
    return this.files.sort((a, b) => b.sharedAt - a.sharedAt);
  }

  async getById(id: string): Promise<FileShare | null> {
    return this.files.find((f) => f.id === id) || null;
  }

  async addFile(data: Omit<FileShare, 'id' | 'sharedAt'>): Promise<FileShare> {
    const file: FileShare = { ...data, id: generateId(), sharedAt: Date.now() };
    this.files.unshift(file);
    return file;
  }

  async deleteFile(id: string): Promise<void> {
    this.files = this.files.filter((f) => f.id !== id);
  }

  getFileIcon(type: string): string {
    const icons: Record<string, string> = {
      pdf: '📄', image: '🖼️', document: '📝', video: '🎬',
      spreadsheet: '📊', audio: '🎵', archive: '📦', other: '📎',
    };
    return icons[type] || '📎';
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }
}

export const FileShareService = new FileShareServiceImpl();
