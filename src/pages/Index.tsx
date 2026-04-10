import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Megaphone, Calendar, MapPin, FileText } from 'lucide-react';

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent p-8 text-primary-foreground md:p-12">
        <div className="relative z-10">
          <p className="mb-2 text-sm font-medium opacity-90">OK금융그룹 인재개발팀</p>
          <h1 className="mb-4 text-3xl font-bold md:text-4xl">2026 해외연수 포털</h1>
          <p className="mb-6 max-w-xl text-lg opacity-90">
            해외연수에 필요한 모든 정보를 한 곳에서 확인하세요. 자기소개서 작성, 일정 확인, 공지사항까지!
          </p>
          {!user ? (
            <Link to="/login">
              <Button size="lg" variant="secondary">
                로그인하기
              </Button>
            </Link>
          ) : (
            <Link to="/introductions/new">
              <Button size="lg" variant="secondary">
                자기소개서 작성하기
              </Button>
            </Link>
          )}
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/20" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-secondary/20" />
      </section>

      {/* Quick links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/introductions" className="group">
          <Card className="h-full transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">자기소개</CardTitle>
              <CardDescription>참가자들의 자기소개서를 확인하고 댓글과 좋아요를 남겨보세요</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/announcements" className="group">
          <Card className="h-full transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                <Megaphone className="h-5 w-5 text-secondary" />
              </div>
              <CardTitle className="text-lg">공지사항</CardTitle>
              <CardDescription>연수 일정, 준비사항, 방배정 등 중요 정보를 확인하세요</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Card className="h-full">
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
              <MapPin className="h-5 w-5 text-accent-foreground" />
            </div>
            <CardTitle className="text-lg">연수 일정</CardTitle>
            <CardDescription>상세 일정은 공지사항에서 확인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>일정 확인은 공지사항을 참고해주세요</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>준비사항 및 방배정 안내</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
