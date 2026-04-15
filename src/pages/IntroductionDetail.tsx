import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Heart, MessageCircle, Send, Trash2, Pencil, Music, Target, MapPin, Home, Calendar, Wine, Brain, Droplet, ThumbsUp, ThumbsDown, Smile, Frown, Sparkles, Cake, ExternalLink } from 'lucide-react';
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
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['likes', id] });
      const prev = queryClient.getQueryData<any[]>(['likes', id]) || [];
      const next = isLiked
        ? prev.filter((l) => l.user_id !== user?.id)
        : [...prev, { introduction_id: id, user_id: user?.id }];
      queryClient.setQueryData(['likes', id], next);
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['likes', id], ctx.prev);
      toast.error(e.message);
    },
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('로그인이 필요합니다');
      await supabase.from('introduction_comments').insert({
        introduction_id: id!,
        user_id: user.id,
        content,
      });
    },
    onMutate: async (content: string) => {
      await queryClient.cancelQueries({ queryKey: ['comments', id] });
      const prev = queryClient.getQueryData<any[]>(['comments', id]) || [];
      const myProfile = prev.find((c) => c.user_id === user?.id)?.profiles;
      const optimistic = {
        id: `tmp-${Date.now()}`,
        introduction_id: id,
        user_id: user?.id,
        content,
        created_at: new Date().toISOString(),
        profiles: myProfile || { display_name: '나', avatar_url: null },
      };
      queryClient.setQueryData(['comments', id], [...prev, optimistic]);
      setComment('');
      return { prev };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      queryClient.invalidateQueries({ queryKey: ['comment-counts'] });
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['comments', id], ctx.prev);
      toast.error(e.message);
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      await supabase.from('introduction_comments').delete().eq('id', commentId);
    },
    onMutate: async (commentId: string) => {
      await queryClient.cancelQueries({ queryKey: ['comments', id] });
      const prev = queryClient.getQueryData<any[]>(['comments', id]) || [];
      queryClient.setQueryData(['comments', id], prev.filter((c) => c.id !== commentId));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['comments', id], ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['comment-counts'] }),
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
    { icon: Cake, label: '나이', value: intro.age, color: 'text-pink-500', bg: 'bg-pink-50' },
    { icon: Home, label: '고향', value: intro.hometown, color: 'text-amber-500', bg: 'bg-amber-50' },
    { icon: MapPin, label: '현재 사는 곳', value: intro.current_city, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { icon: Calendar, label: '입사일자', value: intro.join_date, color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: Wine, label: '주량 & 흡연', value: intro.drinking_smoking, color: 'text-rose-500', bg: 'bg-rose-50' },
  ];

  const tmiPairs = [
    { icon: Brain, label: 'MBTI', value: intro.mbti, color: 'text-violet-500', bg: 'bg-violet-50' },
    { icon: Droplet, label: '혈액형', value: intro.blood_type, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  const tmiLong = [
    { icon: ThumbsUp, label: '성격 장점', value: intro.personality_pros, color: 'text-green-600', bg: 'bg-green-50' },
    { icon: ThumbsDown, label: '성격 단점', value: intro.personality_cons, color: 'text-orange-600', bg: 'bg-orange-50' },
    { icon: Smile, label: '근래 기뻤던 일', value: intro.recent_happy, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { icon: Frown, label: '근래 슬펐던 일', value: intro.recent_sad, color: 'text-sky-600', bg: 'bg-sky-50' },
    { icon: Sparkles, label: '요즘 관심사 또는 취미', value: intro.hobby, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
  ];

  const playlistUrl = intro.playlist && /^https?:\/\//i.test(intro.playlist.trim()) ? intro.playlist.trim() : null;

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
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32 ring-4 ring-primary/20 ring-offset-4">
              <AvatarImage src={intro.photo_url || ''} />
              <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
                {intro.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">{intro.department}</p>
              <p className="text-2xl font-bold text-primary">{intro.name}</p>
              <p className="text-sm text-muted-foreground">{intro.position}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile grid */}
      <div>
        <h2 className="mb-3 text-base font-bold text-primary">나의 프로필</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {profileItems.map(
            (item) =>
              item.value && (
                <Card key={item.label} className="transition hover:shadow-md">
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${item.bg}`}>
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{item.label}</p>
                      <p className="break-words font-medium">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ),
          )}
        </div>
      </div>

      {/* TMI */}
      <div>
        <h2 className="mb-3 text-base font-bold text-primary">나의 TMI</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {tmiPairs.map(
            (item) =>
              item.value && (
                <Card key={item.label} className="transition hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${item.bg}`}>
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{item.label}</p>
                      <p className="text-lg font-bold">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ),
          )}
          {tmiLong.map(
            (item) =>
              item.value && (
                <Card key={item.label} className="sm:col-span-2 transition hover:shadow-md">
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${item.bg}`}>
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{item.label}</p>
                      <p className="whitespace-pre-wrap break-words leading-relaxed">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ),
          )}
        </div>
      </div>

      {/* Playlist & Promise */}
      <div className="grid gap-3 md:grid-cols-2">
        {intro.playlist && (
          <Card className="group transition hover:shadow-md">
            <CardContent className="p-0">
              {playlistUrl ? (
                <a
                  href={playlistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-50">
                    <Music className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">여행 Playlist</p>
                    <p className="flex items-center gap-1 break-all font-medium text-primary group-hover:underline">
                      {playlistUrl}
                      <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                    </p>
                  </div>
                </a>
              ) : (
                <div className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-50">
                    <Music className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">여행 Playlist</p>
                    <p className="font-medium">{intro.playlist}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {intro.promise_to_team && (
          <Card className="transition hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent/20">
                <Target className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">이것만은 지킬 수 있다!</p>
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
              <Button size="icon" onClick={() => addComment.mutate(comment.trim())} disabled={!comment.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
