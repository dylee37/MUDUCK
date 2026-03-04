import { Outlet, useNavigate, useLocation } from "react-router";
import { Home, Ticket, Heart, User } from "lucide-react";
import TopNav from "../components/TopNav";
import { useEffect } from "react";

export default function Root() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Apply theme from localStorage
    const savedTheme = localStorage.getItem("selectedTheme");
    if (savedTheme) {
      const theme = JSON.parse(savedTheme);
      document.documentElement.style.setProperty("--primary", theme.primary);
      document.documentElement.style.setProperty("--secondary", theme.secondary);
      document.documentElement.style.setProperty("--background", theme.bg);
      document.documentElement.style.setProperty("--foreground", theme.foreground);
    }

    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      navigate("/onboarding");
    }
  }, [navigate]);

  const navItems = [
    { path: "/", icon: Home, label: "홈" },
    { path: "/my-ticket", icon: Ticket, label: "티켓" },
    { path: "/my-favorite", icon: Heart, label: "즐겨찾기" },
    { path: "/my-page", icon: User, label: "마이" },
  ];

  return (
    <div className="min-h-screen pb-20 max-w-5xl mx-auto relative px-4">
      <TopNav />
      <main className="pt-16">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-5xl mx-auto bg-white/70 backdrop-blur-xl border-t border-white/30 shadow-2xl z-50">
        <div className="flex justify-around items-center px-4 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 min-w-[60px] group"
              >
                <Icon
                  size={20}
                  className={`transition-colors ${isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-primary/70"
                    }`}
                />
                <span
                  className={`text-xs transition-colors ${isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-primary/70"
                    }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
