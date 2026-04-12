import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Plus, Trash2, ImagePlus, Paperclip, FileText, X, Download } from 'lucide-react';
import { toast } from 'sonner';

interface Attachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

const categories = [
  { value: 'general', label: '일반' },
  { value: 'schedule', label: '일정' },
  { value: 'room', label: '방배정' },
  { value: 'preparation', label: '준비사항' },
  { value: 'batch', label: '차수' },
];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function AdminAnnouncements() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [imageWidth, setImageWidth] = useState(100);
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const ext = file.name.split('.').pop();
    const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('announcements').upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from('announcements').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const newAttachments: Attachment[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadFile(file, 'attachments');
        newAttachments.push({ name: file.name, url, type: file.type, size: file.size });
      }
      setAttachments((prev) => [...prev, ...newAttachments]);
      toast.success(`${newAttachments.length}개 파일이 첨부되었습니다`);
    } catch (err: any) {
      toast.error('파일 업로드 실패: ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleContentImageInsert = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 삽입할 수 있습니다');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadFile(file, 'content-images');
      const imgTag = `\n<img src="${url}" width="${imageWidth}%" />\n`;
      setContent((prev) => prev + imgTag);
      toast.success('이미지가 삽입되었습니다');
    } catch (err: any) {
      toast.error('이미지 업로드 실패: ' + err.message);
    } finally {
      setUploading(false);
      if (contentImageInputRef.current) contentImageInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('general');
    setAttachments([]);
    setImageWidth(100);
  };

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('announcements').insert({
        title,
        content,
        category,
        author_id: user!.id,
        attachments: attachments.length > 0 ? JSON.parse(JSON.stringify(attachments)) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('공지가 등록되었습니다');
      setOpen(false);
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('공지가 삭제되었습니다');
    },
  });

  const getAttachments = (ann: any): Attachment[] => {
    if (!ann.attachments) return [];
    if (Array.isArray(ann.attachments)) return ann.attachments;
    return [];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">공지사항 관리</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-1 h-4 w-4" />새 공지 작성</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>새 공지사항</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Category */}
              <div className="space-y-2">
                <Label>카테고리</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label>제목</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="공지 제목" />
              </div>

              {/* Content with image tools */}
              <div className="space-y-2">
                <Label>내용</Label>
                <div className="flex items-center gap-2 rounded-t-md border border-b-0 bg-muted/50 px-2 py-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => contentImageInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <ImagePlus className="mr-1 h-4 w-4" />
                    이미지 삽입
                  </Button>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>크기:</span>
                    <Slider
                      value={[imageWidth]}
                      onValueChange={([v]) => setImageWidth(v)}
                      min={10}
                      max={100}
                      step={5}
                      className="w-24"
                    />
                    <span className="min-w-[2.5rem]">{imageWidth}%</span>
                  </div>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="공지 내용을 입력하세요. 이미지는 위 버튼으로 삽입할 수 있습니다."
                  className="flex min-h-[200px] w-full rounded-b-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <input
                  ref={contentImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleContentImageInsert}
                />
              </div>

              {/* File Attachments */}
              <div className="space-y-2">
                <Label>첨부파일</Label>
                <div
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/25 p-4 transition hover:border-primary/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {uploading ? '업로드 중...' : '클릭하여 파일을 첨부하세요 (이미지, 엑셀, PDF 등)'}
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileAttach}
                />
                {attachments.length > 0 && (
                  <div className="space-y-1.5">
                    {attachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-1.5 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1 truncate">{att.name}</span>
                        <span className="text-xs text-muted-foreground">{formatFileSize(att.size)}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeAttachment(i)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button className="w-full" onClick={() => create.mutate()} disabled={!title || !content || uploading}>
                등록
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {announcements?.map((ann) => {
          const annAttachments = getAttachments(ann);
          return (
            <Card key={ann.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{categories.find((c) => c.value === ann.category)?.label || ann.category}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(ann.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <CardTitle className="mt-1 text-base">{ann.title}</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove.mutate(ann.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none whitespace-pre-wrap text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: ann.content.replace(/<img /g, '<img style="max-width:100%;height:auto;border-radius:8px;" ') }}
                />
                {annAttachments.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">첨부파일</p>
                    {annAttachments.map((att: Attachment, i: number) => (
                      <a
                        key={i}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-1.5 text-sm hover:bg-muted transition"
                      >
                        <Download className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1 truncate">{att.name}</span>
                        <span className="text-xs text-muted-foreground">{formatFileSize(att.size)}</span>
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
