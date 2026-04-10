import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X, Home, Users, Megaphone, Settings, UserCircle } from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: '홈', icon: Home },
    { to: '/introductions', label: '자기소개', icon: Users },
    { to: '/announcements', label: '공지사항', icon: Megaphone },
  ];

  const adminItems = [
    { to: '/admin/announcements', label: '공지 관리', icon: Settings },
    { to: '/admin/participants', label: '대상자 관리', icon: UserCircle },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-1.5">
            <span className="text-xl font-extrabold text-primary">OK!</span>
            <span className="text-lg font-bold text-foreground">Refresh</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isActive(item.to)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin &&
              adminItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    isActive(item.to)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden text-sm text-muted-foreground md:inline">
                  {user.user_metadata?.display_name || user.email}
                </span>
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button size="sm" className="rounded-full px-5 font-semibold">
                  로그인
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="border-t border-border/50 bg-background p-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(item.to) ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              {isAdmin &&
                adminItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive(item.to) ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
