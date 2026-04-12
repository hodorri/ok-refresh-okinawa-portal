import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, FileText } from 'lucide-react';

interface Attachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

const categoryLabels: Record<string, string> = {
  general: '일반',
  schedule: '일정',
  room: '방배정',
  preparation: '준비사항',
  batch: '차수',
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function getAttachments(ann: any): Attachment[] {
  if (!ann.attachments) return [];
  if (Array.isArray(ann.attachments)) return ann.attachments;
  return [];
}

export default function Announcements() {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">공지사항</h1>
        <p className="text-muted-foreground">연수 관련 중요 정보를 확인하세요</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : announcements?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">등록된 공지사항이 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements?.map((ann) => {
            const attachments = getAttachments(ann);
            return (
              <Card key={ann.id}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{categoryLabels[ann.category] || ann.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(ann.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{ann.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm max-w-none whitespace-pre-wrap text-sm text-muted-foreground"
                    dangerouslySetInnerHTML={{
                      __html: ann.content.replace(
                        /<img /g,
                        '<img style="max-width:100%;height:auto;border-radius:8px;" '
                      ),
                    }}
                  />
                  {attachments.length > 0 && (
                    <div className="mt-4 space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">첨부파일</p>
                      {attachments.map((att, i) => (
                        <a
                          key={i}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm transition hover:bg-muted"
                        >
                          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="flex-1 truncate">{att.name}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">{formatFileSize(att.size)}</span>
                          <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
