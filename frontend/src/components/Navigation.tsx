import { Button } from '@/components/ui/button';
import { Sprout, Building2, FileText, BarChart3, BookOpen, LogIn, User, LogOut } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user?: { name: string; email: string } | null;
}

export function Navigation({ activeTab, onTabChange, user }: NavigationProps) {
  const handleLogout = () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
    window.location.reload();
  };
  const tabs = [
    { id: 'home', label: '홈', icon: Sprout },
    { id: 'company', label: '회사정보', icon: Building2 },
    { id: 'content', label: '문단생성', icon: FileText },
    { id: 'charts', label: '도표 및 그림 생성', icon: BarChart3 },
    { id: 'report', label: '최종보고서', icon: BookOpen },
    { id: 'login', label: '로그인', icon: LogIn },
  ];

  return (
    <nav className="bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onTabChange('home')}
          >
            <div className="relative">
              <Sprout className="h-8 w-8 text-secondary leaf-sway" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-2xl font-bold text-primary">
              IFRSseed
            </h1>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1">
            {tabs.map((tab) => {
              // 로그인된 경우 로그인 탭 숨기기
              if (tab.id === 'login' && user) return null;

              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300
                    ${isActive
                      ? 'bg-primary text-primary-foreground shadow-seed'
                      : 'text-muted-foreground hover:text-primary hover:bg-seed-light/20'
                    }
                  `}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'seed-grow' : ''}`} />
                  <span className="font-medium">{tab.label}</span>
                </Button>
              );
            })}

            {/* 로그인된 경우 사용자 정보 + 로그아웃 버튼 표시 */}
            {user && (
              <>
                <div className="flex items-center space-x-2 px-4 py-2 text-muted-foreground border-l border-border ml-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{user.name || user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-seed-light/20"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">로그아웃</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}