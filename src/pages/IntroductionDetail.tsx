import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Heart, MessageCircle, Send, Trash2, Pencil, Music, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export default function IntroductionDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [comment, setComment] = useState('');

  const { data: intro, isLoading } = useQuery({
    queryKey: ['introduction', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('introductions').select('*').eq('id', id!).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: likes } = useQuery({
    queryKey: ['likes', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('introduction_likes').select('*').eq('introduction_id', id!);
      if (error) throw error;
      return data;
    },
  });

  const { data: comments } = useQuery({
    queryKey: ['comments', id],
    queryFn: async () => {
      const { data: commentsData, error } = await supabase
        .from('introduction_comments')
        .select('*')
        .eq('introduction_id', id!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      if (!commentsData?.length) return [];
      const userIds = [...new Set(commentsData.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);
      return commentsData.map((c) => ({
        ...c,
        profiles: profiles?.find((p) => p.user_id === c.user_id) || null,
      }));
    },
  });

  const isLiked = likes?.some((l) => l.user_id === user?.id);

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('로그인이 필요합니다');
      if (isLiked) {
        await supabase.from('introduction_likes').delete().eq('introduction_id', id!).eq('user_id', user.id);
      } else {
        await supabase.from('introduction_likes').insert({ introduction_id: id!, user_id: user.id });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['likes', id] }),
    onError: (e) => toast.error(e.message),
  });

  const addComment = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('로그인이 필요합니다');
      if (!comment.trim()) return;
      await supabase.from('introduction_comments').insert({
        introduction_id: id!,
        user_id: user.id,
        content: comment.trim(),
      });
    },
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      queryClient.invalidateQueries({ queryKey: ['comment-counts'] });
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      await supabase.from('introduction_comments').delete().eq('id', commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      queryClient.invalidateQueries({ queryKey: ['comment-counts'] });
    },
  });

  const deleteIntroduction = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('introductions').delete().eq('id', id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['introductions'] });
      toast.success('자기소개가 삭제되었습니다');
      navigate('/introductions');
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <CardContent className="p-8">
            <Skeleton className="mx-auto mb-4 h-32 w-32 rounded-full" />
            <Skeleton className="mx-auto mb-2 h-6 w-40" />
            <Skeleton className="mx-auto h-4 w-60" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!intro) return <p className="text-center text-muted-foreground">자기소개를 찾을 수 없습니다.</p>;

  const profileItems = [
    { label: '나이(만)', value: intro.age },
    { label: '고향', value: intro.hometown },
    { label: '현재 사는 곳', value: intro.current_city },
    { label: '입사일자', value: intro.join_date },
    { label: '주량 & 흡연', value: intro.drinking_smoking },
  ];

  const tmiItems = [
    { label: 'MBTI / 혈액형', value: [intro.mbti, intro.blood_type].filter(Boolean).join(' / ') },
    { label: '성격 장점', value: intro.personality_pros },
    { label: '성격 단점', value: intro.personality_cons },
    { label: '근래 기뻤던 일', value: intro.recent_happy },
    { label: '근래 슬펐던 일', value: intro.recent_sad },
    { label: '요즘 관심사 또는 취미', value: intro.hobby },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary via-primary/80 to-accent p-6 text-center text-primary-foreground relative">
          {(isAdmin || intro.user_id === user?.id) && (
            <div className="absolute right-4 top-4 flex gap-2">
              {(intro.user_id === user?.id || isAdmin) && (
                <Link to={`/introductions/${id}/edit`}>
                  <Button variant="secondary" size="sm">
                    <Pencil className="mr-1 h-4 w-4" />
                    수정
                  </Button>
                </Link>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (window.confirm('이 자기소개를 삭제하시겠습니까?')) {
                    deleteIntroduction.mutate();
                  }
                }}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                삭제
              </Button>
            </div>
          )}
          <p className="text-sm font-medium opacity-80">2026 해외연수</p>
          <h1 className="text-2xl font-bold">참가자 자기소개서</h1>
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            <div className="text-center">
              <Avatar className="mx-auto h-32 w-32 ring-4 ring-primary/20 ring-offset-4">
                <AvatarImage src={intro.photo_url || ''} />
                <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
                  {intro.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <p className="mt-3 text-sm text-muted-foreground">{intro.department}</p>
              <p className="text-lg font-bold text-primary">{intro.name}</p>
              <p className="text-sm text-muted-foreground">{intro.position}</p>
            </div>
            <div className="flex-1">
              <h2 className="mb-3 text-lg font-bold text-primary">나의 프로필</h2>
              <div className="space-y-2">
                {profileItems.map(
                  (item) =>
                    item.value && (
                      <div key={item.label} className="flex gap-2 text-sm">
                        <span className="min-w-[100px] font-medium">{item.label} :</span>
                        <span className="text-muted-foreground">{item.value}</span>
                      </div>
                    ),
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TMI card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">나의 TMI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex-1 space-y-2">
              {tmiItems.map(
                (item) =>
                  item.value && (
                    <div key={item.label} className="text-sm">
                      <span className="font-medium">{item.label} : </span>
                      <span className="text-muted-foreground">{item.value}</span>
                    </div>
                  ),
              )}
            </div>
            {intro.sub_photo_url && (
              <div className="flex-shrink-0">
                <img
                  src={intro.sub_photo_url}
                  alt="서브 사진"
                  className="h-48 w-48 rounded-lg object-cover"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Playlist & Promise */}
      <div className="grid gap-4 md:grid-cols-2">
        {intro.playlist && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Music className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">여행 Playlist</p>
                <p className="font-medium">{intro.playlist}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {intro.promise_to_team && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                <Target className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">이것만은 지킬 수 있다!</p>
                <p className="font-bold text-primary">{intro.promise_to_team}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Like & Comment section */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-4">
            <Button
              variant={isLiked ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleLike.mutate()}
              disabled={!user}
            >
              <Heart className={`mr-1 h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              좋아요 {likes?.length || 0}
            </Button>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              댓글 {comments?.length || 0}
            </span>
          </div>

          <Separator className="mb-4" />

          {/* Comments */}
          <div className="space-y-3">
            {comments?.map((c: any) => (
              <div key={c.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {(c.profiles?.display_name || '?').slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{c.profiles?.display_name || '익명'}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.content}</p>
                </div>
                {c.user_id === user?.id && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteComment.mutate(c.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {user && (
            <div className="mt-4 flex gap-2">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="댓글을 남겨보세요..."
                className="min-h-[60px]"
              />
              <Button size="icon" onClick={() => addComment.mutate()} disabled={!comment.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
