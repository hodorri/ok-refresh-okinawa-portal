import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function IntroductionForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [subPhotoFile, setSubPhotoFile] = useState<File | null>(null);

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
      const form = new FormData(e.currentTarget);
      let photoUrl = null;
      let subPhotoUrl = null;

      if (photoFile) photoUrl = await uploadPhoto(photoFile, 'photos');
      if (subPhotoFile) subPhotoUrl = await uploadPhoto(subPhotoFile, 'sub-photos');

      const { error } = await supabase.from('introductions').insert({
        user_id: user.id,
        name: form.get('name') as string,
        department: form.get('department') as string,
        position: form.get('position') as string,
        age: form.get('age') as string,
        hometown: form.get('hometown') as string,
        current_city: form.get('current_city') as string,
        join_date: form.get('join_date') as string,
        drinking_smoking: form.get('drinking_smoking') as string,
        mbti: form.get('mbti') as string,
        blood_type: form.get('blood_type') as string,
        personality_pros: form.get('personality_pros') as string,
        personality_cons: form.get('personality_cons') as string,
        recent_happy: form.get('recent_happy') as string,
        recent_sad: form.get('recent_sad') as string,
        hobby: form.get('hobby') as string,
        playlist: form.get('playlist') as string,
        promise_to_team: form.get('promise_to_team') as string,
        photo_url: photoUrl,
        sub_photo_url: subPhotoUrl,
      });

      if (error) throw error;
      toast.success('자기소개서가 등록되었습니다!');
      navigate('/introductions');
    } catch (err: any) {
      toast.error('등록 실패: ' + err.message);
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
      <h1 className="mb-6 text-2xl font-bold">자기소개서 작성</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-primary">기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>이름 *</Label>
              <Input name="name" required placeholder="홍길동" />
            </div>
            <div className="space-y-2">
              <Label>부서</Label>
              <Input name="department" placeholder="인재개발팀" />
            </div>
            <div className="space-y-2">
              <Label>직급</Label>
              <Input name="position" placeholder="팀장" />
            </div>
            <div className="space-y-2">
              <Label>나이(만)</Label>
              <Input name="age" placeholder="30살" />
            </div>
            <div className="space-y-2">
              <Label>고향</Label>
              <Input name="hometown" placeholder="서울" />
            </div>
            <div className="space-y-2">
              <Label>현재 사는 곳</Label>
              <Input name="current_city" placeholder="인덕원" />
            </div>
            <div className="space-y-2">
              <Label>입사일자</Label>
              <Input name="join_date" placeholder="2019.07.31" />
            </div>
            <div className="space-y-2">
              <Label>주량 & 흡연</Label>
              <Input name="drinking_smoking" placeholder="소주 한 병 / 비흡연" />
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
              <Input name="mbti" placeholder="ISFJ" />
            </div>
            <div className="space-y-2">
              <Label>혈액형</Label>
              <Input name="blood_type" placeholder="A형" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>성격 장점</Label>
              <Input name="personality_pros" placeholder="친절함" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>성격 단점</Label>
              <Input name="personality_cons" placeholder="변화를 좋아하지 않음" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>근래 기뻤던 일</Label>
              <Textarea name="recent_happy" placeholder="최근 기뻤던 일을 적어주세요" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>근래 슬펐던 일</Label>
              <Textarea name="recent_sad" placeholder="최근 슬펐던 일을 적어주세요" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>요즘 관심사 또는 취미</Label>
              <Input name="hobby" placeholder="여행" />
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
              <Input name="playlist" placeholder="블랙핑크 - 뛰어" />
            </div>
            <div className="space-y-2">
              <Label>조원들에게 '이것만은 지킬 수 있다!'</Label>
              <Input name="promise_to_team" placeholder="시간약속 철저" />
            </div>
            <div className="space-y-2">
              <Label>프로필 사진</Label>
              <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
            </div>
            <div className="space-y-2">
              <Label>자유로운 나의 모습 사진</Label>
              <Input type="file" accept="image/*" onChange={(e) => setSubPhotoFile(e.target.files?.[0] || null)} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? '등록 중...' : '자기소개서 제출'}
        </Button>
      </form>
    </div>
  );
}
