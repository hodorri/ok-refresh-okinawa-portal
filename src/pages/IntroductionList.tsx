import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function IntroductionList() {
  const { user } = useAuth();

  const { data: introductions, isLoading } = useQuery({
    queryKey: ['introductions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('introductions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: likeCounts } = useQuery({
    queryKey: ['like-counts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('introduction_likes').select('introduction_id');
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach((l) => {
        counts[l.introduction_id] = (counts[l.introduction_id] || 0) + 1;
      });
      return counts;
    },
  });

  const { data: commentCounts } = useQuery({
    queryKey: ['comment-counts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('introduction_comments').select('introduction_id');
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach((c) => {
        counts[c.introduction_id] = (counts[c.introduction_id] || 0) + 1;
      });
      return counts;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">참가자 자기소개</h1>
          <p className="text-muted-foreground">연수 참가자들의 자기소개서를 확인해보세요</p>
        </div>
        {user && (
          <Link to="/introductions/new">
            <Button>
              <Plus className="mr-1 h-4 w-4" />
              자기소개 작성
            </Button>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="mx-auto mb-4 h-24 w-24 rounded-full" />
                <Skeleton className="mx-auto mb-2 h-5 w-24" />
                <Skeleton className="mx-auto h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : introductions?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">아직 작성된 자기소개가 없습니다.</p>
            {user && (
              <Link to="/introductions/new">
                <Button className="mt-4" variant="outline">
                  첫 번째 자기소개를 작성해보세요
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {introductions?.map((intro) => (
            <Link key={intro.id} to={`/introductions/${intro.id}`}>
              <Card className="group h-full cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <Avatar className="mx-auto mb-4 h-24 w-24 ring-2 ring-primary/20 ring-offset-2">
                    <AvatarImage src={intro.photo_url || ''} />
                    <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
                      {intro.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-bold">{intro.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {intro.department} {intro.position && `· ${intro.position}`}
                  </p>
                  {intro.mbti && (
                    <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                      {intro.mbti}
                    </span>
                  )}
                  <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {likeCounts?.[intro.id] || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {commentCounts?.[intro.id] || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
