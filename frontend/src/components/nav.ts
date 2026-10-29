import {
  BarChart3, BookOpen, CalendarCheck, ClipboardList, FileDown, GraduationCap, LayoutDashboard, LifeBuoy, ListChecks, Megaphone,
  Settings as SettingsIcon, ShieldAlert, Sparkles, Trophy, UsersRound, Wallet, Building2, type LucideIcon,
} from 'lucide-react';

export interface NavItem { to: string; label: string; icon: LucideIcon }

export const teacherNav: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/marks', label: 'Marks', icon: Trophy },
  { to: '/assignments', label: 'Assignments', icon: ClipboardList },
  { to: '/syllabus', label: 'Syllabus', icon: ListChecks },
  { to: '/performance', label: 'Class performance', icon: BarChart3 },
  { to: '/notices', label: 'Notices', icon: Megaphone },
  { to: '/complaints', label: 'Complaints', icon: LifeBuoy },
  { to: '/ai', label: 'AI Assistant', icon: Sparkles },
  { to: '/reports', label: 'Reports', icon: FileDown },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export const hodNav: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/risk', label: 'Student risk', icon: ShieldAlert },
  { to: '/students', label: 'Students', icon: GraduationCap },
  { to: '/faculty', label: 'Faculty & teaching', icon: UsersRound },
  { to: '/academics', label: 'Departments & classes', icon: Building2 },
  { to: '/fees', label: 'Fees', icon: Wallet },
  { to: '/syllabus', label: 'Syllabus progress', icon: BookOpen },
  { to: '/notices', label: 'Notices', icon: Megaphone },
  { to: '/complaints', label: 'Complaints', icon: LifeBuoy },
  { to: '/ai', label: 'AI Assistant', icon: Sparkles },
  { to: '/reports', label: 'Reports', icon: FileDown },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];



