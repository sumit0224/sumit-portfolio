import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Battery,
  Bell,
  Brush,
  Check,
  Command,
  Image as ImageIcon,
  Layout,
  Monitor,
  Moon,
  Search,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Upload,
  Volume2,
} from 'lucide-react';

type AppearanceMode = 'Light' | 'Dark' | 'Auto';
type AccentColor = 'blue' | 'purple' | 'pink' | 'red' | 'orange' | 'yellow' | 'green' | 'zinc';
type SettingsTab =
  | 'general'
  | 'appearance'
  | 'control-center'
  | 'desktop-dock'
  | 'displays'
  | 'wallpaper'
  | 'screen-saver'
  | 'notifications'
  | 'sound'
  | 'focus'
  | 'battery'
  | 'privacy-security';

type ToggleKey =
  | 'menuBarClock'
  | 'menuBarBattery'
  | 'showInControlCenter'
  | 'showInMenuBar'
  | 'autoHideDock'
  | 'dockMagnificationEnabled'
  | 'showRecentApps'
  | 'trueTone'
  | 'nightShift'
  | 'allowNotifications'
  | 'playSoundForAlerts'
  | 'focusStatus'
  | 'lowPowerMode'
  | 'firewall'
  | 'locationServices';

interface SystemSettingsProps {
  onWallpaperChange: (url: string) => void;
  currentWallpaper: string;
  appearanceMode: AppearanceMode;
  setAppearanceMode: (mode: AppearanceMode) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  currentAccent: { bg: string; text: string; border: string; ring: string; text600: string };
  dockSize: number;
  setDockSize: (size: number) => void;
  dockMagnification: number;
  setDockMagnification: (mag: number) => void;
  isDarkMode: boolean;
}

const ACCENT_HEX: Record<AccentColor, string> = {
  blue: '#0A84FF',
  purple: '#BF5AF2',
  pink: '#FF375F',
  red: '#FF453A',
  orange: '#FF9F0A',
  yellow: '#FFD60A',
  green: '#30D158',
  zinc: '#8E8E93',
};

const SIDEBAR_GROUPS: Array<{
  group: string;
  items: Array<{ id: SettingsTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }>;
}> = [
  {
    group: 'System',
    items: [
      { id: 'general', label: 'General', icon: Command },
      { id: 'appearance', label: 'Appearance', icon: Brush },
      { id: 'control-center', label: 'Control Center', icon: SlidersHorizontal },
      { id: 'desktop-dock', label: 'Desktop & Dock', icon: Layout },
      { id: 'displays', label: 'Displays', icon: Monitor },
    ],
  },
  {
    group: 'Personal',
    items: [
      { id: 'wallpaper', label: 'Wallpaper', icon: ImageIcon },
      { id: 'screen-saver', label: 'Screen Saver', icon: Sparkles },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'sound', label: 'Sound', icon: Volume2 },
      { id: 'focus', label: 'Focus', icon: Moon },
      { id: 'battery', label: 'Battery', icon: Battery },
    ],
  },
  {
    group: 'Security',
    items: [{ id: 'privacy-security', label: 'Privacy & Security', icon: Shield }],
  },
];

const WALLPAPER_PRESETS = [
  'https://picsum.photos/seed/macos-sonoma-1/1920/1080',
  'https://picsum.photos/seed/macos-sonoma-2/1920/1080',
  'https://picsum.photos/seed/macos-sonoma-3/1920/1080',
  'https://picsum.photos/seed/macos-sonoma-4/1920/1080',
  'https://picsum.photos/seed/macos-sonoma-5/1920/1080',
  'https://picsum.photos/seed/macos-sonoma-6/1920/1080',
];

const accentPalette: Array<{ label: string; value: AccentColor; className: string }> = [
  { label: 'Blue', value: 'blue', className: 'bg-blue-500' },
  { label: 'Purple', value: 'purple', className: 'bg-purple-500' },
  { label: 'Pink', value: 'pink', className: 'bg-pink-500' },
  { label: 'Red', value: 'red', className: 'bg-red-500' },
  { label: 'Orange', value: 'orange', className: 'bg-orange-500' },
  { label: 'Yellow', value: 'yellow', className: 'bg-yellow-500' },
  { label: 'Green', value: 'green', className: 'bg-green-500' },
  { label: 'Graphite', value: 'zinc', className: 'bg-zinc-500' },
];

const DEFAULT_TOGGLES: Record<ToggleKey, boolean> = {
  menuBarClock: true,
  menuBarBattery: true,
  showInControlCenter: true,
  showInMenuBar: true,
  autoHideDock: false,
  dockMagnificationEnabled: true,
  showRecentApps: true,
  trueTone: true,
  nightShift: false,
  allowNotifications: true,
  playSoundForAlerts: true,
  focusStatus: true,
  lowPowerMode: false,
  firewall: true,
  locationServices: true,
};

const titleByTab: Record<SettingsTab, string> = {
  general: 'General',
  appearance: 'Appearance',
  'control-center': 'Control Center',
  'desktop-dock': 'Desktop & Dock',
  displays: 'Displays',
  wallpaper: 'Wallpaper',
  'screen-saver': 'Screen Saver',
  notifications: 'Notifications',
  sound: 'Sound',
  focus: 'Focus',
  battery: 'Battery',
  'privacy-security': 'Privacy & Security',
};

const MacSwitch = ({ checked, onChange, isDarkMode }: { checked: boolean; onChange: (value: boolean) => void; isDarkMode: boolean }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
      checked ? 'bg-[#34C759]' : isDarkMode ? 'bg-zinc-600/90' : 'bg-zinc-300'
    }`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.22),0_6px_10px_rgba(0,0,0,0.18)] transition-transform duration-300 ${
        checked ? 'translate-x-[22px]' : 'translate-x-0.5'
      }`}
    />
  </button>
);

const SectionTitle = ({ title, isDarkMode }: { title: string; isDarkMode: boolean }) => (
  <div className="pt-1">
    <h3 className={`text-[12px] font-semibold tracking-wide ${isDarkMode ? 'text-zinc-200' : 'text-zinc-700'}`}>{title}</h3>
    <div className={`mt-2 h-px w-full ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`} />
  </div>
);

const Card = ({ children, isDarkMode }: { children: React.ReactNode; isDarkMode: boolean }) => (
  <section
    className={`rounded-2xl border p-4 backdrop-blur-xl ${
      isDarkMode ? 'bg-zinc-900/70 border-white/12' : 'bg-white/90 border-black/10'
    } shadow-[0_18px_40px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.08)]`}
  >
    {children}
  </section>
);

const SettingRow = ({
  title,
  subtitle,
  isDarkMode,
  children,
}: {
  title: string;
  subtitle?: string;
  isDarkMode: boolean;
  children: React.ReactNode;
}) => (
  <div className={`flex items-center justify-between gap-4 py-3 ${isDarkMode ? 'border-white/8' : 'border-black/8'} border-b last:border-b-0`}>
    <div>
      <p className={`text-[13px] font-medium ${isDarkMode ? 'text-zinc-100' : 'text-zinc-800'}`}>{title}</p>
      {subtitle ? <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>{subtitle}</p> : null}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const MacSelect = ({
  options,
  value,
  onChange,
  isDarkMode,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  isDarkMode: boolean;
}) => (
  <select
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className={`min-w-[180px] rounded-lg border px-3 py-1.5 text-[12px] outline-none ${
      isDarkMode
        ? 'bg-zinc-900/70 border-white/15 text-zinc-100 focus:border-white/30'
        : 'bg-white/80 border-black/10 text-zinc-700 focus:border-black/25'
    }`}
  >
    {options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

const MacSlider = ({
  value,
  min,
  max,
  step,
  onChange,
  accentHex,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  accentHex: string;
}) => (
  <input
    type="range"
    min={min}
    max={max}
    step={step}
    value={value}
    onChange={(event) => onChange(Number.parseFloat(event.target.value))}
    className="w-44"
    style={{ accentColor: accentHex }}
  />
);

export default function SystemSettings({
  onWallpaperChange,
  currentWallpaper,
  appearanceMode,
  setAppearanceMode,
  accentColor,
  setAccentColor,
  currentAccent,
  dockSize,
  setDockSize,
  dockMagnification,
  setDockMagnification,
  isDarkMode,
}: SystemSettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [searchText, setSearchText] = useState('');
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>(DEFAULT_TOGGLES);
  const [displayBrightness, setDisplayBrightness] = useState(78);
  const [screenSaverAfter, setScreenSaverAfter] = useState(5);
  const [outputVolume, setOutputVolume] = useState(72);
  const [inputVolume, setInputVolume] = useState(66);
  const [selectedResolution, setSelectedResolution] = useState('Default for Display');
  const [selectedSoundOutput, setSelectedSoundOutput] = useState('MacBook Pro Speakers');
  const [selectedFocusSchedule, setSelectedFocusSchedule] = useState('Off');
  const [selectedBatteryMode, setSelectedBatteryMode] = useState('Automatic');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accentHex = ACCENT_HEX[accentColor];

  const groupedItems = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return SIDEBAR_GROUPS;

    return SIDEBAR_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.label.toLowerCase().includes(query)),
    })).filter((group) => group.items.length > 0);
  }, [searchText]);

  const visibleTabIds = useMemo(
    () => groupedItems.flatMap((group) => group.items.map((item) => item.id)),
    [groupedItems]
  );

  useEffect(() => {
    if (!visibleTabIds.includes(activeTab)) {
      setActiveTab(visibleTabIds[0] ?? 'general');
    }
  }, [activeTab, visibleTabIds]);

  const setToggle = (key: ToggleKey, value: boolean) => {
    setToggles((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (fileEvent) => {
      if (fileEvent.target?.result) {
        onWallpaperChange(fileEvent.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-5">
            <SectionTitle title="Startup Disk & Defaults" isDarkMode={isDarkMode} />
            <Card isDarkMode={isDarkMode}>
              <SettingRow title="Default Web Browser" subtitle="Used for opening links" isDarkMode={isDarkMode}>
                <MacSelect
                  options={['Safari', 'Chrome', 'Arc', 'Brave']}
                  value="Safari"
                  onChange={() => {}}
                  isDarkMode={isDarkMode}
                />
              </SettingRow>
              <SettingRow title="Language & Region" subtitle="English (US)" isDarkMode={isDarkMode}>
                <button
                  type="button"
                  className={`rounded-lg px-3 py-1.5 text-[12px] ${isDarkMode ? 'bg-white/10 text-zinc-100' : 'bg-black/5 text-zinc-700'}`}
                >
                  Customize
                </button>
              </SettingRow>
            </Card>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-5">
            <SectionTitle title="Interface" isDarkMode={isDarkMode} />
            <Card isDarkMode={isDarkMode}>
              <div className="grid grid-cols-3 gap-3">
                {(['Light', 'Dark', 'Auto'] as const).map((mode) => (
                  <button
                    type="button"
                    key={mode}
                    onClick={() => setAppearanceMode(mode)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      appearanceMode === mode
                        ? `${currentAccent.border} shadow-[0_10px_24px_rgba(0,0,0,0.14)]`
                        : isDarkMode
                        ? 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08]'
                        : 'border-black/10 bg-white/75 hover:bg-white'
                    }`}
                  >
                    <div
                      className={`mb-2 h-14 rounded-lg border ${
                        mode === 'Light'
                          ? 'bg-white border-black/10'
                          : mode === 'Dark'
                          ? 'bg-zinc-900 border-white/10'
                          : 'bg-gradient-to-r from-white to-zinc-900 border-black/10'
                      }`}
                    />
                    <span className={`text-[12px] font-medium ${isDarkMode ? 'text-zinc-200' : 'text-zinc-700'}`}>{mode}</span>
                  </button>
                ))}
              </div>
            </Card>

            <SectionTitle title="Accent Color" isDarkMode={isDarkMode} />
            <Card isDarkMode={isDarkMode}>
              <div className="flex flex-wrap gap-3">
                {accentPalette.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setAccentColor(color.value)}
                    className={`h-8 w-8 rounded-full ${color.className} transition-transform hover:scale-105 ${
                      accentColor === color.value ? `ring-2 ring-offset-2 ${isDarkMode ? 'ring-offset-zinc-900' : 'ring-offset-white'} ring-black/20` : ''
                    }`}
                    aria-label={color.label}
                  >
                    {accentColor === color.value ? <Check size={12} className="mx-auto text-white" /> : null}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'control-center':
        return (
          <div className="space-y-5">
            <SectionTitle title="Modules" isDarkMode={isDarkMode} />
            <Card isDarkMode={isDarkMode}>
              <SettingRow title="Clock" subtitle="Show in menu bar" isDarkMode={isDarkMode}>
                <MacSwitch checked={toggles.menuBarClock} onChange={(value) => setToggle('menuBarClock', value)} isDarkMode={isDarkMode} />
              </SettingRow>
              <SettingRow title="Battery" subtitle="Percentage hidden" isDarkMode={isDarkMode}>
                <MacSwitch checked={toggles.menuBarBattery} onChange={(value) => setToggle('menuBarBattery', value)} isDarkMode={isDarkMode} />
              </SettingRow>
              <SettingRow title="Wi-Fi" subtitle="Show in Control Center" isDarkMode={isDarkMode}>
                <MacSwitch checked={toggles.showInControlCenter} onChange={(value) => setToggle('showInControlCenter', value)} isDarkMode={isDarkMode} />
              </SettingRow>
              <SettingRow title="Bluetooth" subtitle="Show in menu bar" isDarkMode={isDarkMode}>
                <MacSwitch checked={toggles.showInMenuBar} onChange={(value) => setToggle('showInMenuBar', value)} isDarkMode={isDarkMode} />
              </SettingRow>
            </Card>
          </div>
        );

      case 'desktop-dock':
        return (
          <div className="space-y-5">
            <SectionTitle title="Dock" isDarkMode={isDarkMode} />
            <Card isDarkMode={isDarkMode}>
              <SettingRow title="Size" subtitle={`${Math.round(dockSize)} px`} isDarkMode={isDarkMode}>
                <MacSlider value={dockSize} min={32} max={64} onChange={setDockSize} accentHex={accentHex} />
              </SettingRow>
              <SettingRow title="Magnification" subtitle={`${dockMagnification.toFixed(1)}x`} isDarkMode={isDarkMode}>
                <MacSlider value={dockMagnification} min={1} max={2.5} step={0.1} onChange={setDockMagnification} accentHex={accentHex} />
              </SettingRow>
              <SettingRow title="Automatically hide and show the Dock" isDarkMode={isDarkMode}>
                <MacSwitch checked={toggles.autoHideDock} onChange={(value) => setToggle('autoHideDock', value)} isDarkMode={isDarkMode} />
              </SettingRow>
              <SettingRow title="Show suggested and recent apps in Dock" isDarkMode={isDarkMode}>
                <MacSwitch checked={toggles.showRecentApps} onChange={(value) => setToggle('showRecentApps', value)} isDarkMode={isDarkMode} />
              </SettingRow>
            </Card>
          </div>
        );

      case 'displays':
        return (
          <div className="space-y-5">
            <SectionTitle title="Built-in Display" isDarkMode={isDarkMode} />
            <Card isDarkMode={isDarkMode}>
              <SettingRow title="Brightness" subtitle={`${displayBrightness}%`} isDarkMode={isDarkMode}>
                <MacSlider value={displayBrightness} min={0} max={100} onChange={setDisplayBrightness} accentHex={accentHex} />
              </SettingRow>
              <SettingRow title="Resolution" isDarkMode={isDarkMode}>
                <MacSelect
                  options={['Default for Display', 'Scaled (1920 x 1080)', 'Scaled (1680 x 1050)']}
                  value={selectedResolution}
                  onChange={setSelectedResolution}
                  isDarkMode={isDarkMode}
                />
              </SettingRow>
              <SettingRow title="True Tone" isDarkMode={isDarkMode}>
                <MacSwitch checked={toggles.trueTone} onChange={(value) => setToggle('trueTone', value)} isDarkMode={isDarkMode} />
              </SettingRow>
              <SettingRow title="Night Shift" isDarkMode={isDarkMode}>
                <MacSwitch checked={toggles.nightShift} onChange={(value) => setToggle('nightShift', value)} isDarkMode={isDarkMode} />
              </SettingRow>
            </Card>
          </div>
        );

      case 'wallpaper':
        return (
          <div className="space-y-5">
            <SectionTitle title="Wallpaper" isDarkMode={isDarkMode} />
            <Card isDarkMode={isDarkMode}>
              <div className="grid grid-cols-3 gap-3">
                {WALLPAPER_PRESETS.map((url) => (
                  <button
                    type="button"
                    key={url}
                    onClick={() => onWallpaperChange(url)}
                    className={`relative aspect-video overflow-hidden rounded-xl border transition-all ${
                      currentWallpaper === url ? `${currentAccent.border} shadow-lg scale-[0.98]` : isDarkMode ? 'border-white/10' : 'border-black/10'
                    }`}
                  >
                    <img src={url} alt="Wallpaper" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    {currentWallpaper === url ? (
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <Check size={16} className="text-white" />
                      </div>
                    ) : null}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-[12px] transition-colors ${
                  isDarkMode ? 'border-white/20 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200' : 'border-black/15 bg-black/[0.03] hover:bg-black/[0.06] text-zinc-700'
                }`}
              >
                <Upload size={14} />
                Add Custom Wallpaper
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </Card>
          </div>
        );

      case 'screen-saver':
        return (
          <div className="space-y-5">
            <SectionTitle title="Screen Saver" isDarkMode={isDarkMode} />
            <Card isDarkMode={isDarkMode}>
              <SettingRow title="Style" isDarkMode={isDarkMode}>
                <MacSelect
                  options={['Message', 'Drift', 'Arabesque', 'Flurry']}
                  value="Message"
                  onChange={() => {}}
                  isDarkMode={isDarkMode}
                />
              </SettingRow>
              <SettingRow title="Start after" subtitle={`${screenSaverAfter} min`} isDarkMode={isDarkMode}>
                <MacSlider value={screenSaverAfter} min={1} max={20} onChange={setScreenSaverAfter} accentHex={accentHex} />
              </SettingRow>
            </Card>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-5">
            <SectionTitle title="Notification Style" isDarkMode={isDarkMode} />
            <Card isDarkMode={isDarkMode}>
              <SettingRow title="Allow Notifications" isDarkMode={isDarkMode}>
                <MacSwitch checked={toggles.allowNotifications} onChange={(value) => setToggle('allowNotifications', value)} isDarkMode={isDarkMode} />
              </SettingRow>
              <SettingRow title="Play sound for notifications" isDarkMode={isDarkMode}>
                <MacSwitch checked={toggles.playSoundForAlerts} onChange={(value) => setToggle('playSoundForAlerts', value)} isDarkMode={isDarkMode} />
              </SettingRow>
            </Card>
          </div>
        );

      case 'sound':
        return (
          <div className="space-y-5">
            <SectionTitle title="Output & Input" isDarkMode={isDarkMode} />
            <Card isDarkMode={isDarkMode}>
              <SettingRow title="Output" isDarkMode={isDarkMode}>
                <MacSelect
                  options={['MacBook Pro Speakers', 'AirPods Pro', 'External Display']}
                  value={selectedSoundOutput}
                  onChange={setSelectedSoundOutput}
                  isDarkMode={isDarkMode}
                />
              </SettingRow>
              <SettingRow title="Output volume" subtitle={`${outputVolume}%`} isDarkMode={isDarkMode}>
                <MacSlider value={outputVolume} min={0} max={100} onChange={setOutputVolume} accentHex={accentHex} />
              </SettingRow>
              <SettingRow title="Input volume" subtitle={`${inputVolume}%`} isDarkMode={isDarkMode}>
                <MacSlider value={inputVolume} min={0} max={100} onChange={setInputVolume} accentHex={accentHex} />
              </SettingRow>
            </Card>
          </div>
        );

      case 'focus':
        return (
          <div className="space-y-5">
            <SectionTitle title="Focus" isDarkMode={isDarkMode} />
            <Card isDarkMode={isDarkMode}>
              <SettingRow title="Share Focus Status" subtitle="Allow apps to show your focus" isDarkMode={isDarkMode}>
                <MacSwitch checked={toggles.focusStatus} onChange={(value) => setToggle('focusStatus', value)} isDarkMode={isDarkMode} />
              </SettingRow>
              <SettingRow title="Schedule" isDarkMode={isDarkMode}>
                <MacSelect
                  options={['Off', 'Time-Based', 'Location-Based', 'App-Based']}
                  value={selectedFocusSchedule}
                  onChange={setSelectedFocusSchedule}
                  isDarkMode={isDarkMode}
                />
              </SettingRow>
            </Card>
          </div>
        );

      case 'battery':
        return (
          <div className="space-y-5">
            <SectionTitle title="Battery Health" isDarkMode={isDarkMode} />
            <Card isDarkMode={isDarkMode}>
              <SettingRow title="Low Power Mode" isDarkMode={isDarkMode}>
                <MacSwitch checked={toggles.lowPowerMode} onChange={(value) => setToggle('lowPowerMode', value)} isDarkMode={isDarkMode} />
              </SettingRow>
              <SettingRow title="On Battery" isDarkMode={isDarkMode}>
                <MacSelect
                  options={['Automatic', 'Always', 'Never']}
                  value={selectedBatteryMode}
                  onChange={setSelectedBatteryMode}
                  isDarkMode={isDarkMode}
                />
              </SettingRow>
            </Card>
          </div>
        );

      case 'privacy-security':
        return (
          <div className="space-y-5">
            <SectionTitle title="Privacy" isDarkMode={isDarkMode} />
            <Card isDarkMode={isDarkMode}>
              <SettingRow title="Firewall" subtitle="Block unwanted network connections" isDarkMode={isDarkMode}>
                <MacSwitch checked={toggles.firewall} onChange={(value) => setToggle('firewall', value)} isDarkMode={isDarkMode} />
              </SettingRow>
              <SettingRow title="Location Services" subtitle="Allow apps to use your location" isDarkMode={isDarkMode}>
                <MacSwitch checked={toggles.locationServices} onChange={(value) => setToggle('locationServices', value)} isDarkMode={isDarkMode} />
              </SettingRow>
              <SettingRow title="Analytics & Improvements" subtitle="Share Mac analytics with developers" isDarkMode={isDarkMode}>
                <MacSwitch checked={false} onChange={() => {}} isDarkMode={isDarkMode} />
              </SettingRow>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`relative h-full overflow-hidden rounded-b-[20px] border ${
        isDarkMode ? 'border-white/12 bg-[rgba(22,22,26,0.88)]' : 'border-black/10 bg-[rgba(249,249,252,0.9)]'
      } backdrop-blur-[30px]`}
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", "Segoe UI", system-ui, sans-serif',
      }}
    >
      <div className="relative flex h-full min-h-0 flex-col md:flex-row">
        <aside
          className={`w-full md:w-[280px] md:min-w-[280px] md:max-w-[280px] border-b md:border-b-0 md:border-r p-3 md:p-4 overflow-y-auto ${
            isDarkMode ? 'border-white/10 bg-zinc-900/65' : 'border-black/10 bg-white/88'
          }`}
        >
          <div className="mb-4 flex items-center gap-2 pl-1 md:hidden">
            <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <span className="h-3 w-3 rounded-full bg-[#FEBB2E]" />
            <span className="h-3 w-3 rounded-full bg-[#28C840]" />
          </div>

          <div className="relative mb-4">
            <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`} />
            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search"
              className={`w-full rounded-[10px] border py-2 pl-9 pr-3 text-[12px] outline-none ${
                isDarkMode
                  ? 'bg-zinc-900/75 border-white/10 text-zinc-100 placeholder:text-zinc-500'
                  : 'bg-white/75 border-black/10 text-zinc-700 placeholder:text-zinc-400'
              }`}
            />
          </div>

          <div className="space-y-3">
            {groupedItems.map((group, groupIndex) => (
              <div key={group.group}>
                <p className={`px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  {group.group}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.id === activeTab;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        className={`relative w-full overflow-hidden rounded-xl px-2.5 py-2 text-left transition-colors ${
                          isActive ? '' : isDarkMode ? 'hover:bg-white/[0.10]' : 'hover:bg-black/[0.06]'
                        }`}
                      >
                        {isActive ? (
                          <motion.span
                            layoutId="settings-active-item"
                            transition={{ type: 'spring', damping: 30, stiffness: 380 }}
                            className={`absolute inset-0 rounded-xl border ${
                              isDarkMode
                                ? 'bg-gradient-to-r from-white/[0.20] to-white/[0.10] border-white/20'
                                : 'bg-gradient-to-r from-white/90 to-white/70 border-white/90'
                            } shadow-[0_8px_24px_rgba(0,0,0,0.14)]`}
                          />
                        ) : null}
                        <span className="relative z-[1] flex items-center gap-2.5">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-md ${
                              isDarkMode ? 'bg-white/[0.12] text-zinc-100' : 'bg-white text-zinc-700'
                            }`}
                          >
                            <Icon size={14} />
                          </span>
                          <span className={`text-[12.5px] font-medium ${isDarkMode ? 'text-zinc-100' : 'text-zinc-800'}`}>{item.label}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {groupIndex !== groupedItems.length - 1 ? (
                  <div className={`mx-2 mt-3 h-px ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`} />
                ) : null}
              </div>
            ))}
          </div>
        </aside>

        <section className="relative min-h-0 flex-1 overflow-hidden">
          <div className={`border-b px-6 py-4 ${isDarkMode ? 'border-white/10 bg-zinc-900/72' : 'border-black/10 bg-white/92'}`}>
           
            <h2 className={`text-[24px] font-semibold tracking-[-0.02em] ${isDarkMode ? 'text-zinc-50' : 'text-zinc-900'}`}>
              {titleByTab[activeTab]}
            </h2>
            <p className={`text-[12px] mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>System Settings</p>
          </div>

          <div className="h-[calc(100%-94px)] overflow-y-auto px-6 py-5 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.99 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="max-w-3xl space-y-4"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
}
