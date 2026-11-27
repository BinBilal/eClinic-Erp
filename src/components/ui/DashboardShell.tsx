import React, { useState } from 'react';
import {
  ArrowUpRight,
  Bell,
  ChevronDown,
  ChevronRight,
  Globe,
  LogOut,
  Mail,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  Plus,
  RotateCcw,
  Search,
  UserCheck,
  X,
} from 'lucide-react';
import { ExperienceRole, NotificationRecord } from '../../types/erp';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: { id: string; label: string }[];
}

export interface SidebarQuickAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface DashboardShellProps {
  roleLabel: string;
  userName: string;
  userEmail: string;
  pageTitle: string;
  breadcrumb?: string;
  navItems: SidebarNavItem[];
  activeNavId: string;
  onSelectNav: (id: string) => void;
  sidebarQuickActions?: SidebarQuickAction[];
  onQuickPlusClick?: () => void;
  notifications: NotificationRecord[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  globalSearchValue?: string;
  onGlobalSearchChange?: (val: string) => void;
  onGlobalSearchSubmit?: (val: string) => void;
  onSwitchExperience: (role: ExperienceRole) => void;
  onRestoreDemoData: () => void;
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  roleLabel,
  userName,
  userEmail,
  pageTitle,
  breadcrumb,
  navItems,
  activeNavId,
  onSelectNav,
  sidebarQuickActions = [],
  onQuickPlusClick,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  globalSearchValue = '',
  onGlobalSearchChange,
  onGlobalSearchSubmit,
  onSwitchExperience,
  onRestoreDemoData,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    tenants: true,
  });
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderSidebarBody = (isMobile: boolean) => (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto px-3 py-3 space-y-4">
      <div className="space-y-4">
        {/* Main Navigation */}
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isChildActive =
              hasChildren && item.children?.some((c) => c.id === activeNavId);
            const isActive = activeNavId === item.id || isChildActive;
            const isExpanded = expandedGroups[item.id] ?? false;

            return (
              <div key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (hasChildren) {
                      if (collapsed && !isMobile) {
                        setCollapsed(false);
                        setExpandedGroups((prev) => ({ ...prev, [item.id]: true }));
                      } else {
                        toggleGroup(item.id);
                      }
                    } else {
                      onSelectNav(item.id);
                      if (isMobile) setMobileOpen(false);
                    }
                  }}
                  title={collapsed && !isMobile ? item.label : undefined}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive && !hasChildren
                      ? 'bg-[#F05D21] text-white'
                      : isActive && hasChildren
                      ? 'bg-white dark:bg-white/12 text-[#1E396A] dark:text-white border border-slate-200 dark:border-white/15'
                      : 'text-[#1E396A]/85 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 hover:text-[#1E396A] dark:hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0">{item.icon}</span>
                    {(!collapsed || isMobile) && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </span>
                  {hasChildren && (!collapsed || isMobile) && (
                    <span className="shrink-0 text-slate-500 dark:text-slate-300">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </button>

                {hasChildren && isExpanded && (!collapsed || isMobile) && (
                  <div className="mt-1 ml-7 pl-3 border-l border-slate-300 dark:border-white/20 space-y-1">
                    {item.children!.map((child) => {
                      const childActive = activeNavId === child.id;
                      return (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => {
                            onSelectNav(child.id);
                            if (isMobile) setMobileOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                            childActive
                              ? 'bg-[#F05D21] text-white'
                              : 'text-slate-600 dark:text-slate-300 hover:text-[#1E396A] dark:hover:text-white hover:bg-white dark:hover:bg-white/10'
                          }`}
                        >
                          {child.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Left Sidebar Quick Actions Card — Solid Line Border */}
        {sidebarQuickActions.length > 0 && (!collapsed || isMobile) && (
          <div className="rounded-xl border border-solid border-slate-300 dark:border-white/35 bg-white dark:bg-[#0B1730] p-3">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-white/15">
              <span className="text-xs font-semibold text-[#1E396A] dark:text-white">Quick Actions</span>
              <button
                type="button"
                onClick={sidebarQuickActions[0]?.onClick}
                aria-label="Quick action"
                className="text-slate-500 dark:text-slate-200 hover:text-[#1E396A] dark:hover:text-white"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-1">
              {sidebarQuickActions.map((qa) => (
                <button
                  key={qa.label}
                  type="button"
                  onClick={() => {
                    qa.onClick();
                    if (isMobile) setMobileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs text-slate-700 dark:text-slate-200 hover:bg-[#F4F6F9] dark:hover:bg-white/10 hover:text-[#1E396A] dark:hover:text-white transition-colors text-left"
                >
                  <span className="shrink-0 text-[#396BA4] dark:text-slate-300">{qa.icon}</span>
                  <span className="truncate">{qa.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Left Sidebar Card — Solid Line Border */}
      {(!collapsed || isMobile) && (
        <div className="rounded-xl border border-solid border-slate-300 dark:border-white/35 bg-white dark:bg-[#14284D] p-3.5 space-y-2.5">
          <div>
            <p className="text-xs font-bold text-[#1E396A] dark:text-white">eClinic ERP</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-200 leading-snug mt-0.5">
              Switch workspace or restore sample records anytime.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onSwitchExperience('login');
              if (isMobile) setMobileOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#1E396A] text-white hover:bg-[#162b52] dark:bg-white dark:text-[#1E396A] text-xs font-semibold dark:hover:bg-slate-100 transition-colors"
          >
            <span>Switch Experience</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F4F6F9] dark:bg-[#0B1220] text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar — Light Gray (#F4F6F9) in Light Theme, Dark Navy in Dark Theme */}
      <aside
        className={`hidden lg:flex flex-col bg-[#F4F6F9] dark:bg-[#0F1E3A] text-[#1E396A] dark:text-white shrink-0 transition-[width] duration-200 border-r border-slate-200 dark:border-slate-800 ${
          collapsed ? 'w-[76px]' : 'w-[256px]'
        }`}
      >
        <div className="h-24 px-3 flex items-center justify-center border-b border-slate-200 dark:border-white/15">
          {collapsed ? (
            <Logo variant="compact" />
          ) : (
            <Logo variant="sidebar" />
          )}
        </div>

        {renderSidebarBody(false)}

        <div className="p-2.5 border-t border-slate-200 dark:border-white/15">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 hover:text-[#1E396A] dark:hover:text-white transition-colors"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 dark:bg-black/70"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-[#F4F6F9] dark:bg-[#0F1E3A] text-[#1E396A] dark:text-white border-r border-slate-200 dark:border-slate-800 flex flex-col h-full z-10">
            <div className="relative h-24 px-12 flex items-center justify-center border-b border-slate-200 dark:border-white/15">
              <Logo variant="sidebar" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-600 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderSidebarBody(true)}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Nexora-style Topbar */}
        <header className="h-16 bg-white dark:bg-[#111B2E] border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 no-print">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search Input matching Nexora Topbar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onGlobalSearchSubmit?.(globalSearchValue);
              }}
              className="hidden sm:flex items-center relative w-full max-w-sm"
            >
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={globalSearchValue}
                onChange={(e) => onGlobalSearchChange?.(e.target.value)}
                placeholder={`Search ${pageTitle.toLowerCase()}...`}
                className="w-full pl-9 pr-12 py-1.5 text-sm bg-[#F4F6F9] dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:border-[#396BA4] focus:bg-white dark:focus:bg-[#0D1628] transition-colors"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] font-mono text-slate-400">
                ⌘K
              </span>
            </form>

            <div className="sm:hidden min-w-0">
              <h1 className="text-sm font-bold text-[#1E396A] dark:text-slate-100 truncate">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {breadcrumb && (
              <span className="hidden xl:inline text-xs font-medium text-slate-400 mr-1">
                {breadcrumb} · {pageTitle}
              </span>
            )}

            {/* Quick Plus Action */}
            {onQuickPlusClick && (
              <button
                type="button"
                onClick={onQuickPlusClick}
                aria-label="Quick create"
                className="h-9 w-9 rounded-full bg-[#F05D21] hover:bg-[#d94f18] text-white flex items-center justify-center transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Quick Support / Public Site */}
            <button
              type="button"
              onClick={() => onSwitchExperience('public')}
              title="Public Website"
              className="hidden sm:flex h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 items-center justify-center transition-colors"
            >
              <Phone className="h-4 w-4" />
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((o) => !o);
                  setProfileOpen(false);
                }}
                aria-label="Notifications"
                className="relative h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#F05D21] text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#1E396A] dark:text-slate-100">
                      Notifications ({unreadCount} unread)
                    </span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={onMarkAllNotificationsRead}
                        className="text-xs font-medium text-[#396BA4] dark:text-sky-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                        No notifications available.
                      </div>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => onMarkNotificationRead(n.id)}
                          className={`w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors ${
                            n.read ? 'opacity-70' : 'bg-[#F4F6F9]/60 dark:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                              {n.title}
                            </span>
                            <span className="text-[11px] text-slate-400 tabular-nums shrink-0">
                              {n.date}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                            {n.message}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onSelectNav('notifications')}
              title="View all alerts & messages"
              className="hidden sm:flex h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 items-center justify-center transition-colors"
            >
              <Mail className="h-4 w-4" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative pl-1 border-l border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((o) => !o);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-[#1E396A] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {userName
                    .split(' ')
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join('')}
                </div>
                <div className="hidden md:block text-left leading-tight">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 max-w-[140px] truncate">
                    {userName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[140px] truncate">
                    {roleLabel}
                  </p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {userName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {userEmail}
                    </p>
                  </div>

                  <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="px-2 py-1 text-[11px] font-semibold text-slate-400">
                      Switch Workspace
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        onSwitchExperience('super_admin');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <UserCheck className="h-3.5 w-3.5 text-[#1E396A] dark:text-sky-400" />
                      Platform Super Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        onSwitchExperience('pharmacy_admin');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <UserCheck className="h-3.5 w-3.5 text-[#F05D21]" />
                      Pharmacy Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        onSwitchExperience('pharmaceutical_admin');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <UserCheck className="h-3.5 w-3.5 text-[#396BA4] dark:text-sky-300" />
                      Pharmaceutical Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        onSwitchExperience('public');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Globe className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                      Public Website
                    </button>
                  </div>

                  <div className="p-2 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        onRestoreDemoData();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                      Restore Sample Data
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        onSwitchExperience('login');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#DC2626] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 p-4 sm:p-6 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
