import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const categoryLabels: Record<string, string> = {
  general: '일반',
  schedule: '일정',
  room: '방배정',
  preparation: '준비사항',
  batch: '차수',
};

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
          {announcements?.map((ann) => (
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
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{ann.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
