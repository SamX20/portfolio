import type { IconType } from 'react-icons';
import { FaLinkedinIn } from 'react-icons/fa6';
import {
  SiBehance,
  SiDribbble,
  SiFacebook,
  SiGithub,
  SiInstagram,
  SiSnapchat,
  SiTelegram,
  SiThreads,
  SiTiktok,
  SiVimeo,
  SiWhatsapp,
  SiX,
  SiYoutube,
} from 'react-icons/si';
import {
  LuBox,
  LuCamera,
  LuClapperboard,
  LuClock,
  LuCode,
  LuGlobe,
  LuLayoutTemplate,
  LuLink,
  LuMail,
  LuMapPin,
  LuMegaphone,
  LuMessageCircle,
  LuMonitorSmartphone,
  LuPalette,
  LuPenTool,
  LuPhone,
  LuShapes,
  LuShoppingBag,
  LuSparkles,
  LuWand,
} from 'react-icons/lu';

export interface IconOption {
  value: string;
  label: string;
  icon: IconType;
  group: 'social' | 'contact' | 'service';
}

export const ICON_OPTIONS: IconOption[] = [
  { value: 'instagram', label: 'Instagram', icon: SiInstagram, group: 'social' },
  { value: 'youtube', label: 'YouTube', icon: SiYoutube, group: 'social' },
  { value: 'facebook', label: 'Facebook', icon: SiFacebook, group: 'social' },
  { value: 'linkedin', label: 'LinkedIn', icon: FaLinkedinIn, group: 'social' },
  { value: 'tiktok', label: 'TikTok', icon: SiTiktok, group: 'social' },
  { value: 'x', label: 'X / Twitter', icon: SiX, group: 'social' },
  { value: 'threads', label: 'Threads', icon: SiThreads, group: 'social' },
  { value: 'snapchat', label: 'Snapchat', icon: SiSnapchat, group: 'social' },
  { value: 'behance', label: 'Behance', icon: SiBehance, group: 'social' },
  { value: 'dribbble', label: 'Dribbble', icon: SiDribbble, group: 'social' },
  { value: 'vimeo', label: 'Vimeo', icon: SiVimeo, group: 'social' },
  { value: 'github', label: 'GitHub', icon: SiGithub, group: 'social' },
  { value: 'whatsapp', label: 'WhatsApp', icon: SiWhatsapp, group: 'social' },
  { value: 'telegram', label: 'Telegram', icon: SiTelegram, group: 'social' },
  { value: 'email', label: 'Email', icon: LuMail, group: 'contact' },
  { value: 'phone', label: 'Phone / Call', icon: LuPhone, group: 'contact' },
  { value: 'location', label: 'Location', icon: LuMapPin, group: 'contact' },
  { value: 'hours', label: 'Working hours', icon: LuClock, group: 'contact' },
  { value: 'website', label: 'Website', icon: LuGlobe, group: 'contact' },
  { value: 'chat', label: 'Chat', icon: LuMessageCircle, group: 'contact' },
  { value: 'link', label: 'Link', icon: LuLink, group: 'contact' },
  { value: 'web', label: 'Web development', icon: LuMonitorSmartphone, group: 'service' },
  { value: 'store', label: 'Online store', icon: LuShoppingBag, group: 'service' },
  { value: 'video', label: 'Video editing', icon: LuClapperboard, group: 'service' },
  { value: 'motion', label: 'Motion design', icon: LuSparkles, group: 'service' },
  { value: 'logo', label: 'Logo design', icon: LuPenTool, group: 'service' },
  { value: 'branding', label: 'Branding', icon: LuPalette, group: 'service' },
  { value: '3d', label: '3D', icon: LuBox, group: 'service' },
  { value: 'social', label: 'Social media', icon: LuMegaphone, group: 'service' },
  { value: 'photo', label: 'Photography', icon: LuCamera, group: 'service' },
  { value: 'code', label: 'Code', icon: LuCode, group: 'service' },
  { value: 'uiux', label: 'UI / UX', icon: LuLayoutTemplate, group: 'service' },
  { value: 'graphic', label: 'Graphic design', icon: LuShapes, group: 'service' },
  { value: 'other', label: 'Other', icon: LuWand, group: 'service' },
];

const byValue = new Map(ICON_OPTIONS.map((option) => [option.value, option]));

const HINTS: Array<[RegExp, string]> = [
  [/instagram|instagr\.am/i, 'instagram'],
  [/youtube|youtu\.be/i, 'youtube'],
  [/facebook|fb\.com/i, 'facebook'],
  [/linkedin/i, 'linkedin'],
  [/tiktok/i, 'tiktok'],
  [/threads/i, 'threads'],
  [/twitter|x\.com/i, 'x'],
  [/snapchat/i, 'snapchat'],
  [/behance/i, 'behance'],
  [/dribbble/i, 'dribbble'],
  [/vimeo/i, 'vimeo'],
  [/github/i, 'github'],
  [/whatsapp|wa\.me/i, 'whatsapp'],
  [/telegram|t\.me/i, 'telegram'],
  [/mailto:|e-?mail|بريد|📧|✉/i, 'email'],
  [/tel:|phone|هاتف|📱|📞|☎/i, 'phone'],
  [/maps|location|موقع|📍/i, 'location'],
  [/hours|ساعات|⏰|🕒/i, 'hours'],
];

/** Resolve an icon from an explicit key, falling back to hints (id, name, url) so legacy rows still get proper icons. */
export function resolveIcon(value?: string | null, ...hints: Array<string | null | undefined>): IconType {
  const key = value?.trim().toLowerCase();
  if (key && byValue.has(key)) return byValue.get(key)!.icon;
  const haystack = [value, ...hints].filter(Boolean).join(' ');
  for (const [pattern, iconKey] of HINTS) {
    if (pattern.test(haystack)) return byValue.get(iconKey)!.icon;
  }
  return LuLink;
}

export function DynamicIcon({
  value,
  hints = [],
  className,
}: {
  value?: string | null;
  hints?: Array<string | null | undefined>;
  className?: string;
}) {
  const Icon = resolveIcon(value, ...hints);
  return <Icon className={className} aria-hidden="true" />;
}
