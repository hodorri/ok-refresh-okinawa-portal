import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Megaphone, Calendar, ArrowRight } from 'lucide-react';
import okinawaCharacter from '@/assets/okinawa-character.png';

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="space-y-16">
      {/* Hero Section - Toss-inspired clean hero */}
      <section className="relative flex flex-col items-center pt-8 pb-4 text-center md:pt-16 md:pb-8">
        {/* Character image */}
        <div className="mb-8 animate-float">
          <img
            src={okinawaCharacter}
            alt="오키나와 캐릭터"
            className="h-40 w-auto drop-shadow-xl md:h-56"
          />
        </div>

        <p className="mb-3 text-sm font-semibold tracking-widest uppercase text-primary">
          OK금융그룹
        </p>
        <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
          2026년 리프레시 해외연수
          <br />
          <span className="text-primary">in Okinawa</span>
        </h1>
        <p className="mb-8 max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl">
          해외연수에 필요한 모든 정보를 한 곳에서 확인하세요.
          <br />
          자기소개서 작성, 일정 확인, 공지사항까지!
        </p>

        {!user ? (
          <Link to="/login">
            <Button size="lg" className="h-14 rounded-2xl px-10 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5">
              시작하기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        ) : (
          <Link to="/introductions/new">
            <Button size="lg" className="h-14 rounded-2xl px-10 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5">
              자기소개서 작성하기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        )}
      </section>

      {/* Feature Cards - Clean grid */}
      <section className="grid gap-6 md:grid-cols-3">
        <Link to="/introductions" className="group">
          <div className="relative overflow-hidden rounded-3xl bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-border/50">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">자기소개</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              참가자들의 자기소개서를 확인하고 댓글과 좋아요를 남겨보세요
            </p>
            <div className="mt-5 flex items-center text-sm font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
              자세히 보기 <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </div>
        </Link>

        <Link to="/announcements" className="group">
          <div className="relative overflow-hidden rounded-3xl bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-border/50">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10">
              <Megaphone className="h-7 w-7 text-secondary" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">공지사항</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              연수 일정, 준비사항, 방배정 등 중요 정보를 확인하세요
            </p>
            <div className="mt-5 flex items-center text-sm font-semibold text-secondary opacity-0 transition-opacity group-hover:opacity-100">
              자세히 보기 <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </div>
        </Link>

        <div className="relative overflow-hidden rounded-3xl bg-card p-8 shadow-sm border border-border/50">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15">
            <Calendar className="h-7 w-7 text-accent" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-foreground">연수 일정</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            상세 일정은 공지사항에서 확인하세요
          </p>
          <div className="mt-5 rounded-xl bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground">
              📍 오키나와 · 일정은 공지사항 참고
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
