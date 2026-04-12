import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const toEmail = (employeeId: string) => `${employeeId}@okfg.internal`;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const employeeId = (form.get('employeeId') as string).trim();
    const password = form.get('password') as string;
    const { error } = await signIn(toEmail(employeeId), password);
    setLoading(false);
    if (error) {
      toast.error('로그인 실패: 사번 또는 비밀번호를 확인해주세요');
    } else {
      navigate('/');
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const displayName = (form.get('displayName') as string).trim();
    const employeeId = (form.get('employeeId') as string).trim();
    const password = form.get('password') as string;

    if (!displayName || !employeeId) {
      toast.error('이름과 사번을 입력해주세요');
      setLoading(false);
      return;
    }

    // 해외연수 대상자 확인
    const { data: isValid, error: validateError } = await supabase.rpc('validate_employee_id', {
      _employee_id: employeeId,
    });

    if (validateError || !isValid) {
      toast.error('해외연수 대상자만 가입할 수 있습니다. 사번을 확인해주세요.');
      setLoading(false);
      return;
    }

    const { error } = await signUp(toEmail(employeeId), password, {
      display_name: displayName,
      employee_id: employeeId,
    });
    setLoading(false);
    if (error) {
      toast.error('회원가입 실패: ' + error.message);
    } else {
      toast.success('회원가입 완료! 연수 정보를 확인하세요.');
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-2 text-2xl font-bold text-primary">OK!</div>
          <CardTitle className="text-xl">2026 해외연수 포털</CardTitle>
          <CardDescription>해외연수 대상자만 가입할 수 있습니다</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-id">사번</Label>
                  <Input id="login-id" name="employeeId" required placeholder="고유사번을 입력하세요" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">비밀번호</Label>
                  <Input id="login-password" name="password" type="password" required placeholder="비밀번호를 입력하세요" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? '로그인 중...' : '로그인'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">이름</Label>
                  <Input id="signup-name" name="displayName" required placeholder="홍길동" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-id">사번</Label>
                  <Input id="signup-id" name="employeeId" required placeholder="고유사번 (대상자 목록에 있는 사번)" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">비밀번호</Label>
                  <Input id="signup-password" name="password" type="password" required minLength={6} placeholder="비밀번호를 입력하세요 (6자 이상)" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? '가입 중...' : '회원가입'}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  해외연수 대상자 명단에 등록된 사번만 가입 가능합니다
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
