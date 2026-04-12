import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function IntroductionForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [subPhotoFile, setSubPhotoFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: '',
    department: '',
    position: '',
    age: '',
    hometown: '',
    current_city: '',
    join_date: '',
    drinking_smoking: '',
    mbti: '',
    blood_type: '',
    personality_pros: '',
    personality_cons: '',
    recent_happy: '',
    recent_sad: '',
    hobby: '',
    playlist: '',
    promise_to_team: '',
  });

  // 수정 모드: 기존 자기소개 데이터 로드
  const { data: existing } = useQuery({
    queryKey: ['introduction', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('introductions').select('*').eq('id', id!).single();
      if (error) throw error;
      return data;
    },
    enabled: isEdit,
  });

  // 신규 작성 모드: participants 테이블에서 기본 정보 자동 채움
  const { data: participant } = useQuery({
    queryKey: ['my-participant', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !isEdit && !!user,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name || '',
        department: existing.department || '',
        position: existing.position || '',
        age: existing.age || '',
        hometown: existing.hometown || '',
        current_city: existing.current_city || '',
        join_date: existing.join_date || '',
        drinking_smoking: existing.drinking_smoking || '',
        mbti: existing.mbti || '',
        blood_type: existing.blood_type || '',
        personality_pros: existing.personality_pros || '',
        personality_cons: existing.personality_cons || '',
        recent_happy: existing.recent_happy || '',
        recent_sad: existing.recent_sad || '',
        hobby: existing.hobby || '',
        playlist: existing.playlist || '',
        promise_to_team: existing.promise_to_team || '',
      });
    }
  }, [existing]);

  // 신규 작성 시 participants 데이터로 기본값 세팅
  useEffect(() => {
    if (!isEdit && participant && !form.name) {
      setForm((prev) => ({
        ...prev,
        name: participant.name || prev.name,
        department: [participant.department, participant.team].filter(Boolean).join(' / ') || prev.department,
        position: participant.position || prev.position,
        age: participant.age ? `${participant.age}살` : prev.age,
        current_city: participant.work_area || prev.current_city,
      }));
    }
  }, [participant, isEdit]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const uploadPhoto = async (file: File, path: string) => {
    const ext = file.name.split('.').pop();
    const filePath = `${path}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(filePath, file);
    if (error) throw error;
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      let photoUrl = isEdit ? existing?.photo_url : null;
      let subPhotoUrl = isEdit ? existing?.sub_photo_url : null;

      if (photoFile) photoUrl = await uploadPhoto(photoFile, 'photos');
      if (subPhotoFile) subPhotoUrl = await uploadPhoto(subPhotoFile, 'sub-photos');

      const payload = {
        ...form,
        photo_url: photoUrl,
        sub_photo_url: subPhotoUrl,
      };

      if (isEdit) {
        const { error } = await supabase.from('introductions').update(payload).eq('id', id!);
        if (error) throw error;
        toast.success('자기소개서가 수정되었습니다!');
        navigate(`/introductions/${id}`);
      } else {
        const { error } = await supabase.from('introductions').insert({
          ...payload,
          user_id: user.id,
        });
        if (error) throw error;
        toast.success('자기소개서가 등록되었습니다!');
        navigate('/introductions');
      }
    } catch (err: any) {
      toast.error((isEdit ? '수정' : '등록') + ' 실패: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">
        {isEdit ? '자기소개서 수정' : '자기소개서 작성'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-primary">기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>이름 *</Label>
              <Input value={form.name} onChange={(e) => updateField('name', e.target.value)} required placeholder="홍길동" />
            </div>
            <div className="space-y-2">
              <Label>부서</Label>
              <Input value={form.department} onChange={(e) => updateField('department', e.target.value)} placeholder="인재개발팀" />
            </div>
            <div className="space-y-2">
              <Label>직급</Label>
              <Input value={form.position} onChange={(e) => updateField('position', e.target.value)} placeholder="팀장" />
            </div>
            <div className="space-y-2">
              <Label>나이(만)</Label>
              <Input value={form.age} onChange={(e) => updateField('age', e.target.value)} placeholder="30살" />
            </div>
            <div className="space-y-2">
              <Label>고향</Label>
              <Input value={form.hometown} onChange={(e) => updateField('hometown', e.target.value)} placeholder="서울" />
            </div>
            <div className="space-y-2">
              <Label>현재 사는 곳</Label>
              <Input value={form.current_city} onChange={(e) => updateField('current_city', e.target.value)} placeholder="인덕원" />
            </div>
            <div className="space-y-2">
              <Label>입사일자</Label>
              <Input value={form.join_date} onChange={(e) => updateField('join_date', e.target.value)} placeholder="2019.07.31" />
            </div>
            <div className="space-y-2">
              <Label>주량 & 흡연</Label>
              <Input value={form.drinking_smoking} onChange={(e) => updateField('drinking_smoking', e.target.value)} placeholder="소주 한 병 / 비흡연" />
            </div>
          </CardContent>
        </Card>

        {/* TMI */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-primary">나의 TMI</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>MBTI</Label>
              <Input value={form.mbti} onChange={(e) => updateField('mbti', e.target.value)} placeholder="ISFJ" />
            </div>
            <div className="space-y-2">
              <Label>혈액형</Label>
              <Input value={form.blood_type} onChange={(e) => updateField('blood_type', e.target.value)} placeholder="A형" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>성격 장점</Label>
              <Input value={form.personality_pros} onChange={(e) => updateField('personality_pros', e.target.value)} placeholder="친절함" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>성격 단점</Label>
              <Input value={form.personality_cons} onChange={(e) => updateField('personality_cons', e.target.value)} placeholder="변화를 좋아하지 않음" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>근래 기뻤던 일</Label>
              <Textarea value={form.recent_happy} onChange={(e) => updateField('recent_happy', e.target.value)} placeholder="최근 기뻤던 일을 적어주세요" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>근래 슬펐던 일</Label>
              <Textarea value={form.recent_sad} onChange={(e) => updateField('recent_sad', e.target.value)} placeholder="최근 슬펐던 일을 적어주세요" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>요즘 관심사 또는 취미</Label>
              <Input value={form.hobby} onChange={(e) => updateField('hobby', e.target.value)} placeholder="여행" />
            </div>
          </CardContent>
        </Card>

        {/* 기타 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-primary">기타</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>여행 Playlist</Label>
              <Input value={form.playlist} onChange={(e) => updateField('playlist', e.target.value)} placeholder="블랙핑크 - 뛰어" />
            </div>
            <div className="space-y-2">
              <Label>조원들에게 '이것만은 지킬 수 있다!'</Label>
              <Input value={form.promise_to_team} onChange={(e) => updateField('promise_to_team', e.target.value)} placeholder="시간약속 철저" />
            </div>
            <div className="space-y-2">
              <Label>프로필 사진 {isEdit && existing?.photo_url && '(변경하지 않으면 기존 사진 유지)'}</Label>
              <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
            </div>
            <div className="space-y-2">
              <Label>자유로운 나의 모습 사진 {isEdit && existing?.sub_photo_url && '(변경하지 않으면 기존 사진 유지)'}</Label>
              <Input type="file" accept="image/*" onChange={(e) => setSubPhotoFile(e.target.files?.[0] || null)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
            취소
          </Button>
          <Button type="submit" className="flex-1" size="lg" disabled={loading}>
            {loading ? (isEdit ? '수정 중...' : '등록 중...') : (isEdit ? '자기소개서 수정' : '자기소개서 제출')}
          </Button>
        </div>
      </form>
    </div>
  );
}
