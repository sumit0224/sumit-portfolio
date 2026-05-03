/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  User, Briefcase, 
  Mail, 
  Phone,
  Github, 
  Linkedin, 
  ExternalLink, 
  Wifi, 
  Battery, 
  Search, Copy,
  Check,
  Play,
  Pause,
  Settings,
  Image as ImageIcon,
  Upload,
  SlidersHorizontal,
  Volume2,
  Moon,
  Sun,
  Bluetooth,
  Airplay,
  Accessibility,
  Music,
  SkipBack,
  SkipForward,
  Layout,
  Monitor,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Lock,
  Power,
  RotateCcw,
  Compass,
  FileCode,
  Folder,
  GitBranch,
  Bug,
  Blocks,
  PanelLeft,
  PanelBottom,
  SquareTerminal
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism-tomorrow.css';
import terminalAppIcon from '../assets/icons/terminal.png';
import vscodeAppIcon from '../assets/icons/vscode.png';
import settingAppIcon from '../assets/icons/setting.png';
import finderAppIcon from '../assets/icons/finder.png';
import contactAppIcon from '../assets/icons/contact.png';
import projectsAppIcon from '../assets/icons/projects.png';
import binAppIcon from '../assets/icons/bin.png';
import skillsAppIcon from '../assets/icons/skills.png';
import experienceAppIcon from '../assets/icons/experience.png';
import appleMenuIcon from '../assets/icons/apple-menu.png';
import javascriptSkillIcon from '../assets/icons/javascript.png';
import typescriptSkillIcon from '../assets/icons/typescript.png';
import reactSkillIcon from '../assets/icons/react.png';
import nodeSkillIcon from '../assets/icons/node.png';
import pythonSkillIcon from '../assets/icons/python.png';
import javaSkillIcon from '../assets/icons/java.png';
import gitSkillIcon from '../assets/icons/git.png';
import githubSkillIcon from '../assets/icons/github.png';
import expressSkillIcon from '../assets/icons/express.png';
import tailwindSkillIcon from '../assets/icons/tailwind.png';
import htmlSkillIcon from '../assets/icons/html.png';
import cssSkillIcon from '../assets/icons/css.png';
import postmanSkillIcon from '../assets/icons/postman.png';
import mongodbSkillIcon from '../assets/icons/mongodb.png';
import mysqlSkillIcon from '../assets/icons/mysql.png';
import SystemSettings from '../components/features/SystemSettings';

// --- Types ---

type WindowID = 'about' | 'safari' | 'projects' | 'skills' | 'experience' | 'contact' | 'terminal' | 'playground' | 'settings';
type AboutTabId = 'overview' | 'skills' | 'experience' | 'education';
type PowerAction = 'restart' | 'sleep' | 'shutDown';
type AppearanceMode = 'Light' | 'Dark' | 'Auto';
type WidgetId = 'clock' | 'weather' | 'stocks' | 'calendar' | 'battery';
type WidgetLayout = 'full' | 'half';
type AccentColor = 'blue' | 'purple' | 'pink' | 'red' | 'orange' | 'yellow' | 'green' | 'zinc';
type DesktopContextMenuAction =
  | 'new-folder'
  | 'get-info'
  | 'change-wallpaper'
  | 'edit-widgets'
  | 'use-stacks'
  | 'sort-by'
  | 'clean-up'
  | 'clean-up-by'
  | 'show-view-options';

interface WindowState {
  id: WindowID;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  title: string;
  icon: React.ReactNode;
}

interface BatteryManagerLike {
  level: number;
  charging: boolean;
  addEventListener: (type: 'levelchange' | 'chargingchange', listener: () => void) => void;
  removeEventListener: (type: 'levelchange' | 'chargingchange', listener: () => void) => void;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManagerLike>;
}

type LaunchpadCategory =
  | 'Languages'
  | 'Frontend'
  | 'Backend'
  | 'Database'
  | 'Tools'
  | 'Auth';

interface LaunchpadFolderApp {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface LaunchpadApp {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: LaunchpadCategory;
  type?: 'app' | 'folder';
  children?: LaunchpadFolderApp[];
}

interface ControlCenterTrack {
  id: string;
  title: string;
  artist: string;
  src: string;
}

interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  status: string;
  description: string;
  tech: string[];
  impact: string;
  link: string;
}

// --- Constants ---

const THEME_MODE_STORAGE_KEY = 'portfolio.theme.mode';
const WALLPAPER_STORAGE_KEY = 'portfolio.wallpaper';
const WIDGETS_STORAGE_KEY = 'portfolio.widgets';
const WIDGET_POSITIONS_STORAGE_KEY = 'portfolio.widget.positions';
const ACCENT_COLOR_STORAGE_KEY = 'portfolio.accent.color';
const DOCK_SIZE_STORAGE_KEY = 'portfolio.dock.size';
const DOCK_MAGNIFICATION_STORAGE_KEY = 'portfolio.dock.magnification';
const BRIGHTNESS_STORAGE_KEY = 'portfolio.brightness';
const VOLUME_STORAGE_KEY = 'portfolio.volume';
const NIGHT_SHIFT_STORAGE_KEY = 'portfolio.night.shift';
const STAGE_MANAGER_STORAGE_KEY = 'portfolio.stage.manager';
const USE_STACKS_STORAGE_KEY = 'portfolio.use.stacks';
const DEFAULT_WALLPAPER = 'https://picsum.photos/seed/vibrant/1920/1080';
const ACCENT_COLOR_OPTIONS: AccentColor[] = ['blue', 'purple', 'pink', 'red', 'orange', 'yellow', 'green', 'zinc'];
const WIDGET_OPTIONS: Array<{ id: WidgetId; label: string; layout: WidgetLayout }> = [
  { id: 'clock', label: 'Clock', layout: 'full' },
  { id: 'weather', label: 'Weather', layout: 'half' },
  { id: 'stocks', label: 'Stocks', layout: 'half' },
  { id: 'calendar', label: 'Calendar', layout: 'full' },
  { id: 'battery', label: 'Battery', layout: 'full' },
];
const DEFAULT_WIDGETS: WidgetId[] = [];
const DEFAULT_WIDGET_POSITIONS: Record<WidgetId, { x: number; y: number }> = {
  clock: { x: 24, y: 96 },
  weather: { x: 364, y: 96 },
  stocks: { x: 554, y: 96 },
  calendar: { x: 364, y: 286 },
  battery: { x: 364, y: 566 },
};
const CONTROL_CENTER_TRACKS: ControlCenterTrack[] = [
  {
    id: 'morning-drift',
    title: 'Morning Drift',
    artist: 'Portfolio Session',
    src: '/audio/morning-drift.wav',
  },
  {
    id: 'night-drive',
    title: 'Night Drive',
    artist: 'Portfolio Session',
    src: '/audio/night-drive.wav',
  },
  {
    id: 'glass-wave',
    title: 'Glass Wave',
    artist: 'Portfolio Session',
    src: '/audio/glass-wave.wav',
  },
];

const formatPlaybackTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  const remainingSeconds = wholeSeconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
};

const getStoredAppearanceMode = (): AppearanceMode => {
  if (typeof window === 'undefined') return 'Auto';
  try {
    const storedMode = window.localStorage.getItem(THEME_MODE_STORAGE_KEY);
    if (storedMode === 'Light' || storedMode === 'Dark' || storedMode === 'Auto') {
      return storedMode;
    }
  } catch {
    return 'Auto';
  }
  return 'Auto';
};

const resolveDarkMode = (mode: AppearanceMode): boolean => {
  if (mode === 'Dark') return true;
  if (mode === 'Light') return false;
  const hour = new Date().getHours();
  return hour < 6 || hour >= 18;
};

const getStoredNumber = (key: string, fallback: number, min: number, max: number): number => {
  if (typeof window === 'undefined') return fallback;
  try {
    const rawValue = window.localStorage.getItem(key);
    if (rawValue === null) return fallback;
    const parsedValue = Number.parseFloat(rawValue);
    if (!Number.isFinite(parsedValue)) return fallback;
    return Math.min(max, Math.max(min, parsedValue));
  } catch {
    return fallback;
  }
};

const getStoredBoolean = (key: string, fallback: boolean): boolean => {
  if (typeof window === 'undefined') return fallback;
  try {
    const rawValue = window.localStorage.getItem(key);
    if (rawValue === 'true') return true;
    if (rawValue === 'false') return false;
  } catch {
    return fallback;
  }
  return fallback;
};

const getStoredAccentColor = (): AccentColor => {
  if (typeof window === 'undefined') return 'blue';
  try {
    const rawValue = window.localStorage.getItem(ACCENT_COLOR_STORAGE_KEY);
    if (rawValue && ACCENT_COLOR_OPTIONS.includes(rawValue as AccentColor)) {
      return rawValue as AccentColor;
    }
  } catch {
    return 'blue';
  }
  return 'blue';
};

const getStoredWallpaper = (): string => {
  if (typeof window === 'undefined') return DEFAULT_WALLPAPER;
  try {
    const storedWallpaper = window.localStorage.getItem(WALLPAPER_STORAGE_KEY);
    if (storedWallpaper && storedWallpaper.trim()) return storedWallpaper;
  } catch {
    return DEFAULT_WALLPAPER;
  }
  return DEFAULT_WALLPAPER;
};

const getStoredWidgets = (): WidgetId[] => {
  if (typeof window === 'undefined') return DEFAULT_WIDGETS;
  try {
    const rawWidgets = window.localStorage.getItem(WIDGETS_STORAGE_KEY);
    if (!rawWidgets) return DEFAULT_WIDGETS;

    const parsed = JSON.parse(rawWidgets);
    if (!Array.isArray(parsed)) return DEFAULT_WIDGETS;

    const validWidgetIds = parsed.filter(
      (id): id is WidgetId => WIDGET_OPTIONS.some((option) => option.id === id)
    );
    const uniqueWidgetIds = Array.from(new Set(validWidgetIds));
    if (parsed.length === 0) return [];
    return uniqueWidgetIds.length > 0 ? uniqueWidgetIds : DEFAULT_WIDGETS;
  } catch {
    return DEFAULT_WIDGETS;
  }
};

const getStoredWidgetPositions = (): Record<WidgetId, { x: number; y: number }> => {
  if (typeof window === 'undefined') return DEFAULT_WIDGET_POSITIONS;
  try {
    const rawPositions = window.localStorage.getItem(WIDGET_POSITIONS_STORAGE_KEY);
    if (!rawPositions) return DEFAULT_WIDGET_POSITIONS;
    const parsed = JSON.parse(rawPositions) as Partial<Record<WidgetId, { x: number; y: number }>>;

    const nextPositions = { ...DEFAULT_WIDGET_POSITIONS };
    WIDGET_OPTIONS.forEach(({ id }) => {
      const position = parsed?.[id];
      if (position && Number.isFinite(position.x) && Number.isFinite(position.y)) {
        nextPositions[id] = { x: position.x, y: position.y };
      }
    });
    return nextPositions;
  } catch {
    return DEFAULT_WIDGET_POSITIONS;
  }
};

const INITIAL_WINDOWS: Record<WindowID, Omit<WindowState, 'zIndex' | 'position'>> = {
  about: {
    id: 'about',
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    title: 'About Me',
    icon: <img src={finderAppIcon} alt="Finder" className="block w-full h-full object-cover scale-110" />,
  },
  safari: {
    id: 'safari',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    title: 'Safari',
    icon: (
      <div className="w-full h-full rounded-[24%] relative overflow-hidden border border-white/35 bg-[radial-gradient(circle_at_32%_22%,rgba(255,255,255,0.95),rgba(255,255,255,0.2)_34%,transparent_45%),linear-gradient(155deg,#77dcff_0%,#0a84ff_56%,#0452cf_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] flex items-center justify-center">
        <div className="absolute inset-[12%] rounded-full border border-white/70 bg-white/12" />
        <Compass size={20} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]" />
      </div>
    ),
  },
  projects: {
    id: 'projects',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    title: 'Projects',
    icon: <img src={projectsAppIcon} alt="Projects" className="block w-full h-full object-cover scale-110" />,
  },
  skills: {
    id: 'skills',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    title: 'Skills',
    icon: <img src={skillsAppIcon} alt="Skills" className="block w-full h-full object-cover scale-110" />,
  },
  experience: {
    id: 'experience',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    title: 'Experience',
    icon: <img src={experienceAppIcon} alt="Experience" className="block w-full h-full object-cover scale-110" />,
  },
  contact: {
    id: 'contact',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    title: 'Contact',
    icon: <img src={contactAppIcon} alt="Contact" className="block w-full h-full object-cover scale-110" />,
  },
  terminal: {
    id: 'terminal',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    title: 'Terminal',
    icon: <img src={terminalAppIcon} alt="Terminal" className="block w-full h-full object-cover scale-110" />,
  },
  playground: {
    id: 'playground',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    title: 'sumit-portfolio',
    icon: <img src={vscodeAppIcon} alt="VS Code" className="block w-full h-full object-cover scale-110" />,
  },
  settings: {
    id: 'settings',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    title: 'System Settings',
    icon: <img src={settingAppIcon} alt="Settings" className="block w-full h-full object-cover scale-110" />,
  },
};

const PROJECTS: PortfolioProject[] = [
  {
    id: 'facial-attendance',
    title: 'Facial Attendance System',
    category: 'Computer Vision',
    status: 'Production',
    description: 'Web-based facial recognition attendance platform with real-time identity verification and secure role-based access.',
    tech: ['Python', 'Flask/Django', 'OpenCV', 'MongoDB/MySQL', 'REST API'],
    impact: 'Reduced manual attendance overhead with automated identity validation and role-based dashboards.',
    link: '#',
  },
  {
    id: 'weborbit-site',
    title: 'WebOrbit Company Website',
    category: 'Client Website',
    status: 'Live Build',
    description: 'Responsive company website with dynamic content and contact form API integration.',
    tech: ['React.js', 'Tailwind CSS', 'Node.js', 'Express.js'],
    impact: 'Improved lead capture flow and reduced update time with API-driven content sections.',
    link: '#',
  },
  {
    id: 'maps-data-scraper',
    title: 'Google Maps Data Scraper',
    category: 'Automation',
    status: 'Internal Tool',
    description: 'Automation tool to extract, validate, and structure Google Maps business data for downstream analysis.',
    tech: ['Node.js', 'Automation', 'Data Validation', 'MongoDB', 'JSON'],
    impact: 'Accelerated business data collection with validated outputs for analytics workflows.',
    link: '#',
  },
];

const SAFARI_FAVORITES: Array<{ id: string; title: string; subtitle: string; url: string }> = [
  { id: 'github', title: 'GitHub', subtitle: 'Code and repositories', url: 'https://github.com' },
  { id: 'linkedin', title: 'LinkedIn', subtitle: 'Professional profile', url: 'https://www.linkedin.com/in/sumit--gautam' },
  { id: 'mail', title: 'Email', subtitle: 'Start a conversation', url: 'mailto:Sumitgautam970@gmail.com' },
];

const LAUNCHPAD_CATEGORIES: LaunchpadCategory[] = [
  'Languages',
  'Frontend',
  'Backend',
  'Database',
  'Tools',
  'Auth',
];

const LAUNCHPAD_APPS: LaunchpadApp[] = [
  { id: 'javascript', name: 'JavaScript', icon: <img src={javascriptSkillIcon} alt="JavaScript" className="w-full h-full object-cover rounded-[22%]" />, category: 'Languages' },
  { id: 'typescript', name: 'TypeScript', icon: <img src={typescriptSkillIcon} alt="TypeScript" className="w-full h-full object-cover rounded-[22%]" />, category: 'Languages' },
  { id: 'python', name: 'Python', icon: <img src={pythonSkillIcon} alt="Python" className="w-full h-full object-cover rounded-[22%]" />, category: 'Languages' },
  { id: 'java', name: 'Java', icon: <img src={javaSkillIcon} alt="Java" className="w-full h-full object-cover rounded-[22%]" />, category: 'Languages' },
  { id: 'react', name: 'React.js', icon: <img src={reactSkillIcon} alt="React" className="w-full h-full object-cover rounded-[22%]" />, category: 'Frontend' },
  { id: 'redux', name: 'Redux', icon: '🌀', category: 'Frontend' },
  { id: 'tailwind', name: 'Tailwind CSS', icon: <img src={tailwindSkillIcon} alt="Tailwind CSS" className="w-full h-full object-cover rounded-[22%]" />, category: 'Frontend' },
  { id: 'html', name: 'HTML', icon: <img src={htmlSkillIcon} alt="HTML" className="w-full h-full object-cover rounded-[22%]" />, category: 'Frontend' },
  { id: 'css', name: 'CSS', icon: <img src={cssSkillIcon} alt="CSS" className="w-full h-full object-cover rounded-[22%]" />, category: 'Frontend' },
  { id: 'node', name: 'Node.js', icon: <img src={nodeSkillIcon} alt="Node.js" className="w-full h-full object-cover rounded-[22%]" />, category: 'Backend' },
  { id: 'express', name: 'Express.js', icon: <img src={expressSkillIcon} alt="Express.js" className="w-full h-full object-cover rounded-[22%]" />, category: 'Backend' },
  { id: 'restapi', name: 'REST API', icon: '🔌', category: 'Backend' },
  { id: 'mongodb', name: 'MongoDB', icon: <img src={mongodbSkillIcon} alt="MongoDB" className="w-full h-full object-cover rounded-[22%]" />, category: 'Database' },
  { id: 'mysql', name: 'MySQL', icon: <img src={mysqlSkillIcon} alt="MySQL" className="w-full h-full object-cover rounded-[22%]" />, category: 'Database' },
  { id: 'jwt', name: 'JWT Auth', icon: '🔐', category: 'Auth' },
  { id: 'git', name: 'Git', icon: <img src={gitSkillIcon} alt="Git" className="w-full h-full object-cover rounded-[22%]" />, category: 'Tools' },
  { id: 'github', name: 'GitHub', icon: <img src={githubSkillIcon} alt="GitHub" className="w-full h-full object-cover rounded-[22%]" />, category: 'Tools' },
  { id: 'postman', name: 'Postman', icon: <img src={postmanSkillIcon} alt="Postman" className="w-full h-full object-cover rounded-[22%]" />, category: 'Tools' },
  { id: 'vscode', name: 'VS Code', icon: <img src={vscodeAppIcon} alt="VS Code" className="w-full h-full object-cover rounded-[22%]" />, category: 'Tools' },
  { id: 'terminal', name: 'Terminal', icon: <img src={terminalAppIcon} alt="Terminal" className="w-full h-full object-cover rounded-[22%]" />, category: 'Tools' },
  { id: 'context-api', name: 'Context API', icon: '🧠', category: 'Tools' },
  { id: 'bootstrap', name: 'Bootstrap', icon: '🅱️', category: 'Frontend' },
  { id: 'mvc', name: 'MVC', icon: '🧱', category: 'Backend' },
  { id: 'token-auth', name: 'Token Auth', icon: '🪪', category: 'Auth' },
  { id: 'debugging', name: 'Debugging', icon: '🧪', category: 'Tools' },
  { id: 'deployment', name: 'Deployment', icon: '🚀', category: 'Tools' },
  { id: 'testing', name: 'Testing', icon: '✅', category: 'Tools' },
];

const EXPERIENCE = [
  {
    company: 'Appwars Technologies Pvt. Ltd. - Delhi',
    role: 'MERN Stack Trainer',
    period: 'Jun 2025 - Present',
    description: 'Delivered MERN training to 100+ learners, mentored full-stack projects, and taught JWT, middleware, REST APIs, and clean MVC practices.',
  },
  {
    company: 'Tanvika Software - Greater Noida, UP',
    role: 'Full Stack Developer Intern',
    period: 'Jun 2024 - Mar 2025',
    description: 'Built React/Node modules, designed REST APIs, implemented JWT auth, and handled MongoDB schema design with Mongoose-based CRUD operations.',
  },
];

const ABOUT_TABS: Array<{ id: AboutTabId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
];

const ABOUT_SKILL_TAGS = [
  'React',
  'TypeScript',
  'Node.js',
  'Express',
  'MongoDB',
  'MySQL',
  'REST APIs',
  'Tailwind CSS',
  'JWT',
  'Git',
];

const ABOUT_SKILL_BARS: Array<{ label: string; value: number }> = [
  { label: 'Frontend Engineering', value: 92 },
  { label: 'Backend APIs', value: 89 },
  { label: 'Database Design', value: 84 },
  { label: 'Dev Workflow', value: 87 },
];

const ABOUT_TECH_STACK: Array<{ name: string; icon: string }> = [
  { name: 'JavaScript', icon: javascriptSkillIcon },
  { name: 'TypeScript', icon: typescriptSkillIcon },
  { name: 'Python', icon: pythonSkillIcon },
  { name: 'Java', icon: javaSkillIcon },
  { name: 'React', icon: reactSkillIcon },
  { name: 'Node.js', icon: nodeSkillIcon },
  { name: 'Express', icon: expressSkillIcon },
  { name: 'HTML', icon: htmlSkillIcon },
  { name: 'CSS', icon: cssSkillIcon },
  { name: 'MongoDB', icon: mongodbSkillIcon },
  { name: 'MySQL', icon: mysqlSkillIcon },
  { name: 'Tailwind CSS', icon: tailwindSkillIcon },
  { name: 'Git', icon: gitSkillIcon },
  { name: 'GitHub', icon: githubSkillIcon },
  { name: 'Postman', icon: postmanSkillIcon },
  { name: 'VS Code', icon: vscodeAppIcon },
  { name: 'Terminal', icon: terminalAppIcon },
];

// --- Components ---

const AboutWindowContent = ({
  isDarkMode,
  activeTab,
  onTabChange,
}: {
  isDarkMode: boolean;
  activeTab: AboutTabId;
  onTabChange: (tab: AboutTabId) => void;
}) => {
  const renderTabPanel = () => {
    if (activeTab === 'skills') {
      return (
        <div className="space-y-7">
          <section className="space-y-4">
            <h2 className={`text-[28px] font-semibold tracking-[-0.02em] ${isDarkMode ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>Skills</h2>
            <p className={`text-[14px] leading-6 ${isDarkMode ? 'text-white/65' : 'text-black/55'}`}>
              Product-focused full stack execution with clean architecture, reliable APIs, and polished interface delivery.
            </p>
          </section>
          <section className={`space-y-4 border-t pt-6 ${isDarkMode ? 'border-white/10' : 'border-black/[0.08]'}`}>
            {ABOUT_SKILL_BARS.map((skill) => (
              <div key={skill.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className={`text-[13px] font-medium ${isDarkMode ? 'text-white/80' : 'text-black/70'}`}>{skill.label}</p>
                  <p className={`text-[11px] ${isDarkMode ? 'text-white/55' : 'text-black/45'}`}>{skill.value}%</p>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-black/[0.06]'}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.value}%` }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className={`h-full rounded-full ${isDarkMode ? 'bg-white/65' : 'bg-black/55'}`}
                  />
                </div>
              </div>
            ))}
          </section>
          <section className={`space-y-3 border-t pt-6 ${isDarkMode ? 'border-white/10' : 'border-black/[0.08]'}`}>
            <p className={`text-[12px] font-medium tracking-wide uppercase ${isDarkMode ? 'text-white/45' : 'text-black/40'}`}>Core Tools</p>
            <div className="flex flex-wrap gap-2.5">
              {ABOUT_SKILL_TAGS.map((skill) => (
                <span
                  key={skill}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-white/10 border border-white/15 text-white/85 hover:bg-white/15'
                      : 'bg-black/[0.045] border border-black/[0.08] text-black/70 hover:bg-black/[0.07]'
                  }`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        </div>
      );
    }

    if (activeTab === 'experience') {
      return (
        <div className="space-y-7">
          <section className="space-y-3">
            <h2 className={`text-[28px] font-semibold tracking-[-0.02em] ${isDarkMode ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>Experience</h2>
            <p className={`text-[14px] leading-6 ${isDarkMode ? 'text-white/65' : 'text-black/55'}`}>
              Building and teaching full-stack products with strong emphasis on practical architecture and maintainable code.
            </p>
          </section>
          <section className={`space-y-4 border-t pt-6 ${isDarkMode ? 'border-white/10' : 'border-black/[0.08]'}`}>
            {EXPERIENCE.map((item) => (
              <motion.article
                key={`${item.company}-${item.period}`}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className={`rounded-2xl border p-4 ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/45 border-black/[0.08]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className={`text-[16px] font-semibold ${isDarkMode ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>{item.role}</h3>
                    <p className={`text-[13px] mt-1 ${isDarkMode ? 'text-white/60' : 'text-black/55'}`}>{item.company}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${isDarkMode ? 'bg-white/10 text-white/70' : 'bg-black/[0.06] text-black/55'}`}>
                    {item.period}
                  </span>
                </div>
                <p className={`mt-3 text-[13px] leading-6 ${isDarkMode ? 'text-white/75' : 'text-black/65'}`}>{item.description}</p>
              </motion.article>
            ))}
          </section>
        </div>
      );
    }

    if (activeTab === 'education') {
      return (
        <div className="space-y-7">
          <section className="space-y-3">
            <h2 className={`text-[28px] font-semibold tracking-[-0.02em] ${isDarkMode ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>Education</h2>
            <p className={`text-[14px] leading-6 ${isDarkMode ? 'text-white/65' : 'text-black/55'}`}>
              Academic foundation in computer applications with applied project experience and strong software fundamentals.
            </p>
          </section>
          <section className={`space-y-4 border-t pt-6 ${isDarkMode ? 'border-white/10' : 'border-black/[0.08]'}`}>
            <article className={`rounded-2xl border p-5 ${
              isDarkMode
                ? 'bg-white/5 border-white/10'
                : 'bg-white/45 border-black/[0.08]'
            }`}>
              <h3 className={`text-[17px] font-semibold ${isDarkMode ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>Bachelor of Computer Applications (BCA)</h3>
              <p className={`mt-1 text-[13px] ${isDarkMode ? 'text-white/60' : 'text-black/55'}`}>CCS University</p>
              <div className={`mt-4 inline-flex rounded-full px-3 py-1 text-[11px] font-medium ${isDarkMode ? 'bg-white/10 text-white/70' : 'bg-black/[0.06] text-black/55'}`}>
                2021 - 2024
              </div>
              <p className={`mt-4 text-[13px] leading-6 ${isDarkMode ? 'text-white/75' : 'text-black/65'}`}>
                Focused on software engineering principles, data structures, database systems, and web development practices.
              </p>
            </article>
          </section>
        </div>
      );
    }

    return (
      <div className="space-y-7">
        <section className="space-y-3">
          <h1 className={`text-[34px] font-semibold tracking-[-0.03em] ${isDarkMode ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>Sumit Gautam</h1>
          <p className={`text-[15px] font-medium ${isDarkMode ? 'text-white/65' : 'text-black/55'}`}>Full Stack Developer</p>
          <p className={`text-[14px] leading-7 max-w-2xl ${isDarkMode ? 'text-white/75' : 'text-black/65'}`}>
            Full-stack engineer specialized in JavaScript and TypeScript ecosystems, building fast, reliable, and visually polished products with React, Node.js, Express, and MongoDB.
          </p>
        </section>

        <section className={`space-y-3 border-t pt-6 ${isDarkMode ? 'border-white/10' : 'border-black/[0.08]'}`}>
          <p className={`text-[12px] font-medium tracking-wide uppercase ${isDarkMode ? 'text-white/45' : 'text-black/40'}`}>Primary Skills</p>
          <div className="flex flex-wrap gap-2.5">
            {ABOUT_SKILL_TAGS.map((skill) => (
              <span
                key={skill}
                className={`rounded-full px-3 py-1.5 text-[12px] font-medium ${
                  isDarkMode
                    ? 'bg-white/10 border border-white/15 text-white/85'
                    : 'bg-black/[0.045] border border-black/[0.08] text-black/70'
                }`}
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        <section className={`space-y-4 border-t pt-6 ${isDarkMode ? 'border-white/10' : 'border-black/[0.08]'}`}>
          <p className={`text-[12px] font-medium tracking-wide uppercase ${isDarkMode ? 'text-white/45' : 'text-black/40'}`}>Tech Stack</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {ABOUT_TECH_STACK.map((tech) => (
              <motion.div
                key={tech.name}
                whileHover={{ y: -2, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className={`rounded-2xl border p-3 flex flex-col items-center justify-center gap-2 ${
                  isDarkMode
                    ? 'bg-white/10 border-white/10'
                    : 'bg-white/50 border-black/[0.08]'
                }`}
              >
                <img src={tech.icon} alt={tech.name} className="w-9 h-9 object-cover rounded-xl" />
                <span className={`text-[11px] font-medium text-center ${isDarkMode ? 'text-white/70' : 'text-black/60'}`}>{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    );
  };

  return (
    <div
      className="h-full"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", sans-serif',
      }}
    >
      <div className="grid h-full grid-cols-1 md:grid-cols-[250px_minmax(0,1fr)]">
        <aside className={`relative border-r p-5 md:p-6 ${
          isDarkMode
            ? 'bg-[#1c1c1e]/55 border-white/10 text-[#f5f5f7]'
            : 'bg-[#f5f5f7]/62 border-black/[0.08] text-[#1d1d1f]'
        }`}>
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/10 via-transparent to-transparent" />
          <div className="relative z-10 space-y-5">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                isDarkMode
                  ? 'bg-white/10 border-white/20'
                  : 'bg-white/70 border-white/80'
              }`}>
                <User size={26} className={isDarkMode ? 'text-white/85' : 'text-black/65'} />
              </div>
              <div>
                <p className={`text-[15px] font-semibold ${isDarkMode ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>Sumit Gautam</p>
                <p className={`text-[12px] ${isDarkMode ? 'text-white/55' : 'text-black/45'}`}>Full Stack Developer</p>
              </div>
            </div>

            <p className={`text-[12px] leading-5 ${isDarkMode ? 'text-white/60' : 'text-black/50'}`}>
              Crafting clean digital products with modern web stacks and production-grade engineering discipline.
            </p>

            <div className={`h-px ${isDarkMode ? 'bg-white/10' : 'bg-black/[0.08]'}`} />

            <nav className="space-y-1.5">
              {ABOUT_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    type="button"
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.18 }}
                    onClick={() => onTabChange(tab.id)}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-left text-[13px] font-medium transition-all ${
                      isActive
                        ? (isDarkMode
                          ? 'bg-white/14 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]'
                          : 'bg-black/[0.07] text-black/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]')
                        : (isDarkMode
                          ? 'text-white/65 hover:bg-white/8 hover:text-white/90'
                          : 'text-black/60 hover:bg-black/[0.045] hover:text-black/85')
                    }`}
                  >
                    {tab.label}
                  </motion.button>
                );
              })}
            </nav>
          </div>
        </aside>

        <section className={`relative min-w-0 p-5 md:p-7 ${
          isDarkMode ? 'bg-[#1c1c1e]/42' : 'bg-white/48'
        }`}>
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/12 via-transparent to-transparent" />
          <div className="relative z-10 h-full overflow-y-auto pr-1 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                {renderTabPanel()}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
};

interface WindowProps {
  key?: React.Key;
  win: WindowState;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  isDarkMode: boolean;
  children: React.ReactNode;
}

const Window = ({ 
  win, 
  onClose, 
  onMinimize, 
  onMaximize, 
  onFocus, 
  isDarkMode,
  children 
}: WindowProps) => {
  const [pos, setPos] = useState(win.position);
  const [isDragging, setIsDragging] = useState(false);
  const isFramelessSkills = win.id === 'skills';
  const isAboutWindow = win.id === 'about';
  const isSafariWindow = win.id === 'safari';
  const isGlassWindow = isAboutWindow || isSafariWindow;
  const isPlaygroundWindow = win.id === 'playground';
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    onFocus();
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || win.isMaximized) return;
      setPos({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, win.isMaximized]);

  return (
    <motion.div
      data-no-desktop-context-menu
      initial={{ scale: isGlassWindow ? 0.95 : 0.8, opacity: 0 }}
      animate={{ 
        scale: win.isMinimized ? 0.5 : 1, 
        opacity: win.isMinimized ? 0 : 1,
        x: win.isMaximized ? 0 : isFramelessSkills ? '-50%' : pos.x,
        y: win.isMaximized ? 0 : isFramelessSkills ? '-50%' : pos.y,
        width: win.isMaximized ? '100%' : (
          win.id === 'about'
            ? '920px'
            : win.id === 'safari'
              ? '980px'
            : win.id === 'playground'
              ? '940px'
              : win.id === 'skills'
                ? '860px'
                : win.id === 'settings'
                  ? '940px'
                  : '600px'
        ),
        height: win.isMaximized ? 'calc(100vh - 28px - 80px)' : (
          win.id === 'about'
            ? '560px'
            : win.id === 'safari'
              ? '620px'
            : win.id === 'playground'
              ? '600px'
              : win.id === 'skills'
                ? '560px'
                : win.id === 'settings'
                  ? '620px'
                  : '450px'
        ),
        top: win.isMaximized ? '28px' : isFramelessSkills ? '50%' : '0',
        left: win.isMaximized ? '0' : isFramelessSkills ? '50%' : '0',
      }}
      exit={{ scale: isGlassWindow ? 0.95 : 0.8, opacity: 0 }}
      transition={isDragging ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 300 }}
      className={`flex flex-col ${
        isFramelessSkills
          ? 'bg-transparent border-0 shadow-none rounded-none overflow-visible'
          : isGlassWindow
            ? `${
                isDarkMode
                  ? 'bg-[rgba(28,28,30,0.62)] border-white/10'
                  : 'bg-[rgba(245,245,247,0.64)] border-white/40'
              } rounded-[20px] border overflow-hidden shadow-[0_22px_52px_-32px_rgba(15,23,42,0.55),0_10px_22px_-16px_rgba(15,23,42,0.4)]`
            : isPlaygroundWindow
              ? 'bg-[rgba(30,30,30,0.75)] rounded-[16px] border border-white/12 overflow-hidden shadow-[0_28px_65px_-28px_rgba(0,0,0,0.8),0_12px_24px_-12px_rgba(0,0,0,0.55)]'
            : `${isDarkMode ? 'bg-zinc-900/40' : 'bg-white/40'} backdrop-blur-3xl rounded-[28px] shadow-2xl border border-white/20 overflow-hidden`
      } ${isDragging ? 'cursor-grabbing shadow-3xl' : ''}`}
      style={{
        zIndex: win.zIndex,
        position: 'absolute',
        willChange: 'transform, width, height',
        ...(isGlassWindow ? { backdropFilter: 'blur(30px)' } : {}),
        ...(isPlaygroundWindow ? { backdropFilter: 'blur(20px)' } : {}),
      }}
      onClick={onFocus}
    >
      {!isFramelessSkills && (
        <>
          {/* Reflection Overlay */}
          <div
            className={`absolute inset-0 pointer-events-none ${
              isAboutWindow
                ? (isDarkMode
                  ? 'bg-gradient-to-br from-white/14 via-white/[0.02] to-transparent'
                  : 'bg-gradient-to-br from-white/55 via-white/10 to-transparent')
                : isPlaygroundWindow
                  ? 'bg-gradient-to-br from-white/12 via-white/[0.02] to-transparent'
                : 'bg-gradient-to-br from-white/10 to-transparent opacity-50'
            }`}
          />
          {isGlassWindow && (
            <div className={`absolute inset-[1px] rounded-[19px] pointer-events-none border ${isDarkMode ? 'border-white/12' : 'border-white/55'}`} />
          )}
          {isPlaygroundWindow && (
            <div className="absolute inset-[1px] rounded-[15px] pointer-events-none border border-white/10" />
          )}
          
          {/* Title Bar */}
          <div 
            className={`h-11 flex items-center px-4 select-none cursor-grab active:cursor-grabbing border-b ${
              isAboutWindow
                ? (isDarkMode
                  ? 'bg-white/[0.04] border-white/10'
                  : 'bg-white/35 border-black/[0.07]')
                : isPlaygroundWindow
                  ? 'bg-[rgba(56,56,56,0.45)] border-white/10 backdrop-blur-[18px]'
                : 'bg-white/20 border-black/5'
            }`}
            onMouseDown={handleMouseDown}
          >
            <div className="flex gap-2 window-controls">
              <button 
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/10 hover:brightness-90 transition-all flex items-center justify-center group"
              >
                <span className="text-[8px] opacity-0 group-hover:opacity-100 text-black/60">×</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onMinimize(); }}
                className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/10 hover:brightness-90 transition-all flex items-center justify-center group"
              >
                <span className="text-[8px] opacity-0 group-hover:opacity-100 text-black/60">−</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onMaximize(); }}
                className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/10 hover:brightness-90 transition-all flex items-center justify-center group"
              >
                <span className="text-[8px] opacity-0 group-hover:opacity-100 text-black/60">+</span>
              </button>
            </div>
            <div className={`flex-1 text-center text-sm font-medium ${
              isGlassWindow
                ? (isDarkMode ? 'text-white/80' : 'text-black/65')
                : isPlaygroundWindow
                  ? 'text-[#d4d4d4]'
                : 'text-black/70'
            }`}>
              {win.title}
            </div>
            <div className="w-12" /> {/* Spacer to balance controls */}
          </div>
        </>
      )}

      {/* Content */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar ${['terminal', 'playground', 'settings', 'skills', 'about', 'safari'].includes(win.id) ? 'p-0' : 'p-6'}`}>
        {children}
      </div>
    </motion.div>
  );
};

interface DockIconProps {
  key?: React.Key;
  win: Omit<WindowState, 'zIndex' | 'position'>;
  onClick: () => void;
  isActive: boolean;
  mouseX: any;
  currentAccent: { bg: string };
  dockSize: number;
  dockMagnification: number;
}

const DockIcon = ({ 
  win, 
  onClick, 
  isActive,
  mouseX,
  currentAccent,
  dockSize,
  dockMagnification
}: DockIconProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [isBouncing, setIsBouncing] = useState(false);
  const isFullIconApp = ['about', 'safari', 'projects', 'skills', 'experience', 'contact', 'terminal', 'playground', 'settings', 'trash'].includes(String(win.id));

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - (bounds.x + bounds.width / 2);
  });

  const widthSync = useTransform(distance, (d) => {
    const scale = 1 + (dockMagnification - 1) * Math.exp(-Math.pow(d / 80, 2));
    return dockSize * scale;
  });

  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const ySync = useTransform(width, [dockSize, dockSize * dockMagnification], [0, -(dockSize * (dockMagnification - 1)) / 2]);
  const y = useSpring(ySync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const handleIconClick = () => {
    setIsBouncing(true);
    onClick();
    setTimeout(() => setIsBouncing(false), 600);
  };

  return (
    <motion.div 
      style={{ width }} 
      className="relative group flex flex-col items-center justify-end"
    >
      <motion.button
        ref={ref}
        style={{ width, height: width, y }}
        animate={isBouncing ? { y: [0, -40, 0] } : {}}
        transition={isBouncing ? { duration: 0.6, times: [0, 0.5, 1], ease: "easeInOut" } : {}}
        whileTap={{ scale: 0.9 }}
        onClick={handleIconClick}
        className={`rounded-2xl flex items-center justify-center text-black/70 transition-colors origin-bottom ${
          isFullIconApp
            ? 'bg-transparent border-transparent shadow-none overflow-hidden'
            : 'bg-white/40 backdrop-blur-md border border-white/30 shadow-lg hover:bg-white/60'
        }`}
      >
        <div className={`${isFullIconApp ? 'w-full h-full' : 'w-[60%] h-[60%]'} flex items-center justify-center`}>
          {win.icon}
        </div>
      </motion.button>
      {isActive && (
        <motion.div 
          style={{ y }}
          className={`absolute -bottom-2 w-1.5 h-1.5 ${currentAccent.bg} rounded-full shadow-sm`} 
        />
      )}
      <div className="absolute -top-14 px-3 py-1.5 bg-black/80 backdrop-blur-md text-white text-[11px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap pointer-events-none shadow-2xl border border-white/10">
        {win.title}
      </div>
    </motion.div>
  );
};

const DesktopContextMenu = ({
  position,
  isDarkMode,
  useStacks,
  onAction,
  onClose,
}: {
  position: { x: number; y: number };
  isDarkMode: boolean;
  useStacks: boolean;
  onAction: (action: DesktopContextMenuAction) => void;
  onClose: () => void;
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState(position);

  useEffect(() => {
    setMenuPosition(position);
    const rafId = window.requestAnimationFrame(() => {
      const menuRect = menuRef.current?.getBoundingClientRect();
      if (!menuRect) return;

      const padding = 12;
      let nextX = position.x;
      let nextY = position.y;
      if (nextX + menuRect.width + padding > window.innerWidth) {
        nextX = window.innerWidth - menuRect.width - padding;
      }
      if (nextY + menuRect.height + padding > window.innerHeight) {
        nextY = window.innerHeight - menuRect.height - padding;
      }
      setMenuPosition({
        x: Math.max(padding, nextX),
        y: Math.max(34, nextY),
      });
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [position]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const menuGroups: Array<Array<{ id: DesktopContextMenuAction; label: string; hasSubmenu?: boolean; checked?: boolean }>> = [
    [
      { id: 'new-folder', label: 'New Folder' },
      { id: 'get-info', label: 'Get Info' },
    ],
    [
      { id: 'change-wallpaper', label: 'Change Wallpaper' },
      { id: 'edit-widgets', label: 'Edit Widgets' },
    ],
    [
      { id: 'use-stacks', label: 'Use Stacks', checked: useStacks },
      { id: 'sort-by', label: 'Sort By', hasSubmenu: true },
      { id: 'clean-up', label: 'Clean Up' },
      { id: 'clean-up-by', label: 'Clean Up By', hasSubmenu: true },
    ],
    [
      { id: 'show-view-options', label: 'Show View Options' },
    ],
  ];

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      style={{
        left: menuPosition.x,
        top: menuPosition.y,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
      }}
      onClick={(e) => e.stopPropagation()}
      className={`fixed w-60 rounded-[16px] border p-1.5 backdrop-blur-[20px] shadow-[0_18px_44px_rgba(0,0,0,0.22),0_3px_14px_rgba(0,0,0,0.12)] origin-top-left z-[12000] ${
        isDarkMode
          ? 'bg-[rgba(24,24,27,0.62)] border-white/10 text-zinc-100'
          : 'bg-[rgba(255,255,255,0.6)] border-white/70 text-zinc-800'
      }`}
    >
      {menuGroups.map((group, groupIndex) => (
        <div key={groupIndex}>
          {group.map((item) => (
            <button
              key={item.id}
              onClick={() => onAction(item.id)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[10px] text-[13px] cursor-pointer transition-colors ${
                isDarkMode ? 'hover:bg-[rgba(255,255,255,0.14)]' : 'hover:bg-[rgba(0,0,0,0.08)]'
              }`}
            >
              <span className="w-4 h-4 flex items-center justify-center">
                {item.checked ? <Check size={12} /> : null}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.hasSubmenu ? <ChevronRight size={14} className={isDarkMode ? 'text-white/70' : 'text-black/40'} /> : null}
            </button>
          ))}
          {groupIndex !== menuGroups.length - 1 && (
            <div className={`mx-2 my-1 h-px ${isDarkMode ? 'bg-white/12' : 'bg-black/10'}`} />
          )}
        </div>
      ))}
    </motion.div>
  );
};

const SettingsContent = (props: React.ComponentProps<typeof SystemSettings>) => <SystemSettings {...props} />;

const LaunchpadSkills = ({
  isDarkMode,
  onClose,
  onMinimize,
  onMaximize,
}: {
  isDarkMode: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<LaunchpadCategory | null>(null);
  const [jiggleMode, setJiggleMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const [activePressId, setActivePressId] = useState<string | null>(null);
  const [isHeadingHover, setIsHeadingHover] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [gridAnimationKey, setGridAnimationKey] = useState(0);
  const [columns, setColumns] = useState(7);
  const gridRef = useRef<HTMLDivElement>(null);
  const longPressTimeoutRef = useRef<number | null>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const isSearchVisible = isHeadingHover || isSearchFocused || query.length > 0;

  useEffect(() => {
    setOpenFolderId(null);
    setGridAnimationKey((prev) => prev + 1);
  }, [normalizedQuery, activeCategory]);

  useEffect(() => {
    const node = gridRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      const nextColumns = width < 640 ? 3 : width < 760 ? 4 : 6;
      setColumns(nextColumns);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const clearLongPress = useCallback(() => {
    if (longPressTimeoutRef.current !== null) {
      window.clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => () => clearLongPress(), [clearLongPress]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenFolderId(null);
        setJiggleMode(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const triggerPressAnimation = useCallback((appId: string) => {
    setActivePressId(appId);
    window.setTimeout(() => {
      setActivePressId((prev) => (prev === appId ? null : prev));
    }, 380);
  }, []);

  const beginLongPress = useCallback((appId: string) => {
    clearLongPress();
    longPressTimeoutRef.current = window.setTimeout(() => {
      setJiggleMode(true);
      triggerPressAnimation(appId);
    }, 450);
  }, [clearLongPress, triggerPressAnimation]);

  const visibleApps = useMemo(() => {
    return LAUNCHPAD_APPS.filter((app) => {
      if (activeCategory && app.category !== activeCategory) return false;
      if (!normalizedQuery) return true;
      if (app.name.toLowerCase().includes(normalizedQuery)) return true;
      if (app.type !== 'folder') return false;
      return app.children?.some((child) => child.name.toLowerCase().includes(normalizedQuery)) ?? false;
    });
  }, [activeCategory, normalizedQuery]);

  const appRows = useMemo(() => {
    const rows: LaunchpadApp[][] = [];
    for (let index = 0; index < visibleApps.length; index += columns) {
      rows.push(visibleApps.slice(index, index + columns));
    }
    return rows;
  }, [visibleApps, columns]);

  const openFolder = visibleApps.find((app) => app.type === 'folder' && app.id === openFolderId);

  const renderEmojiOrIcon = (icon: React.ReactNode, emojiClassName: string) => {
    if (typeof icon === 'string') {
      return <span className={emojiClassName}>{icon}</span>;
    }
    return <span className="relative z-[1] w-full h-full">{icon}</span>;
  };

  const renderIconFace = (app: LaunchpadApp) => {
    if (app.type === 'folder') {
      const folderPreview = app.children?.slice(0, 4) ?? [];
      return (
        <span className="grid w-full h-full grid-cols-2 gap-1 p-2.5">
          {folderPreview.map((child) => (
            <span
              key={child.id}
              className="rounded-[8px] bg-white/45 border border-white/30 flex items-center justify-center"
            >
              {renderEmojiOrIcon(child.icon, 'text-sm leading-none')}
            </span>
          ))}
        </span>
      );
    }
    return renderEmojiOrIcon(app.icon, 'relative z-[1] leading-none text-[44px]');
  };

  const renderListIcon = (app: LaunchpadApp) => {
    if (app.type === 'folder') {
      const folderPreview = app.children?.slice(0, 4) ?? [];
      return (
        <span className="grid w-full h-full grid-cols-2 gap-0.5 p-1.5">
          {folderPreview.map((child) => (
            <span key={child.id} className="rounded-[5px] bg-white/45 border border-white/30 flex items-center justify-center">
              {renderEmojiOrIcon(child.icon, 'text-[9px] leading-none')}
            </span>
          ))}
        </span>
      );
    }
    return renderEmojiOrIcon(app.icon, 'relative z-[1] leading-none text-[22px]');
  };

  return (
    <div className="h-full w-full launchpad-sf select-none" onClick={() => setOpenFolderId(null)}>
      <div
        onClick={(event) => event.stopPropagation()}
        className={`h-full w-full rounded-[34px] border shadow-[0_22px_50px_rgba(20,24,36,0.22)] backdrop-blur-[22px] overflow-hidden flex flex-col ${
          isDarkMode
            ? 'bg-[rgba(34,37,47,0.72)] border-white/20 text-zinc-100'
            : 'bg-[rgba(247,247,249,0.76)] border-white/70 text-zinc-700'
        }`}
      >
        <div className={`px-5 sm:px-7 pt-5 pb-4 border-b ${isDarkMode ? 'border-white/15' : 'border-black/10'}`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="w-3.5 h-3.5 rounded-full bg-[#ff5f57] border border-black/15 hover:brightness-95 transition-colors"
                aria-label="Close skills panel"
              />
              <button
                onClick={onMinimize}
                className="w-3.5 h-3.5 rounded-full bg-[#febc2e] border border-black/15 hover:brightness-95 transition-colors"
                aria-label="Minimize skills panel"
              />
              <button
                onClick={onMaximize}
                className="w-3.5 h-3.5 rounded-full bg-[#28c840] border border-black/15 hover:brightness-95 transition-colors"
                aria-label="Maximize skills panel"
              />
            </div>
            <div
              className="ml-1 flex items-center gap-3 flex-1 min-w-0"
              onMouseEnter={() => setIsHeadingHover(true)}
              onMouseLeave={() => setIsHeadingHover(false)}
            >
              <h3 className={`text-[46px] leading-none font-semibold tracking-tight shrink-0 ${isDarkMode ? 'text-white/92' : 'text-zinc-600'}`}>
                Skills
              </h3>
              <div
                className={`overflow-hidden transition-all duration-300 ${isSearchVisible ? 'flex-1 opacity-100 max-w-full' : 'max-w-0 opacity-0 pointer-events-none'}`}
              >
                <div
                  className={`rounded-full border px-3 py-1.5 w-full ${
                    isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white/70 border-black/10'
                  }`}
                >
                  <label className="flex items-center gap-2">
                    <Search size={14} className={isDarkMode ? 'text-white/75' : 'text-zinc-500'} />
                    <input
                      value={query}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search skills"
                      className={`w-full bg-transparent text-sm font-semibold tracking-tight outline-none ${
                        isDarkMode ? 'text-white placeholder:text-white/70' : 'text-zinc-700 placeholder:text-zinc-500'
                      }`}
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className={`inline-flex rounded-full border p-0.5 ${isDarkMode ? 'bg-white/10 border-white/20' : 'bg-white/65 border-black/10'}`}>
              <button
                onClick={() => {
                  setViewMode('grid');
                  setJiggleMode(false);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                  viewMode === 'grid'
                    ? (isDarkMode ? 'bg-white/25 text-white' : 'bg-white text-zinc-700')
                    : (isDarkMode ? 'text-white/75 hover:bg-white/15' : 'text-zinc-600 hover:bg-white/80')
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => {
                  setViewMode('list');
                  setJiggleMode(false);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                  viewMode === 'list'
                    ? (isDarkMode ? 'bg-white/25 text-white' : 'bg-white text-zinc-700')
                    : (isDarkMode ? 'text-white/75 hover:bg-white/15' : 'text-zinc-600 hover:bg-white/80')
                }`}
              >
                List
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {LAUNCHPAD_CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory((prev) => (prev === category ? null : category))}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? (isDarkMode ? 'bg-white/22 text-white' : 'bg-zinc-300/70 text-zinc-700')
                      : (isDarkMode ? 'bg-white/10 text-white/75 hover:bg-white/16' : 'bg-zinc-200/65 text-zinc-500 hover:bg-zinc-200/90')
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div ref={gridRef} className="flex-1 overflow-y-auto custom-scrollbar px-5 sm:px-6 pb-6 pt-3 flex">
          <div className="w-full max-w-[900px] mx-auto flex flex-col justify-start">
            {appRows.length === 0 ? (
              <div className={`h-full flex items-center justify-center text-sm ${isDarkMode ? 'text-white/70' : 'text-zinc-500'}`}>
                No applications found.
              </div>
            ) : viewMode === 'grid' ? (
              appRows.map((row, rowIndex) => (
                <div
                  key={`apps-row-${rowIndex}`}
                  className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-x-3 sm:gap-x-6 gap-y-4 py-5 justify-items-center ${
                    rowIndex === 0 ? '' : (isDarkMode ? 'border-t border-white/12' : 'border-t border-black/8')
                  }`}
                >
                  {row.map((app, colIndex) => {
                    const appIndex = rowIndex * columns + colIndex;
                    const isImageIcon = typeof app.icon !== 'string' && app.type !== 'folder';
                    const iconStyles = {
                      ['--launchpad-delay' as string]: `${appIndex * 36}ms`,
                      ['--jiggle-delay' as string]: `${(appIndex % 7) * 0.045}s`,
                    } as React.CSSProperties;

                    return (
                      <button
                        key={app.id}
                        type="button"
                        style={iconStyles}
                        className="launchpad-icon-tile group flex flex-col items-center gap-2 cursor-pointer"
                        onClick={() => {
                          triggerPressAnimation(app.id);
                          if (app.type === 'folder') {
                            setOpenFolderId((prev) => (prev === app.id ? null : app.id));
                          }
                        }}
                        onDoubleClick={() => setJiggleMode(true)}
                        onMouseDown={() => beginLongPress(app.id)}
                        onMouseUp={clearLongPress}
                        onMouseLeave={clearLongPress}
                        onTouchStart={() => beginLongPress(app.id)}
                        onTouchEnd={clearLongPress}
                        onTouchCancel={clearLongPress}
                      >
                        <span className={`relative block ${jiggleMode ? 'launchpad-jiggle' : ''}`} style={iconStyles}>
                          {jiggleMode ? (
                            <span className={`absolute -top-1.5 -left-1.5 z-20 w-5 h-5 rounded-full text-[10px] flex items-center justify-center shadow-lg ${
                              isDarkMode ? 'bg-black/70 border border-white/45 text-white' : 'bg-zinc-700 border border-white/70 text-white'
                            }`}>
                              ✕
                            </span>
                          ) : null}
                          <span className={`launchpad-icon-shell relative flex items-center justify-center overflow-hidden rounded-[22%] border ${
                            isImageIcon
                              ? 'border-transparent bg-transparent shadow-none'
                              : isDarkMode
                                ? 'border-white/24 bg-gradient-to-br from-white/30 via-white/14 to-black/24'
                                : 'border-black/12 bg-gradient-to-br from-white via-zinc-100/90 to-zinc-200/55'
                          }`}>
                            <span
                              className={`launchpad-icon-core absolute inset-0 flex items-center justify-center ${
                                activePressId === app.id ? 'launchpad-icon-bounce' : ''
                              }`}
                            >
                              {renderIconFace(app)}
                              {!isImageIcon ? (
                                <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/45 via-white/18 to-transparent" />
                              ) : null}
                            </span>
                          </span>
                        </span>
                        <span className={`text-[12px] text-center font-medium max-w-[102px] truncate ${
                          isDarkMode ? 'text-white/92' : 'text-zinc-700'
                        }`}>
                          {app.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="space-y-2 py-3">
                {visibleApps.map((app, index) => {
                  const isImageIcon = typeof app.icon !== 'string' && app.type !== 'folder';
                  const iconStyles = {
                    ['--launchpad-delay' as string]: `${index * 20}ms`,
                    ['--jiggle-delay' as string]: `${(index % 7) * 0.045}s`,
                  } as React.CSSProperties;

                  return (
                    <button
                      key={`list-${app.id}`}
                      type="button"
                      style={iconStyles}
                      className={`launchpad-icon-tile w-full rounded-xl border px-3 py-2 flex items-center gap-3 text-left ${
                        isDarkMode ? 'bg-white/5 border-white/12' : 'bg-white/60 border-black/10'
                      }`}
                      onClick={() => {
                        triggerPressAnimation(app.id);
                        if (app.type === 'folder') {
                          setOpenFolderId((prev) => (prev === app.id ? null : app.id));
                        }
                      }}
                      onDoubleClick={() => setJiggleMode(true)}
                      onMouseDown={() => beginLongPress(app.id)}
                      onMouseUp={clearLongPress}
                      onMouseLeave={clearLongPress}
                      onTouchStart={() => beginLongPress(app.id)}
                      onTouchEnd={clearLongPress}
                      onTouchCancel={clearLongPress}
                    >
                      <span className={`relative shrink-0 w-11 h-11 ${jiggleMode ? 'launchpad-jiggle' : ''}`} style={iconStyles}>
                        {jiggleMode ? (
                          <span className={`absolute -top-1.5 -left-1.5 z-20 w-[18px] h-[18px] rounded-full text-[9px] flex items-center justify-center shadow-lg ${
                            isDarkMode ? 'bg-black/70 border border-white/45 text-white' : 'bg-zinc-700 border border-white/70 text-white'
                          }`}>
                            ✕
                          </span>
                        ) : null}
                        <span className={`w-full h-full rounded-[22%] border overflow-hidden flex items-center justify-center ${
                          isImageIcon
                            ? 'border-transparent bg-transparent'
                            : isDarkMode
                              ? 'border-white/24 bg-gradient-to-br from-white/30 via-white/14 to-black/24'
                              : 'border-black/12 bg-gradient-to-br from-white via-zinc-100/90 to-zinc-200/55'
                        }`}>
                          <span className={`launchpad-icon-core absolute inset-0 flex items-center justify-center ${
                            activePressId === app.id ? 'launchpad-icon-bounce' : ''
                          }`}>
                            {renderListIcon(app)}
                          </span>
                        </span>
                      </span>
                      <span className={`flex-1 text-sm font-semibold truncate ${isDarkMode ? 'text-white/92' : 'text-zinc-700'}`}>
                        {app.name}
                      </span>
                      <span className={`text-[10px] uppercase tracking-wide ${isDarkMode ? 'text-white/55' : 'text-zinc-400'}`}>
                        {app.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {openFolder && openFolder.type === 'folder' && (openFolder.children?.length ?? 0) > 0 ? (
              <div className={`mt-2 rounded-[24px] border p-4 backdrop-blur-xl ${
                isDarkMode ? 'bg-white/10 border-white/18' : 'bg-white/70 border-black/10'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-white/95' : 'text-zinc-700'}`}>{openFolder.name}</h4>
                  <button
                    onClick={() => setOpenFolderId(null)}
                    className={`text-xs px-2.5 py-1 rounded-full border ${
                      isDarkMode ? 'bg-white/10 border-white/20 text-white/90' : 'bg-white border-black/10 text-zinc-600'
                    }`}
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                  {openFolder.children?.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      className="group flex flex-col items-center gap-1.5"
                      onClick={() => triggerPressAnimation(child.id)}
                    >
                      <span className={`relative flex items-center justify-center w-11 h-11 rounded-[24%] border overflow-hidden ${
                        isDarkMode
                          ? 'border-white/20 bg-gradient-to-br from-white/28 via-white/12 to-black/24'
                          : 'border-black/10 bg-gradient-to-br from-white to-zinc-100'
                      }`}>
                        {renderEmojiOrIcon(child.icon, 'text-lg leading-none')}
                        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/45 to-transparent rounded-t-[24%]" />
                      </span>
                      <span className={`text-[11px] text-center max-w-[72px] truncate ${
                        isDarkMode ? 'text-white/90' : 'text-zinc-600'
                      }`}>
                        {child.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const PlaygroundContent = ({ runSignal }: { runSignal: number }) => {
  type PlaygroundActivity = 'explorer' | 'search' | 'source' | 'run' | 'extensions' | 'settings';
  type PlaygroundLanguage = 'javascript' | 'json' | 'markdown';
  type PlaygroundFile = {
    id: string;
    label: string;
    language: PlaygroundLanguage;
    folder: 'src' | '.vscode' | 'root';
  };

  const explorerFiles: PlaygroundFile[] = useMemo(() => [
    { id: 'src/playground.js', label: 'playground.js', language: 'javascript', folder: 'src' },
    { id: 'src/utils.js', label: 'utils.js', language: 'javascript', folder: 'src' },
    { id: 'src/server.js', label: 'server.js', language: 'javascript', folder: 'src' },
    { id: '.vscode/settings.json', label: 'settings.json', language: 'json', folder: '.vscode' },
    { id: 'README.md', label: 'README.md', language: 'markdown', folder: 'root' },
  ], []);

  const fileById = useMemo(
    () => Object.fromEntries(explorerFiles.map((file) => [file.id, file] as const)),
    [explorerFiles]
  );

  const [fileContents, setFileContents] = useState<Record<string, string>>({
    'src/playground.js': `const message = "Hello from Sonoma VS Code Playground!";\nconsole.log(message);\n\nfunction greet(name) {\n  return \`Welcome, \${name}!\`;\n}\n\nconsole.log(greet("Visitor"));\n`,
    'src/utils.js': `export function formatDate(date) {\n  return new Intl.DateTimeFormat("en-US", {\n    dateStyle: "medium",\n    timeStyle: "short",\n  }).format(date);\n}\n`,
    'src/server.js': `const express = require("express");\nconst app = express();\n\napp.get("/health", (_, res) => {\n  res.json({ status: "ok" });\n});\n\napp.listen(3000);\n`,
    '.vscode/settings.json': `{\n  "editor.fontFamily": "Fira Code",\n  "editor.fontLigatures": true,\n  "editor.tabSize": 2,\n  "files.autoSave": "afterDelay"\n}\n`,
    'README.md': `# sumit-portfolio\n\nModern macOS Sonoma inspired VS Code playground.\n\n- Glassmorphism shell\n- VS Code dark editor\n- Interactive file explorer\n`,
  });
  const [openTabs, setOpenTabs] = useState<string[]>(['src/playground.js', 'src/utils.js']);
  const [activeFileId, setActiveFileId] = useState('src/playground.js');
  const [output, setOutput] = useState<string[]>([]);
  const [activeActivity, setActiveActivity] = useState<PlaygroundActivity>('explorer');
  const [activeBottomTab, setActiveBottomTab] = useState<'output' | 'problems'>('output');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isSrcExpanded, setIsSrcExpanded] = useState(true);
  const [isVSCodeExpanded, setIsVSCodeExpanded] = useState(true);
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const lineGutterRef = useRef<HTMLDivElement>(null);

  const activeFile = fileById[activeFileId] ?? explorerFiles[0];
  const currentCode = fileContents[activeFile.id] ?? '';

  useEffect(() => {
    Prism.highlightAll();
  }, [currentCode, output, activeFile.id, activeBottomTab]);

  const lineNumbers = useMemo(() => {
    const total = Math.max(1, currentCode.split('\n').length);
    return Array.from({ length: total }, (_, index) => index + 1);
  }, [currentCode]);

  const languageClass = useMemo(() => {
    if (activeFile.language === 'json') return 'language-json';
    if (activeFile.language === 'markdown') return 'language-markdown';
    return 'language-javascript';
  }, [activeFile.language]);

  const syncCursor = useCallback(() => {
    const node = editorRef.current;
    if (!node) return;
    const selectedText = node.value.slice(0, node.selectionStart);
    const line = selectedText.split('\n').length;
    const column = selectedText.length - selectedText.lastIndexOf('\n');
    setCursor({ line, column });
  }, []);

  const openFile = useCallback((fileId: string) => {
    setOpenTabs((prev) => (prev.includes(fileId) ? prev : [...prev, fileId]));
    setActiveFileId(fileId);
  }, []);

  const closeTab = useCallback((fileId: string) => {
    setOpenTabs((prev) => {
      if (prev.length === 1) return prev;
      const next = prev.filter((id) => id !== fileId);
      if (fileId === activeFileId) {
        setActiveFileId(next[next.length - 1] ?? explorerFiles[0].id);
      }
      return next;
    });
  }, [activeFileId, explorerFiles]);

  const runCode = useCallback(() => {
    if (activeFile.language !== 'javascript') {
      setOutput([`Cannot run "${activeFile.label}". Open a JavaScript file to execute code.`]);
      setActiveBottomTab('output');
      return;
    }

    const logs: string[] = [];
    const originalLog = console.log;

    console.log = (...args) => {
      logs.push(args.map((arg) =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
      originalLog(...args);
    };

    try {
      // eslint-disable-next-line no-eval
      eval(currentCode);
      setOutput(logs.length > 0 ? logs : ['Code executed successfully (no output).']);
      setActiveBottomTab('output');
    } catch (err: any) {
      setOutput([`Error: ${err.message}`]);
      setActiveBottomTab('problems');
    } finally {
      console.log = originalLog;
    }
  }, [activeFile.language, activeFile.label, currentCode]);

  useEffect(() => {
    if (runSignal <= 0) return;
    runCode();
  }, [runSignal, runCode]);

  useEffect(() => {
    syncCursor();
  }, [syncCursor, activeFile.id]);

  const problems = useMemo(() => output.filter((line) => line.startsWith('Error:')), [output]);

  const activityItems: Array<{ id: PlaygroundActivity; label: string; icon: React.ReactNode }> = [
    { id: 'explorer', label: 'Explorer', icon: <FileCode size={17} /> },
    { id: 'search', label: 'Search', icon: <Search size={17} /> },
    { id: 'source', label: 'Source Control', icon: <GitBranch size={17} /> },
    { id: 'run', label: 'Run and Debug', icon: <Bug size={17} /> },
    { id: 'extensions', label: 'Extensions', icon: <Blocks size={17} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={17} /> },
  ];

  const srcFiles = explorerFiles.filter((file) => file.folder === 'src');
  const vscodeFiles = explorerFiles.filter((file) => file.folder === '.vscode');
  const rootFiles = explorerFiles.filter((file) => file.folder === 'root');

  return (
    <div className="playground-sonoma h-full w-full text-[#d4d4d4]">
      <div className="h-full w-full flex flex-col bg-[radial-gradient(circle_at_20%_-10%,rgba(10,132,255,0.2),transparent_40%),radial-gradient(circle_at_80%_110%,rgba(84,160,255,0.18),transparent_42%)]">
        <div className="flex-1 min-h-0 flex">
          <aside className="w-12 shrink-0 bg-[rgba(51,51,51,0.72)] border-r border-white/10 backdrop-blur-md flex flex-col items-center py-2 gap-1.5">
            {activityItems.map((item) => (
              <button
                key={item.id}
                type="button"
                title={item.label}
                onClick={() => {
                  setActiveActivity(item.id);
                  if (item.id === 'explorer') setIsSidebarVisible(true);
                }}
                className={`relative w-9 h-9 rounded-[10px] flex items-center justify-center transition-all duration-300 ${
                  activeActivity === item.id
                    ? 'text-[#f6f8ff] bg-white/12 shadow-[0_0_0_1px_rgba(10,132,255,0.45),0_0_14px_rgba(10,132,255,0.32)]'
                    : 'text-[#afb4c4] hover:text-[#f6f8ff] hover:bg-white/8 hover:scale-[1.04] hover:shadow-[0_0_14px_rgba(10,132,255,0.25)]'
                }`}
              >
                {activeActivity === item.id ? <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[#0A84FF] rounded-full" /> : null}
                {item.icon}
              </button>
            ))}
            <button
              type="button"
              title={isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
              onClick={() => setIsSidebarVisible((prev) => !prev)}
              className="mt-auto w-9 h-9 rounded-[10px] flex items-center justify-center text-[#afb4c4] hover:text-[#f6f8ff] hover:bg-white/8 hover:scale-[1.04] transition-all duration-300"
            >
              <PanelLeft size={17} />
            </button>
          </aside>

          <aside
            className={`shrink-0 border-r border-white/10 bg-[rgba(40,40,40,0.6)] backdrop-blur-xl flex flex-col transition-all duration-300 ease-out ${
              isSidebarVisible ? 'w-[235px] max-[860px]:w-[200px] max-[760px]:w-0 max-[760px]:border-r-0' : 'w-0 border-r-0'
            }`}
          >
            <div className={`h-full overflow-hidden ${isSidebarVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
              <div className="h-9 px-3 flex items-center justify-between border-b border-white/10 text-[11px] uppercase tracking-[0.08em] text-[#bfc4cf]">
                <span>Explorer</span>
                <button
                  type="button"
                  onClick={() => setIsSidebarVisible(false)}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>

              <div className="p-2 text-[12px] space-y-1">
                <button
                  type="button"
                  onClick={() => setIsSrcExpanded((prev) => !prev)}
                  className="w-full px-2 py-1.5 rounded text-left flex items-center gap-1.5 text-[#d4d4d4] hover:bg-white/8 transition-colors"
                >
                  {isSrcExpanded ? <ChevronDown size={13} className="text-[#a0a6b6]" /> : <ChevronRight size={13} className="text-[#a0a6b6]" />}
                  <Folder size={13} className="text-[#9cc2ff]" />
                  <span>src</span>
                </button>
                <div className={`ml-4 overflow-hidden transition-all duration-300 ${isSrcExpanded ? 'max-h-56 opacity-100' : 'max-h-0 opacity-0'}`}>
                  {srcFiles.map((file) => (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => openFile(file.id)}
                      className={`w-full px-2 py-1.5 rounded text-left flex items-center gap-1.5 transition-all ${
                        activeFile.id === file.id
                          ? 'bg-[#0A84FF]/20 text-[#f5f9ff] shadow-[inset_0_0_0_1px_rgba(10,132,255,0.35)]'
                          : 'text-[#cfd4de] hover:bg-white/7'
                      }`}
                    >
                      <FileCode size={13} className="text-[#6fb7ff]" />
                      <span className="truncate">{file.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsVSCodeExpanded((prev) => !prev)}
                  className="w-full px-2 py-1.5 rounded text-left flex items-center gap-1.5 text-[#d4d4d4] hover:bg-white/8 transition-colors"
                >
                  {isVSCodeExpanded ? <ChevronDown size={13} className="text-[#a0a6b6]" /> : <ChevronRight size={13} className="text-[#a0a6b6]" />}
                  <Folder size={13} className="text-[#9cc2ff]" />
                  <span>.vscode</span>
                </button>
                <div className={`ml-4 overflow-hidden transition-all duration-300 ${isVSCodeExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  {vscodeFiles.map((file) => (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => openFile(file.id)}
                      className={`w-full px-2 py-1.5 rounded text-left flex items-center gap-1.5 transition-all ${
                        activeFile.id === file.id
                          ? 'bg-[#0A84FF]/20 text-[#f5f9ff] shadow-[inset_0_0_0_1px_rgba(10,132,255,0.35)]'
                          : 'text-[#cfd4de] hover:bg-white/7'
                      }`}
                    >
                      <FileCode size={13} className="text-[#6fb7ff]" />
                      <span className="truncate">{file.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-1 border-t border-white/10 pt-1">
                  {rootFiles.map((file) => (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => openFile(file.id)}
                      className={`w-full px-2 py-1.5 rounded text-left flex items-center gap-1.5 transition-all ${
                        activeFile.id === file.id
                          ? 'bg-[#0A84FF]/20 text-[#f5f9ff] shadow-[inset_0_0_0_1px_rgba(10,132,255,0.35)]'
                          : 'text-[#cfd4de] hover:bg-white/7'
                      }`}
                    >
                      <FileCode size={13} className="text-[#6fb7ff]" />
                      <span className="truncate">{file.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="flex-1 min-w-0 flex flex-col bg-[#1e1e1e]">
            <div className="h-10 shrink-0 px-2 pt-1 bg-[rgba(37,37,38,0.6)] backdrop-blur-md border-b border-white/10 flex items-end gap-1.5 overflow-x-auto custom-scrollbar">
              {openTabs.map((tabId) => {
                const tab = fileById[tabId];
                if (!tab) return null;
                const isActiveTab = tab.id === activeFile.id;
                return (
                  <div
                    key={tab.id}
                    className={`group min-w-[132px] max-w-[190px] h-[34px] px-3 rounded-t-[10px] border border-b-0 flex items-center gap-2 transition-all ${
                      isActiveTab
                        ? 'bg-[#1e1e1e] border-white/12 text-[#f8f8f8] shadow-[0_0_0_1px_rgba(10,132,255,0.35),0_-6px_18px_rgba(10,132,255,0.18)]'
                        : 'bg-[#2b2b2d]/75 border-transparent text-[#a8afbd] hover:bg-[#333337]'
                    }`}
                  >
                    <button type="button" onClick={() => setActiveFileId(tab.id)} className="flex-1 flex items-center gap-1.5 truncate text-left">
                      <FileCode size={12} className={isActiveTab ? 'text-[#7ec3ff]' : 'text-[#8aa8c3]'} />
                      <span className="truncate text-[12px]">{tab.label}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                      className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                    >
                      <X size={11} />
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={runCode}
                className="ml-auto mb-1.5 inline-flex items-center gap-1.5 rounded-lg border border-[#0A84FF]/55 bg-[#0A84FF]/25 px-2.5 py-1 text-[11px] text-[#dff0ff] hover:bg-[#0A84FF]/35 transition-colors"
              >
                <Play size={10} fill="currentColor" /> Run
              </button>
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex-1 min-h-0 relative bg-[#1e1e1e]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFile.id}
                    initial={{ opacity: 0, y: 8, scale: 0.995 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.995 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="absolute inset-0 flex"
                  >
                    <div
                      ref={lineGutterRef}
                      className="w-12 shrink-0 bg-[#1e1e1e] border-r border-white/5 px-2 py-3 text-right text-[12px] leading-6 text-[#858585] select-none overflow-hidden"
                    >
                      {lineNumbers.map((line) => (
                        <div key={line}>{line}</div>
                      ))}
                    </div>

                    <div className="relative flex-1 overflow-hidden">
                      <pre
                        ref={highlightRef}
                        className={`absolute inset-0 m-0 p-3 pointer-events-none ${languageClass} !bg-transparent !border-none overflow-auto custom-scrollbar`}
                        aria-hidden="true"
                      >
                        <code className={languageClass}>
                          {currentCode + (currentCode.endsWith('\n') ? ' ' : '')}
                        </code>
                      </pre>
                      <textarea
                        ref={editorRef}
                        value={currentCode}
                        onChange={(e) => {
                          const nextValue = e.target.value;
                          setFileContents((prev) => ({ ...prev, [activeFile.id]: nextValue }));
                          syncCursor();
                        }}
                        onKeyUp={syncCursor}
                        onClick={syncCursor}
                        onSelect={syncCursor}
                        onScroll={(e) => {
                          if (highlightRef.current) {
                            highlightRef.current.scrollTop = e.currentTarget.scrollTop;
                            highlightRef.current.scrollLeft = e.currentTarget.scrollLeft;
                          }
                          if (lineGutterRef.current) {
                            lineGutterRef.current.scrollTop = e.currentTarget.scrollTop;
                          }
                        }}
                        className="absolute inset-0 w-full h-full bg-transparent p-3 outline-none resize-none text-[13px] leading-6 custom-scrollbar text-transparent caret-white selection:bg-[#264f78]"
                        spellCheck={false}
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="h-[165px] shrink-0 border-t border-white/10 bg-[rgba(24,24,24,0.9)]">
                <div className="h-8 px-2 flex items-center justify-between border-b border-white/10 text-[11px]">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveBottomTab('output')}
                      className={`px-2 py-1 rounded transition-colors ${
                        activeBottomTab === 'output' ? 'text-white bg-white/10' : 'text-[#a6acb9] hover:text-white hover:bg-white/7'
                      }`}
                    >
                      OUTPUT
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveBottomTab('problems')}
                      className={`px-2 py-1 rounded transition-colors ${
                        activeBottomTab === 'problems' ? 'text-white bg-white/10' : 'text-[#a6acb9] hover:text-white hover:bg-white/7'
                      }`}
                    >
                      PROBLEMS {problems.length > 0 ? `(${problems.length})` : ''}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOutput([])}
                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-[#c0c6d4] hover:text-white hover:bg-white/8 transition-colors"
                  >
                    <X size={10} /> Clear
                  </button>
                </div>

                <div className="h-[calc(100%-2rem)] overflow-y-auto custom-scrollbar p-3 text-[12px] leading-6">
                  {activeBottomTab === 'output' ? (
                    output.length === 0 ? (
                      <span className="text-[#9097a7]">Run the active JavaScript file to see output.</span>
                    ) : (
                      output.map((line, index) => (
                        <div key={`${line}-${index}`} className={line.startsWith('Error:') ? 'text-[#f48771]' : 'text-[#d4d4d4]'}>
                          <span className="mr-2 text-[#6a9955]">{'>'}</span>
                          {line}
                        </div>
                      ))
                    )
                  ) : (
                    problems.length === 0 ? (
                      <span className="text-[#9097a7]">No problems detected.</span>
                    ) : (
                      problems.map((problem, index) => (
                        <div key={`${problem}-${index}`} className="text-[#f48771]">
                          <span className="mr-2">●</span>
                          {problem}
                        </div>
                      ))
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="h-7 shrink-0 px-2.5 rounded-b-[12px] border-t border-[#0A84FF]/45 bg-[linear-gradient(90deg,rgba(10,132,255,0.92),rgba(10,132,255,0.74))] text-white text-[11px] flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <span className="inline-flex items-center gap-1"><GitBranch size={11} /> main</span>
                <span className="inline-flex items-center gap-1"><SquareTerminal size={11} /> {activeFile.language}</span>
                <span className="inline-flex items-center gap-1"><PanelBottom size={11} /> Prettier</span>
                <span className="hidden md:inline-flex items-center gap-1">Live Server</span>
              </div>
              <div className="flex items-center gap-3">
                <span>UTF-8</span>
                <span>Ln {cursor.line}, Col {cursor.column}</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .playground-sonoma pre[class*="language-"] {
          font-size: 13px !important;
          line-height: 24px !important;
          tab-size: 2 !important;
          font-family: "Fira Code", "SF Mono", "Menlo", "Monaco", "Consolas", monospace !important;
        }
        .playground-sonoma code[class*="language-"] {
          font-family: inherit !important;
        }
        .playground-sonoma textarea {
          font-family: "Fira Code", "SF Mono", "Menlo", "Monaco", "Consolas", monospace !important;
          font-size: 13px !important;
          line-height: 24px !important;
          tab-size: 2 !important;
        }
        .playground-sonoma .token.keyword {
          color: #569cd6 !important;
        }
        .playground-sonoma .token.string {
          color: #ce9178 !important;
        }
        .playground-sonoma .token.function,
        .playground-sonoma .token.function-variable {
          color: #dcdcaa !important;
        }
        .playground-sonoma .token.number,
        .playground-sonoma .token.boolean {
          color: #b5cea8 !important;
        }
        .playground-sonoma .token.comment {
          color: #6a9955 !important;
        }
      `}</style>
    </div>
  );
};

const TerminalContent = ({ clearSignal }: { clearSignal: number }) => {
  type TerminalEntry = {
    type: 'system' | 'command' | 'output' | 'error';
    value: string;
  };

  const initialEntries = useMemo<TerminalEntry[]>(() => {
    const now = new Date();
    const lastLogin = now.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    return [
      { type: 'system', value: `Last login: ${lastLogin} on ttys000` },
      { type: 'system', value: 'Type "help" to view available commands.' },
    ];
  }, []);

  const [history, setHistory] = useState<TerminalEntry[]>(initialEntries);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (clearSignal <= 0) return;
    setHistory([]);
    setInput('');
  }, [clearSignal]);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const rawInput = input.trim();
    const cmd = rawInput.toLowerCase();
    let response = '';
    let responseType: TerminalEntry['type'] = 'output';

    switch (cmd) {
      case 'help':
        response = 'Available commands:\nhelp\nclear\nls\nwhoami\ndate\npwd\ncontact';
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'ls':
        response = 'about.txt  projects/  skills.txt  experience.txt  contact.txt  widgets/';
        break;
      case 'whoami':
        response = 'sumitgautam - MERN Stack Developer';
        break;
      case 'date':
        response = new Date().toString();
        break;
      case 'pwd':
        response = '/Users/sumitgautam/Desktop/alex-chen-portfolio';
        break;
      case 'contact':
        response = 'Email: Sumitgautam970@gmail.com | Phone: +91-9310513770 | LinkedIn: linkedin.com/in/sumit--gautam';
        break;
      default:
        response = `Command not found: ${cmd}. Type "help" for a list of commands.`;
        responseType = 'error';
    }

    setHistory(prev => [
      ...prev,
      { type: 'command', value: rawInput },
      { type: responseType, value: response },
    ]);
    setInput('');
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0b0d12]" onClick={focusInput}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(59,130,246,0.16),transparent_35%),radial-gradient(circle_at_85%_100%,rgba(20,184,166,0.14),transparent_38%)]" />

      <div
        ref={scrollRef}
        className="relative h-full overflow-y-auto custom-scrollbar px-5 py-4 space-y-1.5 font-['SF_Mono','Menlo','Monaco','Consolas',monospace] text-[13px] leading-6 text-zinc-100"
      >
        {history.map((entry, i) => (
          <div key={i} className="whitespace-pre-wrap">
            {entry.type === 'command' && (
              <div className="flex flex-wrap">
                <span className="mr-2 shrink-0 text-emerald-400">sumitgautam@MacBook-Pro ~ %</span>
                <span className="text-zinc-100">{entry.value}</span>
              </div>
            )}
            {entry.type === 'system' && <span className="text-zinc-400">{entry.value}</span>}
            {entry.type === 'output' && <span className="text-zinc-200">{entry.value}</span>}
            {entry.type === 'error' && <span className="text-rose-400">{entry.value}</span>}
          </div>
        ))}

        <form onSubmit={handleCommand} className="mt-1 flex items-center gap-2" data-no-desktop-context-menu>
          <span className="shrink-0 text-emerald-400">sumitgautam@MacBook-Pro ~ %</span>
          <input
            ref={inputRef}
            autoFocus
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-zinc-100 caret-zinc-100"
          />
        </form>
      </div>
    </div>
  );
};

const BootScreen = ({ progress }: { progress: number }) => (
  <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[20000]">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="mb-12"
    >
      <img src={appleMenuIcon} alt="Apple" className="w-20 h-20 object-contain" />
    </motion.div>
    <div className="w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
      <motion.div 
        className="h-full bg-white"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  </div>
);

const LockScreen = ({
  time,
  wallpaper,
  batteryPercent,
  onUnlock,
  onPowerRequest,
}: {
  time: Date;
  wallpaper: string;
  batteryPercent: number | null;
  onUnlock: () => void;
  onPowerRequest: (action: PowerAction) => void;
}) => {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInputError, setShowInputError] = useState(false);
  const unlockTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (unlockTimerRef.current !== null) {
        window.clearTimeout(unlockTimerRef.current);
      }
    };
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setShowInputError(true);
      window.setTimeout(() => setShowInputError(false), 420);
      return;
    }

    setIsSubmitting(true);
    unlockTimerRef.current = window.setTimeout(() => {
      onUnlock();
    }, 420);
  };

  const lockTime = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  });
  const lockDate = time.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.01 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[19500] overflow-hidden text-white select-none"
      style={{ willChange: 'opacity, transform' }}
    >
      <div
        className="absolute inset-[-6%]"
        style={{
          backgroundImage: `url(${wallpaper})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: 'scale(1.08)',
          willChange: 'transform',
        }}
      />
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.25)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(0,0,0,0.04),rgba(0,0,0,0.36)_74%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(10,132,255,0.24),transparent_34%),radial-gradient(circle_at_90%_90%,rgba(125,181,255,0.16),transparent_40%)]" />
      <div
        className="absolute inset-0 pointer-events-none opacity-20 mix-blend-soft-light"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.5) 0.55px, transparent 0.55px), radial-gradient(rgba(0,0,0,0.34) 0.4px, transparent 0.4px)',
          backgroundSize: '2px 2px, 3px 3px',
          backgroundPosition: '0 0, 1px 1px',
        }}
      />

      <div className="relative h-full w-full">
        <div className="absolute top-[11%] left-1/2 -translate-x-1/2 text-center">
          <motion.h1
            animate={{
              scale: [1, 1.016, 1],
              opacity: [0.95, 1, 0.95],
            }}
            transition={{
              duration: 5.4,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
            className="text-[clamp(5.6rem,14vw,9.5rem)] font-light leading-none tracking-[-0.02em] text-[rgba(255,255,255,0.92)] [text-rendering:optimizeLegibility] [-webkit-font-smoothing:antialiased]"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif',
              textShadow: '0 8px 34px rgba(10,132,255,0.16)',
            }}
          >
            {lockTime}
          </motion.h1>
          <p
            className="mt-1 text-[clamp(1.05rem,2.4vw,1.42rem)] font-normal tracking-[0.01em] text-[rgba(255,255,255,0.9)]"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif',
            }}
          >
            {lockDate}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.45, ease: 'easeOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[2%] w-[min(90vw,360px)]"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full border border-white/35 bg-white/12 backdrop-blur-xl shadow-[0_14px_34px_rgba(0,0,0,0.35)] flex items-center justify-center">
              <User size={44} className="text-white/90" />
            </div>
            <p className="mt-4 text-[21px] font-medium text-[rgba(255,255,255,0.92)] tracking-[-0.01em]">Sumit Gautam</p>

            <form onSubmit={handleUnlock} className="mt-5 w-full">
              <div
                className={`relative rounded-[20px] border px-3 h-12 flex items-center gap-2 transition-all duration-300 ${
                  showInputError ? 'border-rose-400/70 shadow-[0_0_0_2px_rgba(251,113,133,0.3)]' : 'border-[rgba(255,255,255,0.2)]'
                }`}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(30px)',
                  WebkitBackdropFilter: 'blur(30px)',
                  boxShadow: showInputError ? undefined : '0 14px 30px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
              >
                <Lock size={14} className="text-white/75 shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="flex-1 bg-transparent border-none outline-none text-[rgba(255,255,255,0.94)] placeholder:text-white/60 text-[14px]"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
                  }}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-7 h-7 rounded-full bg-[#0A84FF]/85 hover:bg-[#0A84FF] text-white flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_14px_rgba(10,132,255,0.46)]"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        <div className="absolute left-8 bottom-7 flex items-center gap-2.5">
          <button
            onClick={() => onPowerRequest('sleep')}
            className="h-9 px-3.5 rounded-full bg-white/10 hover:bg-white/16 border border-white/20 backdrop-blur-xl text-[13px] text-white/90 transition-colors inline-flex items-center gap-2"
          >
            <Moon size={14} /> Sleep
          </button>
          <button
            onClick={() => onPowerRequest('restart')}
            className="h-9 px-3.5 rounded-full bg-white/10 hover:bg-white/16 border border-white/20 backdrop-blur-xl text-[13px] text-white/90 transition-colors inline-flex items-center gap-2"
          >
            <RotateCcw size={14} /> Restart
          </button>
          <button
            onClick={() => onPowerRequest('shutDown')}
            className="h-9 px-3.5 rounded-full bg-white/10 hover:bg-white/16 border border-white/20 backdrop-blur-xl text-[13px] text-white/90 transition-colors inline-flex items-center gap-2"
          >
            <Power size={14} /> Shut Down
          </button>
        </div>

        <div className="absolute right-8 bottom-7 flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/16 border border-white/20 backdrop-blur-xl text-white/90 flex items-center justify-center transition-colors">
            <Accessibility size={15} />
          </button>
          <button className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/16 border border-white/20 backdrop-blur-xl text-white/90 flex items-center justify-center transition-colors">
            <Wifi size={15} />
          </button>
          <button className="h-9 px-3 rounded-full bg-white/10 hover:bg-white/16 border border-white/20 backdrop-blur-xl text-white/90 flex items-center justify-center transition-colors gap-1.5">
            <Battery size={15} />
            <span className="text-[11px]">{batteryPercent !== null ? `${batteryPercent}%` : '—'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const PowerOptionsOverlay = ({
  selectedAction,
  onCancel,
  onConfirm,
}: {
  selectedAction: PowerAction | null;
  onCancel: () => void;
  onConfirm: (action: PowerAction) => void;
}) => {
  const options: Array<{ id: PowerAction; label: string; icon: React.ReactNode }> = [
    { id: 'restart', label: 'Restart', icon: <RotateCcw size={22} /> },
    { id: 'sleep', label: 'Sleep', icon: <Moon size={22} /> },
    { id: 'shutDown', label: 'Shut Down', icon: <Power size={22} /> },
  ];

  return (
    <motion.div
      data-no-desktop-context-menu
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="fixed inset-0 z-[19700] flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-[rgba(0,0,0,0.4)]"
        style={{
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          transition: 'all 0.3s ease',
        }}
        onClick={onCancel}
      />

      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.96 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-[min(92vw,560px)] rounded-[24px] border border-[rgba(255,255,255,0.18)] p-7 md:p-8"
        style={{
          background: 'rgba(30,30,30,0.6)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          boxShadow: '0 30px 64px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.14)',
        }}
      >
        <div className="text-center">
          <img src={appleMenuIcon} alt="Apple" className="w-5 h-5 object-contain mx-auto opacity-85" />
          <p className="mt-3 text-[18px] font-medium tracking-[-0.01em] text-[rgba(255,255,255,0.92)]">Are you sure?</p>
          <p className="mt-1 text-[13px] text-[rgba(255,255,255,0.62)]">Choose a power option for your Mac</p>
        </div>

        <div className="mt-7 flex items-start justify-center gap-4 md:gap-6">
          {options.map((option) => {
            const isSelected = selectedAction === option.id;
            return (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                animate={
                  isSelected
                    ? {
                        boxShadow: [
                          '0 0 0 rgba(10,132,255,0.35)',
                          '0 0 22px rgba(10,132,255,0.45)',
                          '0 0 0 rgba(10,132,255,0.35)',
                        ],
                      }
                    : { boxShadow: '0 8px 20px rgba(0,0,0,0.26)' }
                }
                transition={isSelected ? { duration: 2.2, repeat: Infinity } : { duration: 0.25 }}
                onClick={() => onConfirm(option.id)}
                className="group flex flex-col items-center gap-2.5"
              >
                <span
                  className={`w-20 h-20 rounded-full border flex items-center justify-center text-[rgba(255,255,255,0.92)] transition-all duration-300 ${
                    isSelected
                      ? 'bg-[rgba(10,132,255,0.24)] border-[rgba(10,132,255,0.72)]'
                      : 'bg-[rgba(255,255,255,0.08)] border-[rgba(255,255,255,0.2)] group-hover:border-[rgba(10,132,255,0.52)] group-hover:bg-[rgba(255,255,255,0.12)]'
                  }`}
                >
                  {option.icon}
                </span>
                <span className="text-[13px] font-medium text-[rgba(255,255,255,0.9)]">{option.label}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onCancel}
            className="h-9 px-5 rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.15)] text-[13px] text-[rgba(255,255,255,0.9)] transition-colors"
          >
            Cancel
          </button>
          <p className="mt-3 text-[11px] text-[rgba(255,255,255,0.56)]">Shortcut hint: ⌘ + Q</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function HomePage() {
  const [wallpaper, setWallpaper] = useState<string>(() => getStoredWallpaper());
  const [windows, setWindows] = useState<Record<WindowID, WindowState>>(() => {
    const initial = {} as Record<WindowID, WindowState>;
    Object.entries(INITIAL_WINDOWS).forEach(([key, val], index) => {
      initial[key as WindowID] = {
        ...val,
        zIndex: index + 1,
        position: { 
          x: 100 + index * 40, 
          y: 100 + index * 40 
        }
      } as WindowState;
    });
    return initial;
  });

  const [maxZ, setMaxZ] = useState(Object.keys(INITIAL_WINDOWS).length + 1);
  const [time, setTime] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [brightness, setBrightness] = useState(() => Math.round(getStoredNumber(BRIGHTNESS_STORAGE_KEY, 80, 0, 100)));
  const [volume, setVolume] = useState(() => Math.round(getStoredNumber(VOLUME_STORAGE_KEY, 60, 0, 100)));
  const [appearanceMode, setAppearanceMode] = useState<AppearanceMode>(() => getStoredAppearanceMode());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => resolveDarkMode(getStoredAppearanceMode()));
  const [isNightShift, setIsNightShift] = useState(() => getStoredBoolean(NIGHT_SHIFT_STORAGE_KEY, false));
  const [isStageManager, setIsStageManager] = useState(() => getStoredBoolean(STAGE_MANAGER_STORAGE_KEY, false));
  const [isWidgetsOpen, setIsWidgetsOpen] = useState(false);
  const [isWidgetPickerOpen, setIsWidgetPickerOpen] = useState(false);
  const [desktopContextMenu, setDesktopContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [useStacks, setUseStacks] = useState(() => getStoredBoolean(USE_STACKS_STORAGE_KEY, false));
  const [widgets, setWidgets] = useState<WidgetId[]>(() => getStoredWidgets());
  const [widgetPositions, setWidgetPositions] = useState<Record<WidgetId, { x: number; y: number }>>(() => getStoredWidgetPositions());
  const [draggingWidgetId, setDraggingWidgetId] = useState<WidgetId | null>(null);
  const [terminalClearSignal, setTerminalClearSignal] = useState(0);
  const [playgroundRunSignal, setPlaygroundRunSignal] = useState(0);
  const [isBooting, setIsBooting] = useState(true);
  const [isLockScreenVisible, setIsLockScreenVisible] = useState(false);
  const [isPowerOptionsOpen, setIsPowerOptionsOpen] = useState(false);
  const [selectedPowerAction, setSelectedPowerAction] = useState<PowerAction | null>(null);
  const [bootProgress, setBootProgress] = useState(0);
  const [accentColor, setAccentColor] = useState<AccentColor>(() => getStoredAccentColor());
  const [dockSize, setDockSize] = useState(() => Math.round(getStoredNumber(DOCK_SIZE_STORAGE_KEY, 48, 32, 64)));
  const [dockMagnification, setDockMagnification] = useState(() => getStoredNumber(DOCK_MAGNIFICATION_STORAGE_KEY, 2.0, 1, 2.5));
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isBatteryCharging, setIsBatteryCharging] = useState<boolean | null>(null);
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicCurrentTime, setMusicCurrentTime] = useState(0);
  const [musicDuration, setMusicDuration] = useState(0);
  const [musicError, setMusicError] = useState<string | null>(null);
  const [aboutActiveTab, setAboutActiveTab] = useState<AboutTabId>('overview');
  const mouseX = useMotionValue(Infinity);
  const widgetDragOffsetRef = useRef({ x: 0, y: 0 });
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const isMusicPlayingRef = useRef(false);

  const openPowerOptions = useCallback((action: PowerAction) => {
    setSelectedPowerAction(action);
    setIsPowerOptionsOpen(true);
    setActiveMenu(null);
    setDesktopContextMenu(null);
    setIsControlCenterOpen(false);
  }, []);

  const closePowerOptions = useCallback(() => {
    setIsPowerOptionsOpen(false);
    setSelectedPowerAction(null);
  }, []);

  const handlePowerActionConfirm = useCallback((action: PowerAction) => {
    if (action === 'restart') {
      closePowerOptions();
      setIsLockScreenVisible(false);
      setIsBooting(true);
      setBootProgress(0);
      return;
    }

    if (action === 'sleep') {
      closePowerOptions();
      setIsLockScreenVisible(true);
      return;
    }

    closePowerOptions();
    setIsLockScreenVisible(true);
  }, [closePowerOptions]);

  const focusedWindowId = useMemo<WindowID | null>(() => {
    const visibleWindows = (Object.values(windows) as WindowState[]).filter((win) => win.isOpen && !win.isMinimized);
    if (visibleWindows.length === 0) return null;
    return visibleWindows.reduce((top, current) => (current.zIndex > top.zIndex ? current : top)).id;
  }, [windows]);

  const accentColorClasses = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500', ring: 'ring-blue-500', text600: 'text-blue-600' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500', ring: 'ring-purple-500', text600: 'text-purple-600' },
    pink: { bg: 'bg-pink-500', text: 'text-pink-500', border: 'border-pink-500', ring: 'ring-pink-500', text600: 'text-pink-600' },
    red: { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500', ring: 'ring-red-500', text600: 'text-red-600' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500', ring: 'ring-orange-500', text600: 'text-orange-600' },
    yellow: { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500', ring: 'ring-yellow-500', text600: 'text-yellow-600' },
    green: { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500', ring: 'ring-green-500', text600: 'text-green-600' },
    zinc: { bg: 'bg-zinc-500', text: 'text-zinc-500', border: 'border-zinc-500', ring: 'ring-zinc-500', text600: 'text-zinc-600' },
  };
  const currentAccent = accentColorClasses[accentColor as keyof typeof accentColorClasses] || accentColorClasses.blue;

  useEffect(() => {
    setIsDarkMode(resolveDarkMode(appearanceMode));
    if (appearanceMode !== 'Auto') return;

    const interval = window.setInterval(() => {
      setIsDarkMode(resolveDarkMode('Auto'));
    }, 60000); // Check every minute for Auto mode

    return () => window.clearInterval(interval);
  }, [appearanceMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(THEME_MODE_STORAGE_KEY, appearanceMode);
    } catch {
      // Ignore storage write failures (e.g. restricted storage settings).
    }
  }, [appearanceMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(WALLPAPER_STORAGE_KEY, wallpaper);
    } catch {
      // Ignore storage write failures (e.g. restricted storage settings).
    }
  }, [wallpaper]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(widgets));
    } catch {
      // Ignore storage write failures (e.g. restricted storage settings).
    }
  }, [widgets]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(WIDGET_POSITIONS_STORAGE_KEY, JSON.stringify(widgetPositions));
    } catch {
      // Ignore storage write failures (e.g. restricted storage settings).
    }
  }, [widgetPositions]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(ACCENT_COLOR_STORAGE_KEY, accentColor);
    } catch {
      // Ignore storage write failures (e.g. restricted storage settings).
    }
  }, [accentColor]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(DOCK_SIZE_STORAGE_KEY, String(dockSize));
    } catch {
      // Ignore storage write failures (e.g. restricted storage settings).
    }
  }, [dockSize]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(DOCK_MAGNIFICATION_STORAGE_KEY, String(dockMagnification));
    } catch {
      // Ignore storage write failures (e.g. restricted storage settings).
    }
  }, [dockMagnification]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(BRIGHTNESS_STORAGE_KEY, String(brightness));
    } catch {
      // Ignore storage write failures (e.g. restricted storage settings).
    }
  }, [brightness]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(VOLUME_STORAGE_KEY, String(volume));
    } catch {
      // Ignore storage write failures (e.g. restricted storage settings).
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(NIGHT_SHIFT_STORAGE_KEY, String(isNightShift));
    } catch {
      // Ignore storage write failures (e.g. restricted storage settings).
    }
  }, [isNightShift]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STAGE_MANAGER_STORAGE_KEY, String(isStageManager));
    } catch {
      // Ignore storage write failures (e.g. restricted storage settings).
    }
  }, [isStageManager]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(USE_STACKS_STORAGE_KEY, String(useStacks));
    } catch {
      // Ignore storage write failures (e.g. restricted storage settings).
    }
  }, [useStacks]);

  useEffect(() => {
    if (isBooting) {
      const interval = setInterval(() => {
        setBootProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setIsBooting(false);
              setIsLockScreenVisible(true);
            }, 500);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isBooting]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (isPowerOptionsOpen) return;
      setActiveMenu(null);
      setIsControlCenterOpen(false);
      setIsWidgetPickerOpen(false);
      setDesktopContextMenu(null);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isPowerOptionsOpen]);

  useEffect(() => {
    if (!isPowerOptionsOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePowerOptions();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isPowerOptionsOpen, closePowerOptions]);

  useEffect(() => {
    if (!draggingWidgetId) return;

    const getWidgetWidth = (widgetId: WidgetId) => {
      const layout = WIDGET_OPTIONS.find((option) => option.id === widgetId)?.layout ?? 'full';
      return layout === 'half' ? 176 : 320;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const widgetWidth = getWidgetWidth(draggingWidgetId);
      const maxX = Math.max(0, window.innerWidth - widgetWidth - 8);
      const maxY = Math.max(48, window.innerHeight - 140);
      const x = Math.min(maxX, Math.max(8, e.clientX - widgetDragOffsetRef.current.x));
      const y = Math.min(maxY, Math.max(40, e.clientY - widgetDragOffsetRef.current.y));

      setWidgetPositions((prev) => ({
        ...prev,
        [draggingWidgetId]: { x, y },
      }));
    };

    const handleMouseUp = () => setDraggingWidgetId(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingWidgetId]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    const navWithBattery = navigator as NavigatorWithBattery;
    if (typeof navWithBattery.getBattery !== 'function') return;

    let isMounted = true;
    let batteryManager: BatteryManagerLike | null = null;

    const handleBatteryUpdate = () => {
      if (!batteryManager || !isMounted) return;
      const normalizedLevel = Math.min(1, Math.max(0, batteryManager.level));
      setBatteryLevel(normalizedLevel);
      setIsBatteryCharging(batteryManager.charging);
    };

    navWithBattery
      .getBattery()
      .then((battery) => {
        if (!isMounted) return;
        batteryManager = battery;
        handleBatteryUpdate();
        battery.addEventListener('levelchange', handleBatteryUpdate);
        battery.addEventListener('chargingchange', handleBatteryUpdate);
      })
      .catch(() => {
        // Ignore when browser blocks battery access.
      });

    return () => {
      isMounted = false;
      if (!batteryManager) return;
      batteryManager.removeEventListener('levelchange', handleBatteryUpdate);
      batteryManager.removeEventListener('chargingchange', handleBatteryUpdate);
    };
  }, []);

  useEffect(() => {
    isMusicPlayingRef.current = isMusicPlaying;
  }, [isMusicPlaying]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = 1;
    musicAudioRef.current = audio;

    const handleTimeUpdate = () => {
      setMusicCurrentTime(audio.currentTime || 0);
    };

    const handleDurationChange = () => {
      setMusicDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };

    const handleEnded = () => {
      setActiveTrackIndex((prev) => (prev + 1) % CONTROL_CENTER_TRACKS.length);
    };

    const handleError = () => {
      setMusicError('Playback unavailable');
      setIsMusicPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleDurationChange);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleDurationChange);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      musicAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = musicAudioRef.current;
    if (!audio) return;
    audio.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    const audio = musicAudioRef.current;
    if (!audio) return;

    const wasPlaying = isMusicPlayingRef.current;
    setMusicCurrentTime(0);
    setMusicDuration(0);
    setMusicError(null);
    audio.pause();
    audio.src = CONTROL_CENTER_TRACKS[activeTrackIndex].src;
    audio.load();

    if (wasPlaying) {
      void audio.play().catch(() => {
        setMusicError('Playback blocked. Click play to retry.');
        setIsMusicPlaying(false);
      });
    }
  }, [activeTrackIndex]);

  useEffect(() => {
    const audio = musicAudioRef.current;
    if (!audio) return;

    if (isMusicPlaying) {
      void audio.play().then(() => {
        setMusicError(null);
      }).catch(() => {
        setMusicError('Playback blocked. Click play to retry.');
        setIsMusicPlaying(false);
      });
      return;
    }

    audio.pause();
  }, [isMusicPlaying]);

  const toggleWindow = useCallback((id: WindowID) => {
    setWindows(prev => {
      const win = prev[id];
      if (!win.isOpen) {
        return {
          ...prev,
          [id]: { ...win, isOpen: true, isMinimized: false, zIndex: maxZ }
        };
      } else if (win.isMinimized) {
        return {
          ...prev,
          [id]: { ...win, isMinimized: false, zIndex: maxZ }
        };
      } else {
        // If already open and focused, maybe minimize? 
        // Or just focus if not top
        const isTop = (Object.values(prev) as WindowState[]).every(w => w.zIndex <= win.zIndex);
        if (!isTop) {
          return {
            ...prev,
            [id]: { ...win, zIndex: maxZ }
          };
        }
        return prev;
      }
    });
    setMaxZ(prev => prev + 1);
  }, [maxZ]);

  const closeWindow = (id: WindowID) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false }
    }));
  };

  const minimizeWindow = (id: WindowID) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: true }
    }));
  };

  const maximizeWindow = (id: WindowID) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isMaximized: !prev[id].isMaximized }
    }));
  };

  const focusWindow = (id: WindowID) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], zIndex: maxZ }
    }));
    setMaxZ(prev => prev + 1);
  };

  const openDesktopContextMenuAt = useCallback((x: number, y: number) => {
    setActiveMenu(null);
    setIsControlCenterOpen(false);
    setIsWidgetPickerOpen(false);
    setDesktopContextMenu({ x, y });
  }, []);

  const handleDesktopContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-no-desktop-context-menu]')) return;

    e.preventDefault();
    e.stopPropagation();
    openDesktopContextMenuAt(e.clientX, e.clientY);
  }, [openDesktopContextMenuAt]);

  const handleDesktopDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-no-desktop-context-menu]')) return;
    if (e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();
    openDesktopContextMenuAt(e.clientX, e.clientY);
  }, [openDesktopContextMenuAt]);

  const handleDesktopContextMenuAction = useCallback((action: DesktopContextMenuAction) => {
    if (action === 'change-wallpaper') {
      toggleWindow('settings');
    } else if (action === 'edit-widgets') {
      setIsWidgetsOpen(true);
    } else if (action === 'use-stacks') {
      setUseStacks((prev) => !prev);
    }

    setDesktopContextMenu(null);
  }, [toggleWindow]);

  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) => {
      const element = target as HTMLElement | null;
      if (!element) return false;
      if (element.isContentEditable) return true;
      const tagName = element.tagName.toLowerCase();
      return tagName === 'input' || tagName === 'textarea' || tagName === 'select';
    };

    const numberShortcutMap: Partial<Record<string, WindowID>> = {
      '1': 'about',
      '2': 'projects',
      '3': 'skills',
      '4': 'experience',
      '5': 'contact',
      '6': 'terminal',
      '7': 'playground',
      '8': 'settings',
      '9': 'safari',
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const editableTarget = isEditableTarget(e.target);
      const hasMeta = e.metaKey;
      const hasCtrl = e.ctrlKey;
      const hasAlt = e.altKey;
      const hasShift = e.shiftKey;

      const mappedWindow = numberShortcutMap[key];
      if (hasMeta && mappedWindow && !hasCtrl && !hasAlt) {
        e.preventDefault();
        toggleWindow(mappedWindow);
        return;
      }

      if (hasMeta && key === ',' && !hasCtrl && !hasAlt) {
        e.preventDefault();
        toggleWindow('settings');
        return;
      }

      if (hasMeta && key === 'b' && !hasCtrl && !hasAlt) {
        e.preventDefault();
        setIsWidgetsOpen((prev) => !prev);
        setIsWidgetPickerOpen(false);
        return;
      }

      if (hasMeta && key === 'l' && !hasCtrl && !hasAlt) {
        e.preventDefault();
        setIsControlCenterOpen((prev) => !prev);
        setActiveMenu(null);
        return;
      }

      if (hasMeta && hasShift && key === 'd' && !hasCtrl && !hasAlt) {
        e.preventDefault();
        setAppearanceMode((prev) => (prev === 'Dark' ? 'Light' : 'Dark'));
        return;
      }

      if (hasMeta && key === 'k' && focusedWindowId === 'terminal') {
        e.preventDefault();
        setTerminalClearSignal((prev) => prev + 1);
        return;
      }

      if (!hasMeta && hasCtrl && key === 'l' && focusedWindowId === 'terminal') {
        e.preventDefault();
        setTerminalClearSignal((prev) => prev + 1);
        return;
      }

      if (hasMeta && key === 'enter' && focusedWindowId === 'playground') {
        e.preventDefault();
        setPlaygroundRunSignal((prev) => prev + 1);
        return;
      }

      if (!hasMeta || hasAlt || (editableTarget && key !== 'w' && key !== 'm' && key !== 'f')) return;

      if (key === 'w' && focusedWindowId) {
        e.preventDefault();
        closeWindow(focusedWindowId);
        return;
      }

      if (key === 'm' && focusedWindowId) {
        e.preventDefault();
        minimizeWindow(focusedWindowId);
        return;
      }

      if (key === 'f' && hasCtrl && focusedWindowId) {
        e.preventDefault();
        maximizeWindow(focusedWindowId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedWindowId, toggleWindow, setAppearanceMode]);

  const [copiedField, setCopiedField] = useState<'email' | 'phone' | null>(null);
  const availableWidgetOptions = WIDGET_OPTIONS.filter(({ id }) => !widgets.includes(id));
  const getWidgetLayout = (widgetId: WidgetId) => WIDGET_OPTIONS.find((option) => option.id === widgetId)?.layout ?? 'full';
  const getWidgetWidthClass = (widgetId: WidgetId) => (getWidgetLayout(widgetId) === 'half' ? 'w-44' : 'w-80');
  const batteryPercent = batteryLevel !== null ? Math.round(batteryLevel * 100) : null;
  const batteryStatusLabel = batteryLevel === null ? 'Battery Unavailable' : (isBatteryCharging ? 'Charging' : 'On Battery');
  const normalizedBrightness = Math.min(100, Math.max(0, brightness)) / 100;
  const desktopBrightness = (0.45 + normalizedBrightness * 0.7) * (isDarkMode ? 0.9 : 1);
  const desktopFilter = `brightness(${desktopBrightness.toFixed(3)}) contrast(${isDarkMode ? 1.08 : 1}) sepia(${isNightShift ? 0.3 : 0}) saturate(${isNightShift ? 1.2 : 1})`;
  const activeWindowTitle = focusedWindowId ? windows[focusedWindowId].title : 'Portfolio';
  const menuItems = [
    { id: 'app', label: activeWindowTitle },
    { id: 'file', label: 'File' },
    { id: 'edit', label: 'Edit' },
    { id: 'view', label: 'View' },
    { id: 'go', label: 'Go' },
    { id: 'window', label: 'Window' },
    { id: 'help', label: 'Help' },
  ];
  const activeTrack = CONTROL_CENTER_TRACKS[activeTrackIndex];
  const clampedMusicDuration = musicDuration > 0 ? musicDuration : 100;
  const clampedMusicTime = Math.min(musicCurrentTime, clampedMusicDuration);

  const toggleMusicPlayback = useCallback(() => {
    setMusicError(null);
    setIsMusicPlaying((prev) => !prev);
  }, []);

  const playNextTrack = useCallback(() => {
    setActiveTrackIndex((prev) => (prev + 1) % CONTROL_CENTER_TRACKS.length);
  }, []);

  const playPreviousTrack = useCallback(() => {
    const audio = musicAudioRef.current;
    if (audio && audio.currentTime > 2.8) {
      audio.currentTime = 0;
      setMusicCurrentTime(0);
      return;
    }
    setActiveTrackIndex((prev) => (prev - 1 + CONTROL_CENTER_TRACKS.length) % CONTROL_CENTER_TRACKS.length);
  }, []);

  const handleMusicSeek = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const audio = musicAudioRef.current;
    if (!audio || musicDuration <= 0) return;
    const nextTime = Number(event.target.value);
    audio.currentTime = nextTime;
    setMusicCurrentTime(nextTime);
  }, [musicDuration]);

  const handleBrightnessChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.target.value, 10);
    if (!Number.isFinite(value)) return;
    setBrightness(Math.min(100, Math.max(0, value)));
  }, []);

  const handleVolumeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.target.value, 10);
    if (!Number.isFinite(value)) return;
    setVolume(Math.min(100, Math.max(0, value)));
  }, []);

  const addWidget = (widgetId: WidgetId) => {
    setWidgets((prev) => (prev.includes(widgetId) ? prev : [...prev, widgetId]));
    setIsWidgetPickerOpen(false);
    setWidgetPositions((prev) => ({
      ...prev,
      [widgetId]: prev[widgetId] ?? DEFAULT_WIDGET_POSITIONS[widgetId],
    }));
  };

  const removeWidget = (widgetId: WidgetId) => {
    setWidgets((prev) => prev.filter((id) => id !== widgetId));
  };

  const startWidgetDrag = (widgetId: WidgetId, e: React.MouseEvent<HTMLDivElement>) => {
    const currentPosition = widgetPositions[widgetId] ?? DEFAULT_WIDGET_POSITIONS[widgetId];
    widgetDragOffsetRef.current = {
      x: e.clientX - currentPosition.x,
      y: e.clientY - currentPosition.y,
    };
    setDraggingWidgetId(widgetId);
  };

  const renderWidgetContent = (widgetId: WidgetId) => {
    if (widgetId === 'clock') {
      return (
        <div className={`${isDarkMode ? 'bg-white/10' : 'bg-white/20'} rounded-3xl p-5 border border-white/10 shadow-lg`}>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-white/60' : 'text-black/60'} mb-1`}>Cupertino</p>
          <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
            {time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-black/40'} mt-2`}>
            Today, {time.toLocaleDateString('en-US', { weekday: 'long' })}
          </p>
        </div>
      );
    }

    if (widgetId === 'weather') {
      return (
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl p-5 shadow-lg border border-white/10">
          <Sun size={24} className="text-white mb-2" />
          <p className="text-2xl font-bold text-white">72°</p>
          <p className="text-xs text-white/80">Sunny</p>
        </div>
      );
    }

    if (widgetId === 'stocks') {
      return (
        <div className={`${isDarkMode ? 'bg-white/10' : 'bg-white/20'} rounded-3xl p-5 border border-white/10 shadow-lg flex flex-col justify-center items-center`}>
          <p className={`text-xs font-bold ${isDarkMode ? 'text-white/60' : 'text-black/60'} uppercase tracking-wider`}>Stocks</p>
          <p className="text-lg font-bold text-emerald-400">+2.4%</p>
          <p className={`text-[10px] ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>AAPL</p>
        </div>
      );
    }

    if (widgetId === 'calendar') {
      return (
        <div className={`${isDarkMode ? 'bg-white/10' : 'bg-white/20'} rounded-3xl p-5 border border-white/10 shadow-lg`}>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-bold text-red-400 uppercase tracking-widest">
              {time.toLocaleDateString('en-US', { month: 'short' })}
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>No events</p>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, dayIndex) => (
              <span key={`${d}-${dayIndex}`} className={`text-[10px] ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>{d}</span>
            ))}
            {Array.from({ length: 31 }).map((_, i) => (
              <span
                key={i}
                className={`text-xs ${
                  i + 1 === time.getDate()
                    ? 'bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mx-auto'
                    : (isDarkMode ? 'text-white' : 'text-black')
                }`}
              >
                {i + 1}
              </span>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className={`${isDarkMode ? 'bg-white/10' : 'bg-white/20'} rounded-3xl p-5 border border-white/10 shadow-lg`}>
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                className={isDarkMode ? 'text-white/10' : 'text-black/5'}
                strokeDasharray="100, 100"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-400"
                strokeDasharray={`${batteryPercent ?? 0}, 100`}
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Battery size={14} className={isDarkMode ? 'text-white' : 'text-black'} />
            </div>
          </div>
          <div>
            <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{batteryPercent !== null ? `${batteryPercent}%` : 'N/A'}</p>
            <p className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>{batteryStatusLabel}</p>
          </div>
        </div>
      </div>
    );
  };

  const copyContactValue = useCallback((value: string, field: 'email' | 'phone') => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    window.setTimeout(() => {
      setCopiedField((current) => (current === field ? null : current));
    }, 1800);
  }, []);

  const copyEmail = () => copyContactValue('Sumitgautam970@gmail.com', 'email');
  const copyPhone = () => copyContactValue('+91-9310513770', 'phone');

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#0f1117] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl p-7 text-center shadow-[0_24px_56px_rgba(0,0,0,0.35)]">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/14 border border-white/20 flex items-center justify-center mb-4">
            <Monitor size={24} className="text-white/85" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">For Best View</h1>
          <p className="mt-3 text-sm text-white/75 leading-6">
            Open this portfolio on desktop for the complete macOS-style experience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isBooting && <BootScreen progress={bootProgress} />}
        {isLockScreenVisible && !isBooting && (
          <LockScreen
            time={time}
            wallpaper={wallpaper}
            batteryPercent={batteryPercent}
            onUnlock={() => setIsLockScreenVisible(false)}
            onPowerRequest={openPowerOptions}
          />
        )}
        {isPowerOptionsOpen && (
          <PowerOptionsOverlay
            selectedAction={selectedPowerAction}
            onCancel={closePowerOptions}
            onConfirm={handlePowerActionConfirm}
          />
        )}
      </AnimatePresence>

      <div 
        className="relative w-screen h-screen overflow-hidden font-sans select-none bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${wallpaper})`, filter: desktopFilter }}
        onContextMenu={handleDesktopContextMenu}
        onDoubleClick={handleDesktopDoubleClick}
      >
      {/* Overlay to ensure readability if wallpaper is too bright */}
      <div className={`absolute inset-0 pointer-events-none transition-colors duration-700 ${isDarkMode ? 'bg-black/40' : 'bg-black/10'}`} />
      
      {/* Stage Manager Sidebar */}
      <AnimatePresence>
        {isStageManager && (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            data-no-desktop-context-menu
            className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-[50]"
          >
            {(Object.values(windows) as WindowState[]).filter(w => w.isOpen && !w.isMinimized).map((win, i) => (
              <motion.div
                key={win.id}
                whileHover={{ scale: 1.1, x: 10 }}
                className="w-24 aspect-video bg-white/20 backdrop-blur-xl rounded-lg border border-white/30 shadow-lg cursor-pointer overflow-hidden group"
                onClick={() => {
                  setWindows(prev => ({
                    ...prev,
                    [win.id]: { ...prev[win.id], isMinimized: false }
                  }));
                  setMaxZ(prev => prev + 1);
                  setWindows(prev => ({
                    ...prev,
                    [win.id]: { ...prev[win.id], zIndex: maxZ + 1 }
                  }));
                }}
              >
                <div className="w-full h-full flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                  {INITIAL_WINDOWS[win.id].icon}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Center Panel */}
      <AnimatePresence>
        {isControlCenterOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            data-no-desktop-context-menu
            className={`fixed top-9 right-4 w-[320px] backdrop-blur-2xl rounded-[24px] shadow-2xl border p-4 z-[10000] select-none ${isDarkMode ? 'bg-zinc-900/60 border-white/10 text-white' : 'bg-white/60 border-black/5 text-black'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 gap-3">
              {/* Connectivity Block */}
              <div className={`${isDarkMode ? 'bg-white/10' : 'bg-white/50'} rounded-2xl p-3 shadow-sm border ${isDarkMode ? 'border-white/10' : 'border-white/20'} flex flex-col gap-3`}>
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 ${currentAccent.bg} rounded-full flex items-center justify-center text-white shadow-sm`}>
                    <Wifi size={14} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold truncate">Wi-Fi</p>
                    <p className="text-[9px] opacity-50 truncate">Home-Network</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 ${currentAccent.bg} rounded-full flex items-center justify-center text-white shadow-sm`}>
                    <Bluetooth size={14} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold truncate">Bluetooth</p>
                    <p className="text-[9px] opacity-50 truncate">On</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 ${currentAccent.bg} rounded-full flex items-center justify-center text-white shadow-sm`}>
                    <Airplay size={14} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold truncate">AirDrop</p>
                    <p className="text-[9px] opacity-50 truncate">Everyone</p>
                  </div>
                </div>
              </div>

              {/* Music Widget */}
              <div className={`${isDarkMode ? 'bg-white/10' : 'bg-white/50'} rounded-2xl p-3 shadow-sm border ${isDarkMode ? 'border-white/10' : 'border-white/20'} flex flex-col`}>
                <div className="flex gap-3 items-start">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-white/5' : 'bg-black/5'} ${isMusicPlaying ? 'shadow-[0_0_0_1px_rgba(10,132,255,0.45),0_0_18px_rgba(10,132,255,0.35)]' : ''}`}>
                    <Music size={20} className={`opacity-70 ${isMusicPlaying ? 'animate-pulse' : 'opacity-35'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold truncate">{activeTrack.title}</p>
                    <p className="text-[9px] opacity-60 truncate">{activeTrack.artist}</p>
                  </div>
                </div>

                <div className="mt-2">
                  <input
                    type="range"
                    min={0}
                    max={clampedMusicDuration}
                    step={0.1}
                    value={clampedMusicTime}
                    onChange={handleMusicSeek}
                    className="w-full h-1.5 accent-[#0A84FF] bg-transparent cursor-pointer"
                    aria-label="Music progress"
                  />
                  <div className="mt-1 flex items-center justify-between text-[9px] opacity-60">
                    <span>{formatPlaybackTime(musicCurrentTime)}</span>
                    <span>{formatPlaybackTime(musicDuration)}</span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-center gap-2.5">
                  <button
                    onClick={playPreviousTrack}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'hover:bg-white/15' : 'hover:bg-black/10'}`}
                    aria-label="Previous track"
                  >
                    <SkipBack size={14} className="opacity-80" />
                  </button>
                  <button
                    onClick={toggleMusicPlayback}
                    className="w-8 h-8 rounded-full bg-[#0A84FF] text-white flex items-center justify-center shadow-[0_0_12px_rgba(10,132,255,0.45)] hover:brightness-110 transition"
                    aria-label={isMusicPlaying ? 'Pause music' : 'Play music'}
                  >
                    {isMusicPlaying ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
                  </button>
                  <button
                    onClick={playNextTrack}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'hover:bg-white/15' : 'hover:bg-black/10'}`}
                    aria-label="Next track"
                  >
                    <SkipForward size={14} className="opacity-80" />
                  </button>
                </div>

                {musicError && (
                  <p className="mt-1 text-[9px] text-rose-300/90 truncate">{musicError}</p>
                )}
              </div>

              {/* Focus & Display Row */}
              <div className="col-span-2 grid grid-cols-4 gap-3">
                <button 
                  onClick={() => setAppearanceMode(isDarkMode ? 'Light' : 'Dark')}
                  className={`aspect-square rounded-2xl shadow-sm border flex flex-col items-center justify-center gap-1 transition-all ${isDarkMode ? `${currentAccent.bg} text-white border-white/10` : 'bg-white/50 text-black border-white/20'}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white text-black' : 'bg-indigo-500 text-white'}`}>
                    {isDarkMode ? <Sun size={14} /> : <Moon size={14} fill="white" />}
                  </div>
                </button>
                <button 
                  onClick={() => setIsNightShift(!isNightShift)}
                  className={`aspect-square rounded-2xl shadow-sm border flex flex-col items-center justify-center gap-1 transition-all ${isNightShift ? `${currentAccent.bg} text-white border-white/10` : 'bg-white/50 text-black border-white/20'}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isNightShift ? 'bg-white text-orange-500' : 'bg-orange-500 text-white'}`}>
                    <Sun size={14} />
                  </div>
                </button>
                <button 
                  onClick={() => setIsStageManager(!isStageManager)}
                  className={`aspect-square rounded-2xl shadow-sm border flex flex-col items-center justify-center gap-1 transition-all ${isStageManager ? `${currentAccent.bg} text-white border-white/10` : 'bg-white/50 text-black border-white/20'}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isStageManager ? `bg-white ${currentAccent.text}` : 'bg-white text-black shadow-sm'}`}>
                    <Layout size={14} className={isStageManager ? currentAccent.text : 'text-black'} />
                  </div>
                </button>
                <button 
                  className={`aspect-square rounded-2xl shadow-sm border flex flex-col items-center justify-center gap-1 transition-all ${isDarkMode ? 'bg-white/10 border-white/10 text-white' : 'bg-white/50 text-black border-white/20'}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white/10' : 'bg-black/5'}`}>
                    <Monitor size={14} />
                  </div>
                </button>
              </div>

              {/* Sliders Block */}
              <div className={`col-span-2 ${isDarkMode ? 'bg-white/10' : 'bg-white/50'} rounded-2xl p-4 shadow-sm border ${isDarkMode ? 'border-white/10' : 'border-white/20'} space-y-4`}>
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[11px] font-bold opacity-60">Display</p>
                    <p className="text-[10px] font-semibold opacity-55">{brightness}%</p>
                  </div>
                  <div className={`relative h-7 ${isDarkMode ? 'bg-white/10' : 'bg-black/5'} rounded-full overflow-hidden flex items-center px-2`}>
                    <div 
                      className={`absolute left-0 top-0 h-full ${isDarkMode ? 'bg-white/20' : 'bg-white'} shadow-sm transition-all duration-300`} 
                      style={{ width: `${brightness}%` }} 
                    />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={brightness}
                      onChange={handleBrightnessChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <Sun size={14} className="relative z-0 opacity-40" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[11px] font-bold opacity-60">Sound</p>
                    <p className="text-[10px] font-semibold opacity-55">{volume}%</p>
                  </div>
                  <div className={`relative h-7 ${isDarkMode ? 'bg-white/10' : 'bg-black/5'} rounded-full overflow-hidden flex items-center px-2`}>
                    <div 
                      className={`absolute left-0 top-0 h-full ${isDarkMode ? 'bg-white/20' : 'bg-white'} shadow-sm transition-all duration-300`} 
                      style={{ width: `${volume}%` }} 
                    />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={volume}
                      onChange={handleVolumeChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <Volume2 size={14} className="relative z-0 opacity-40" />
                  </div>
                </div>
              </div>
            </div>

            {/* Battery Info */}
            <div className="mt-3 flex items-center justify-between px-2">
              <div className="flex items-center gap-2 opacity-60">
                <Battery size={14} />
                <span className="text-[10px] font-bold">Battery: {batteryPercent !== null ? `${batteryPercent}%` : 'N/A'}</span>
              </div>
              <p className={`text-[10px] font-bold ${currentAccent.text600}`}>Power Settings</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu Bar */}
      <div data-no-desktop-context-menu className={`fixed top-0 w-full h-8 ${isDarkMode ? 'bg-black/5' : 'bg-white/5'} backdrop-blur-2xl border-b border-white/10 flex items-center px-4 justify-between z-[9999] text-[13px] font-medium text-white shadow-sm transition-all duration-300`}>
        <div className="flex items-center gap-1">
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'apple' ? null : 'apple'); }}
              className={`p-1.5 rounded-md transition-colors ${activeMenu === 'apple' ? 'bg-white/20' : 'hover:bg-white/10'}`}
            >
              <img src={appleMenuIcon} alt="Apple" className="w-4 h-4 object-contain" />
            </button>
            <AnimatePresence>
              {activeMenu === 'apple' && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className={`absolute top-8 left-0 w-56 ${isDarkMode ? 'bg-zinc-900/70' : 'bg-white/70'} backdrop-blur-3xl rounded-xl shadow-2xl border border-white/20 p-1.5 z-[10000] text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}
                >
                  <div className="px-3 py-1.5 hover:bg-blue-500 hover:text-white rounded-lg cursor-default transition-colors">About This Mac</div>
                  <div className={`h-px ${isDarkMode ? 'bg-white/10' : 'bg-black/5'} my-1 mx-2`} />
                  <button onClick={() => toggleWindow('settings')} className="w-full text-left px-3 py-1.5 hover:bg-blue-500 hover:text-white rounded-lg cursor-default transition-colors">System Settings</button>
                  <div className="px-3 py-1.5 hover:bg-blue-500 hover:text-white rounded-lg cursor-default transition-colors">App Store</div>
                  <div className={`h-px ${isDarkMode ? 'bg-white/10' : 'bg-black/5'} my-1 mx-2`} />
                  <div className="px-3 py-1.5 hover:bg-blue-500 hover:text-white rounded-lg cursor-default transition-colors">Recent Items</div>
                  <div className={`h-px ${isDarkMode ? 'bg-white/10' : 'bg-black/5'} my-1 mx-2`} />
                  <div className="px-3 py-1.5 hover:bg-blue-500 hover:text-white rounded-lg cursor-default transition-colors">Force Quit</div>
                  <div className={`h-px ${isDarkMode ? 'bg-white/10' : 'bg-black/5'} my-1 mx-2`} />
                  <button
                    onClick={() => openPowerOptions('sleep')}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-500 hover:text-white rounded-lg cursor-default transition-colors"
                  >
                    Sleep
                  </button>
                  <button
                    onClick={() => openPowerOptions('restart')}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-500 hover:text-white rounded-lg cursor-default transition-colors"
                  >
                    Restart
                  </button>
                  <button
                    onClick={() => openPowerOptions('shutDown')}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-500 hover:text-white rounded-lg cursor-default transition-colors"
                  >
                    Shut Down
                  </button>
                  <div className={`h-px ${isDarkMode ? 'bg-white/10' : 'bg-black/5'} my-1 mx-2`} />
                  <div className="px-3 py-1.5 hover:bg-blue-500 hover:text-white rounded-lg cursor-default transition-colors">Lock Screen</div>
                  <div className="px-3 py-1.5 hover:bg-blue-500 hover:text-white rounded-lg cursor-default transition-colors">Log Out Sumit Gautam</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {menuItems.map((menu, menuIndex) => (
            <div key={menu.id} className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === menu.id ? null : menu.id); }}
                className={`px-3 py-1 rounded-md transition-colors ${activeMenu === menu.id ? 'bg-white/20' : 'hover:bg-white/10'} ${menuIndex === 0 ? 'font-bold' : 'font-normal opacity-90'}`}
              >
                {menu.label}
              </button>
              <AnimatePresence>
                {activeMenu === menu.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className={`absolute top-8 left-0 w-48 ${isDarkMode ? 'bg-zinc-900/70' : 'bg-white/70'} backdrop-blur-3xl rounded-xl shadow-2xl border border-white/20 p-1.5 z-[10000] text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}
                  >
                    <div className="px-3 py-1.5 hover:bg-blue-500 hover:text-white rounded-lg cursor-default transition-colors">New {menu.label} Item</div>
                    <div className="px-3 py-1.5 hover:bg-blue-500 hover:text-white rounded-lg cursor-default transition-colors">Open</div>
                    <div className={`h-px ${isDarkMode ? 'bg-white/10' : 'bg-black/5'} my-1 mx-2`} />
                    <div className="px-3 py-1.5 hover:bg-blue-500 hover:text-white rounded-lg cursor-default transition-colors">Close Window</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Wifi size={16} />
            <Battery size={16} />
            <button 
              onClick={(e) => { e.stopPropagation(); setIsControlCenterOpen(!isControlCenterOpen); setDesktopContextMenu(null); setActiveMenu(null); }}
              className={`p-1 rounded-md transition-colors ${isControlCenterOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
            >
              <SlidersHorizontal size={16} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsWidgetsOpen(!isWidgetsOpen);
                setIsWidgetPickerOpen(false);
                setDesktopContextMenu(null);
                setActiveMenu(null);
              }}
              className={`p-1 rounded-md transition-colors ${isWidgetsOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
            >
              <Layout size={16} />
            </button>
            <Search size={16} />
          </div>
          <div className="flex items-center gap-1 cursor-default hover:bg-white/10 px-2 py-1 rounded-md transition-colors">
            <span>{time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <span>{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
          </div>
        </div>
      </div>

      {/* Desktop Icons (Optional, but adds to the feel) */}
      <div className="absolute top-12 right-6 flex flex-col gap-8 items-center">
        <div className="flex flex-col items-center gap-1 group cursor-default">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <Briefcase size={32} className="text-white/80" />
          </div>
          <span className="text-white text-[10px] font-medium shadow-sm">sumitgautam.pdf</span>
        </div>
      </div>

      {/* Desktop Widgets */}
      <div className="absolute inset-0 pointer-events-none z-[7000]">
        {widgets.map((widgetId) => {
          const position = widgetPositions[widgetId] ?? DEFAULT_WIDGET_POSITIONS[widgetId];
          return (
            <div
              key={`desktop-${widgetId}`}
              style={{ left: position.x, top: position.y }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                startWidgetDrag(widgetId, e);
              }}
              className={`absolute pointer-events-auto select-none ${getWidgetWidthClass(widgetId)} ${
                draggingWidgetId === widgetId ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              {renderWidgetContent(widgetId)}
            </div>
          );
        })}
      </div>

      {/* Windows Container */}
      <div className="absolute inset-0 pt-7 pb-20">
        <AnimatePresence>
          {(Object.values(windows) as WindowState[]).map((win) => win.isOpen && !win.isMinimized && (
            <Window 
              key={win.id}
              win={win}
              onClose={() => closeWindow(win.id)}
              onMinimize={() => minimizeWindow(win.id)}
              onMaximize={() => maximizeWindow(win.id)}
              onFocus={() => focusWindow(win.id)}
              isDarkMode={isDarkMode}
            >
              {win.id === 'about' && (
                <AboutWindowContent
                  isDarkMode={isDarkMode}
                  activeTab={aboutActiveTab}
                  onTabChange={setAboutActiveTab}
                />
              )}

              {win.id === 'safari' && (
                <div
                  className={`h-full flex flex-col ${
                    isDarkMode ? 'bg-[#111214]/80 text-white' : 'bg-[#f5f5f7]/80 text-black'
                  }`}
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", sans-serif',
                  }}
                >
                  <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-white/10' : 'border-black/[0.08]'}`}>
                    <div className="flex items-center gap-2.5">
                      <button
                        className={`w-8 h-8 rounded-full border inline-flex items-center justify-center transition-colors ${
                          isDarkMode
                            ? 'bg-white/8 border-white/12 hover:bg-white/14'
                            : 'bg-black/[0.03] border-black/[0.08] hover:bg-black/[0.06]'
                        }`}
                        aria-label="Back"
                      >
                        <ChevronLeft size={14} className={isDarkMode ? 'text-white/80' : 'text-black/70'} />
                      </button>
                      <button
                        className={`w-8 h-8 rounded-full border inline-flex items-center justify-center transition-colors ${
                          isDarkMode
                            ? 'bg-white/8 border-white/12 hover:bg-white/14'
                            : 'bg-black/[0.03] border-black/[0.08] hover:bg-black/[0.06]'
                        }`}
                        aria-label="Forward"
                      >
                        <ChevronRight size={14} className={isDarkMode ? 'text-white/80' : 'text-black/70'} />
                      </button>
                      <button
                        className={`w-8 h-8 rounded-full border inline-flex items-center justify-center transition-colors ${
                          isDarkMode
                            ? 'bg-white/8 border-white/12 hover:bg-white/14'
                            : 'bg-black/[0.03] border-black/[0.08] hover:bg-black/[0.06]'
                        }`}
                        aria-label="Reload"
                      >
                        <RotateCcw size={13} className={isDarkMode ? 'text-white/80' : 'text-black/70'} />
                      </button>

                      <div
                        className={`flex-1 h-9 rounded-xl border px-3 inline-flex items-center gap-2.5 ${
                          isDarkMode
                            ? 'bg-white/8 border-white/12 text-white/82'
                            : 'bg-white/70 border-black/[0.08] text-black/72'
                        }`}
                      >
                        <Search size={13} className={isDarkMode ? 'text-white/45' : 'text-black/40'} />
                        <span className="text-[13px] truncate">sumitgautam.dev/portfolio</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                    <div className="mx-auto max-w-4xl space-y-4">
                      <section
                        className={`rounded-2xl border p-5 backdrop-blur-xl ${
                          isDarkMode
                            ? 'bg-white/5 border-white/10'
                            : 'bg-white/70 border-black/[0.08]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${isDarkMode ? 'text-white/50' : 'text-black/45'}`}>
                              Start Page
                            </p>
                            <h2 className={`mt-2 text-[30px] font-semibold tracking-[-0.02em] ${isDarkMode ? 'text-white/92' : 'text-black/85'}`}>
                              Safari
                            </h2>
                            <p className={`mt-2 text-[13px] leading-6 ${isDarkMode ? 'text-white/70' : 'text-black/60'}`}>
                              Quick access to portfolio links and developer profiles in a macOS-style browsing view.
                            </p>
                          </div>
                          <div className="w-11 h-11 rounded-xl bg-[#0A84FF]/22 border border-[#0A84FF]/45 text-[#0A84FF] flex items-center justify-center shrink-0">
                            <Compass size={20} />
                          </div>
                        </div>
                      </section>

                      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {SAFARI_FAVORITES.map((item) => (
                          <motion.a
                            key={item.id}
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.18 }}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`rounded-2xl border p-4 transition-colors ${
                              isDarkMode
                                ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                : 'bg-white/70 border-black/[0.08] hover:bg-white/90'
                            }`}
                          >
                            <p className={`text-[14px] font-semibold ${isDarkMode ? 'text-white/88' : 'text-black/82'}`}>{item.title}</p>
                            <p className={`mt-1 text-[12px] ${isDarkMode ? 'text-white/65' : 'text-black/56'}`}>{item.subtitle}</p>
                            <div className={`mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium ${isDarkMode ? 'text-[#79b7ff]' : 'text-[#0A5ED6]'}`}>
                              Open
                              <ExternalLink size={12} />
                            </div>
                          </motion.a>
                        ))}
                      </section>

                      <section
                        className={`rounded-2xl border p-4 ${
                          isDarkMode
                            ? 'bg-white/5 border-white/10'
                            : 'bg-white/70 border-black/[0.08]'
                        }`}
                      >
                        <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${isDarkMode ? 'text-white/50' : 'text-black/45'}`}>
                          Quick Actions
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => toggleWindow('projects')}
                            className={`h-9 px-3.5 rounded-lg border text-[12px] font-medium transition-colors ${
                              isDarkMode
                                ? 'bg-white/8 border-white/14 text-white/86 hover:bg-white/14'
                                : 'bg-black/[0.03] border-black/[0.1] text-black/72 hover:bg-black/[0.06]'
                            }`}
                          >
                            Open Projects
                          </button>
                          <button
                            onClick={() => toggleWindow('contact')}
                            className={`h-9 px-3.5 rounded-lg border text-[12px] font-medium transition-colors ${
                              isDarkMode
                                ? 'bg-[#0A84FF]/20 border-[#0A84FF]/40 text-[#8dc3ff] hover:bg-[#0A84FF]/30'
                                : 'bg-[#0A84FF]/14 border-[#0A84FF]/30 text-[#0A5ED6] hover:bg-[#0A84FF]/20'
                            }`}
                          >
                            Contact Me
                          </button>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              )}

              {win.id === 'projects' && (
                <div className="space-y-4">
                  <div
                    className={`rounded-2xl border p-5 backdrop-blur-xl ${
                      isDarkMode
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-white/75 border-black/[0.08] text-black'
                    }`}
                  >
                    <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${isDarkMode ? 'text-white/50' : 'text-black/45'}`}>
                      Portfolio
                    </p>
                    <h2 className={`mt-2 text-[28px] font-semibold tracking-[-0.02em] ${isDarkMode ? 'text-white/92' : 'text-black/85'}`}>
                      Featured Projects
                    </h2>
                    <p className={`mt-2 text-[13px] leading-6 max-w-2xl ${isDarkMode ? 'text-white/70' : 'text-black/60'}`}>
                      Production-focused full stack work spanning automation, web applications, and data-driven systems.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {PROJECTS.map((project) => {
                      const hasPublicLink = project.link.trim() !== '#';
                      return (
                        <motion.article
                          key={project.id}
                          whileHover={{ y: -2 }}
                          transition={{ duration: 0.18 }}
                          className={`rounded-2xl border p-4 backdrop-blur-xl ${
                            isDarkMode
                              ? 'bg-white/5 border-white/10'
                              : 'bg-white/70 border-black/[0.08]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                                  isDarkMode
                                    ? 'bg-white/10 text-white/75 border border-white/15'
                                    : 'bg-black/[0.05] text-black/65 border border-black/[0.08]'
                                }`}>
                                  {project.category}
                                </span>
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                  isDarkMode
                                    ? 'bg-[#0A84FF]/20 text-[#79b7ff] border border-[#0A84FF]/40'
                                    : 'bg-[#0A84FF]/12 text-[#005ec2] border border-[#0A84FF]/25'
                                }`}>
                                  {project.status}
                                </span>
                              </div>
                              <h3 className={`mt-3 text-[18px] font-semibold tracking-[-0.01em] ${isDarkMode ? 'text-white/90' : 'text-black/85'}`}>
                                {project.title}
                              </h3>
                            </div>

                            {hasPublicLink ? (
                              <a
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`h-8 px-3 rounded-lg border text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors ${
                                  isDarkMode
                                    ? 'border-white/15 bg-white/8 text-white/85 hover:bg-white/14'
                                    : 'border-black/[0.1] bg-black/[0.03] text-black/70 hover:bg-black/[0.06]'
                                }`}
                              >
                                View
                                <ExternalLink size={13} />
                              </a>
                            ) : (
                              <span className={`h-8 px-3 rounded-lg border text-[11px] font-medium inline-flex items-center ${
                                isDarkMode
                                  ? 'border-white/12 bg-white/6 text-white/55'
                                  : 'border-black/[0.08] bg-black/[0.03] text-black/45'
                              }`}>
                                Private
                              </span>
                            )}
                          </div>

                          <p className={`mt-3 text-[13px] leading-6 ${isDarkMode ? 'text-white/72' : 'text-black/62'}`}>
                            {project.description}
                          </p>

                          <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-black/[0.08]'}`}>
                            <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${isDarkMode ? 'text-white/45' : 'text-black/40'}`}>
                              Tech Stack
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {project.tech.map((tech, techIndex) => (
                                <span
                                  key={`${project.id}-${tech}-${techIndex}`}
                                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium ${
                                    isDarkMode
                                      ? 'bg-white/10 border border-white/14 text-white/80'
                                      : 'bg-black/[0.05] border border-black/[0.08] text-black/68'
                                  }`}
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className={`mt-4 rounded-xl border px-3.5 py-2.5 ${
                            isDarkMode
                              ? 'border-white/10 bg-white/5'
                              : 'border-black/[0.08] bg-black/[0.02]'
                          }`}>
                            <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${isDarkMode ? 'text-white/45' : 'text-black/40'}`}>
                              Impact
                            </p>
                            <p className={`mt-1 text-[12px] leading-5 ${isDarkMode ? 'text-white/70' : 'text-black/60'}`}>
                              {project.impact}
                            </p>
                          </div>
                        </motion.article>
                      );
                    })}
                  </div>
                </div>
              )}

              {win.id === 'skills' && (
                <LaunchpadSkills
                  isDarkMode={isDarkMode}
                  onClose={() => closeWindow('skills')}
                  onMinimize={() => minimizeWindow('skills')}
                  onMaximize={() => maximizeWindow('skills')}
                />
              )}

              {win.id === 'experience' && (
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-black/10 before:to-transparent">
                  {EXPERIENCE.map((e, i) => (
                    <div key={i} className="relative pl-12">
                      <div className="absolute left-0 w-10 h-10 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center shadow-sm z-10">
                        <Briefcase size={16} className="text-blue-500" />
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-black/5 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg text-black/80">{e.role}</h3>
                          <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md">{e.period}</span>
                        </div>
                        <p className="text-sm font-medium text-black/50 mb-3">{e.company}</p>
                        <p className="text-sm text-black/70 leading-relaxed">{e.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {win.id === 'contact' && (
                <div className="space-y-5">
                  <div
                    className={`rounded-2xl border p-5 backdrop-blur-xl ${
                      isDarkMode
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-white/75 border-black/[0.08] text-black'
                    }`}
                  >
                    <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${isDarkMode ? 'text-white/50' : 'text-black/45'}`}>
                      Contact
                    </p>
                    <h2 className={`mt-2 text-[28px] font-semibold tracking-[-0.02em] ${isDarkMode ? 'text-white/92' : 'text-black/85'}`}>
                      Let&apos;s Connect
                    </h2>
                    <p className={`mt-2 text-[13px] leading-6 ${isDarkMode ? 'text-white/70' : 'text-black/60'}`}>
                      Open to full-stack roles, freelance projects, and technical training opportunities.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {['Available for work', 'Quick response', 'Remote friendly'].map((item) => (
                        <span
                          key={item}
                          className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                            isDarkMode
                              ? 'bg-white/10 border border-white/15 text-white/80'
                              : 'bg-black/[0.05] border border-black/[0.08] text-black/70'
                          }`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <div
                      className={`rounded-2xl border p-3 backdrop-blur-xl ${
                        isDarkMode
                          ? 'bg-white/5 border-white/10'
                          : 'bg-white/70 border-black/[0.08]'
                      }`}
                    >
                      <div className="space-y-2">
                        <motion.button
                          whileHover={{ y: -1 }}
                          transition={{ duration: 0.18 }}
                          onClick={copyEmail}
                          className={`w-full rounded-xl border px-3.5 py-3 text-left flex items-center justify-between gap-3 transition-colors ${
                            isDarkMode
                              ? 'bg-white/5 border-white/10 hover:bg-white/10'
                              : 'bg-black/[0.02] border-black/[0.06] hover:bg-black/[0.05]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#0A84FF]/20 text-[#0A84FF] flex items-center justify-center">
                              <Mail size={18} />
                            </div>
                            <div>
                              <p className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${isDarkMode ? 'text-white/45' : 'text-black/40'}`}>Email</p>
                              <p className={`text-[13px] font-medium ${isDarkMode ? 'text-white/82' : 'text-black/72'}`}>Sumitgautam970@gmail.com</p>
                            </div>
                          </div>
                          {copiedField === 'email'
                            ? <Check size={16} className="text-emerald-400" />
                            : <Copy size={16} className={isDarkMode ? 'text-white/35' : 'text-black/30'} />}
                        </motion.button>

                        <motion.button
                          whileHover={{ y: -1 }}
                          transition={{ duration: 0.18 }}
                          onClick={copyPhone}
                          className={`w-full rounded-xl border px-3.5 py-3 text-left flex items-center justify-between gap-3 transition-colors ${
                            isDarkMode
                              ? 'bg-white/5 border-white/10 hover:bg-white/10'
                              : 'bg-black/[0.02] border-black/[0.06] hover:bg-black/[0.05]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/18 text-emerald-400 flex items-center justify-center">
                              <Phone size={18} />
                            </div>
                            <div>
                              <p className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${isDarkMode ? 'text-white/45' : 'text-black/40'}`}>Phone</p>
                              <p className={`text-[13px] font-medium ${isDarkMode ? 'text-white/82' : 'text-black/72'}`}>+91-9310513770</p>
                            </div>
                          </div>
                          {copiedField === 'phone'
                            ? <Check size={16} className="text-emerald-400" />
                            : <Copy size={16} className={isDarkMode ? 'text-white/35' : 'text-black/30'} />}
                        </motion.button>

                        <motion.a
                          whileHover={{ y: -1 }}
                          transition={{ duration: 0.18 }}
                          href="https://www.linkedin.com/in/sumit--gautam"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full rounded-xl border px-3.5 py-3 text-left flex items-center justify-between gap-3 transition-colors ${
                            isDarkMode
                              ? 'bg-white/5 border-white/10 hover:bg-white/10'
                              : 'bg-black/[0.02] border-black/[0.06] hover:bg-black/[0.05]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#0A66C2] text-white flex items-center justify-center">
                              <Linkedin size={16} />
                            </div>
                            <div>
                              <p className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${isDarkMode ? 'text-white/45' : 'text-black/40'}`}>LinkedIn</p>
                              <p className={`text-[13px] font-medium ${isDarkMode ? 'text-white/82' : 'text-black/72'}`}>linkedin.com/in/sumit--gautam</p>
                            </div>
                          </div>
                          <ExternalLink size={15} className={isDarkMode ? 'text-white/40' : 'text-black/35'} />
                        </motion.a>
                      </div>
                    </div>

                    <div
                      className={`rounded-2xl border p-4 backdrop-blur-xl ${
                        isDarkMode
                          ? 'bg-white/5 border-white/10'
                          : 'bg-white/70 border-black/[0.08]'
                      }`}
                    >
                      <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${isDarkMode ? 'text-white/50' : 'text-black/45'}`}>
                        Quick Actions
                      </p>
                      <div className="mt-3 space-y-2">
                        <a
                          href="mailto:Sumitgautam970@gmail.com"
                          className={`w-full h-10 rounded-xl border text-[13px] font-medium inline-flex items-center justify-center gap-2 transition-colors ${
                            isDarkMode
                              ? 'border-[#0A84FF]/50 bg-[#0A84FF]/20 text-white hover:bg-[#0A84FF]/30'
                              : 'border-[#0A84FF]/35 bg-[#0A84FF]/14 text-[#005ec2] hover:bg-[#0A84FF]/20'
                          }`}
                        >
                          <Mail size={15} />
                          Send Email
                        </a>
                        <a
                          href="tel:+919310513770"
                          className={`w-full h-10 rounded-xl border text-[13px] font-medium inline-flex items-center justify-center gap-2 transition-colors ${
                            isDarkMode
                              ? 'border-white/15 bg-white/8 text-white/90 hover:bg-white/14'
                              : 'border-black/[0.1] bg-black/[0.03] text-black/75 hover:bg-black/[0.06]'
                          }`}
                        >
                          <Phone size={15} />
                          Call Now
                        </a>
                      </div>

                      <div className={`my-4 h-px ${isDarkMode ? 'bg-white/10' : 'bg-black/[0.08]'}`} />

                      <p className={`text-[12px] leading-6 ${isDarkMode ? 'text-white/65' : 'text-black/58'}`}>
                        “The best way to predict the future is to invent it.”
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {win.id === 'terminal' && (
                <TerminalContent clearSignal={terminalClearSignal} />
              )}

              {win.id === 'playground' && (
                <PlaygroundContent runSignal={playgroundRunSignal} />
              )}

              {win.id === 'settings' && (
                <SettingsContent 
                  currentWallpaper={wallpaper} 
                  onWallpaperChange={setWallpaper} 
                  appearanceMode={appearanceMode}
                  setAppearanceMode={setAppearanceMode}
                  accentColor={accentColor}
                  setAccentColor={setAccentColor}
                  currentAccent={currentAccent}
                  dockSize={dockSize}
                  setDockSize={setDockSize}
                  dockMagnification={dockMagnification}
                  setDockMagnification={setDockMagnification}
                  isDarkMode={isDarkMode}
                />
              )}
            </Window>
          ))}
        </AnimatePresence>
      </div>

      {/* Dock */}
      <div data-no-desktop-context-menu className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[10000]">
        <motion.div 
          onMouseMove={(e) => mouseX.set(e.pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
          style={{ height: dockSize + 24 }}
          className={`flex items-end gap-3 px-4 pb-3 ${isDarkMode ? 'bg-zinc-900/40' : 'bg-white/10'} backdrop-blur-3xl rounded-[32px] border border-white/10 shadow-2xl`}
        >
          {Object.values(INITIAL_WINDOWS).map((win) => (
            <DockIcon 
              key={win.id}
              win={windows[win.id]}
              onClick={() => toggleWindow(win.id)}
              isActive={windows[win.id].isOpen}
              mouseX={mouseX}
              currentAccent={currentAccent}
              dockSize={dockSize}
              dockMagnification={dockMagnification}
            />
          ))}
          <div className="w-px h-10 bg-white/20 mx-1 self-center" />
          <DockIcon 
            win={{
              id: 'trash' as any,
              title: 'Bin',
              icon: <img src={binAppIcon} alt="Bin" className="block w-full h-full object-cover scale-110" />,
              isOpen: false,
              isMinimized: false,
              isMaximized: false
            }}
            onClick={() => {}}
            isActive={false}
            mouseX={mouseX}
            currentAccent={currentAccent}
            dockSize={dockSize}
            dockMagnification={dockMagnification}
          />
        </motion.div>
      </div>

      {/* Widgets Panel */}
      <AnimatePresence>
        {isWidgetsOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            data-no-desktop-context-menu
            className={`fixed top-12 right-4 bottom-24 w-80 ${isDarkMode ? 'bg-zinc-900/40' : 'bg-white/40'} backdrop-blur-3xl rounded-[32px] border border-white/20 shadow-2xl z-[9000] p-6 overflow-y-auto custom-scrollbar`}
          >
            <div className="space-y-6">
              <header className="flex justify-between items-center">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>Widgets</h2>
                <div className="relative flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsWidgetPickerOpen((prev) => !prev);
                    }}
                    className={`p-2 ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'} rounded-full transition-colors`}
                  >
                    <Plus size={16} className={isDarkMode ? 'text-white' : 'text-black'} />
                  </button>
                  {isWidgetPickerOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className={`absolute top-11 right-0 w-40 rounded-xl border shadow-2xl p-2 z-[9100] ${
                        isDarkMode ? 'bg-zinc-900/90 border-white/10' : 'bg-white/90 border-black/10'
                      }`}
                    >
                      <p className={`px-2 pb-1 text-[11px] font-semibold ${isDarkMode ? 'text-white/70' : 'text-black/50'}`}>
                        Add Widget
                      </p>
                      {availableWidgetOptions.length === 0 ? (
                        <p className={`px-2 py-1 text-xs ${isDarkMode ? 'text-white/50' : 'text-black/40'}`}>All widgets added</p>
                      ) : (
                        availableWidgetOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => addWidget(option.id)}
                            className={`w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors ${
                              isDarkMode ? 'text-white hover:bg-white/10' : 'text-black/80 hover:bg-black/5'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setIsWidgetsOpen(false);
                      setIsWidgetPickerOpen(false);
                    }}
                    className={`p-2 ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'} rounded-full transition-colors`}
                  >
                    <ExternalLink size={16} className={isDarkMode ? 'text-white' : 'text-black'} />
                  </button>
                </div>
              </header>

              <div className="grid grid-cols-2 gap-4">
                {widgets.length === 0 && (
                  <div className={`col-span-2 rounded-3xl p-5 border border-dashed text-center ${isDarkMode ? 'border-white/20 text-white/60' : 'border-black/20 text-black/50'}`}>
                    No widgets added. Click + to add widgets.
                  </div>
                )}

                {widgets.map((widgetId) => {
                  const widgetOption = WIDGET_OPTIONS.find((option) => option.id === widgetId);
                  if (!widgetOption) return null;

                  return (
                    <div key={widgetId} className={`relative ${widgetOption.layout === 'full' ? 'col-span-2' : ''}`}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeWidget(widgetId);
                        }}
                        className={`absolute top-2 right-2 z-10 p-1 rounded-full transition-colors ${
                          isDarkMode ? 'bg-black/30 hover:bg-black/50 text-white/80' : 'bg-white/70 hover:bg-white text-black/60'
                        }`}
                      >
                        <X size={12} />
                      </button>
                      {renderWidgetContent(widgetId)}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {desktopContextMenu && (
          <DesktopContextMenu
            position={desktopContextMenu}
            isDarkMode={isDarkMode}
            useStacks={useStacks}
            onAction={handleDesktopContextMenuAction}
            onClose={() => setDesktopContextMenu(null)}
          />
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
    </>
  );
}
