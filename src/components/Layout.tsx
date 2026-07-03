import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Home, Image, Video, FileText,
  Clock, User, LogOut, ChevronLeft, ChevronRight,
  Sparkles, Zap, Layers,
} from "lucide-react";

const navItems = [
  { path: "/home", label: "首页", icon: Home },
  { path: "/image-studio", label: "文生图", icon: Image },
  { path: "/video-studio", label: "图生视频", icon: Video },
  { path: "/script-studio", label: "剧本生成", icon: FileText },
  { path: "/generation-records", label: "生成记录", icon: Clock },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex h-screen w-screen bg-surface overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col transition-all duration-300 border-r border-border-subtle bg-surface-2 ${
          collapsed ? "w-[64px]" : "w-[220px]"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-4 border-b border-border-subtle">
          <img
            src="/yunhu-logo.png"
            alt="云狐"
            className="w-8 h-8 rounded-lg object-contain shrink-0"
          />
          {!collapsed && (
            <span className="gradient-text font-bold text-sm whitespace-nowrap">
              云狐 Studio
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  active
                    ? "bg-brand-500/15 text-brand-400"
                    : "text-white/55 hover:text-white/85 hover:bg-white/[0.06]"
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${active ? "text-brand-400" : "text-white/40 group-hover:text-white/60"}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-3 border-t border-border-subtle" />

        {/* User / Bottom */}
        <div className="p-2">
          {!collapsed && user && (
            <div className="px-3 py-2 mb-1">
              <p className="text-xs text-white/40 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={() => navigate("/home")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/55 hover:text-white/85 hover:bg-white/[0.06] transition-all"
          >
            <User className="w-5 h-5 shrink-0 text-white/40" />
            {!collapsed && <span className="truncate">{user?.nickname || "Creator"}</span>}
          </button>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>退出</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-8 border-t border-border-subtle text-white/25 hover:text-white/50 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-12 border-b border-border-subtle flex items-center justify-between px-6 glass shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/35">
              {navItems.find((i) => i.path === location.pathname)?.label || ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/25 flex items-center gap-1">
              <Zap className="w-3 h-3 text-brand-500" />
              云狐 AI 创意工坊 v1.0
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
