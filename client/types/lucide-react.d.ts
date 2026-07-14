declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    className?: string;
    strokeWidth?: number | string;
  }
  
  export type Icon = FC<IconProps>;
  
  // Layout icons
  export const Users: Icon;
  export const Calendar: Icon;
  export const Stethoscope: Icon;
  export const Pill: Icon;
  export const Bell: Icon;
  export const LayoutDashboard: Icon;
  export const LogOut: Icon;
  
  // Reception page icons
  export const UserPlus: Icon;
  export const CalendarPlus: Icon;
  export const CheckCircle2: Icon;
  export const Search: Icon;
  export const X: Icon;
  
  // Doctor page icons
  export const History: Icon;
  
  // Notifications page icons
  export const Bell: Icon;
  export const CheckCheck: Icon;
  
  // Reports page icons
  export const User: Icon;
  export const FileText: Icon;

  // Analytics icons
  export const TrendingUp: Icon;

  // Common icons
  export const ChevronDown: Icon;
  export const ChevronUp: Icon;
  export const Check: Icon;
  export const Plus: Icon;
  export const Minus: Icon;
  export const Edit: Icon;
  export const Trash: Icon;
  export const Eye: Icon;
  export const AlertCircle: Icon;
  export const Info: Icon;
  export const Filter: Icon;
  export const Download: Icon;
  export const ArrowLeft: Icon;
  export const ArrowRight: Icon;
  export const RefreshCw: Icon;

  export default Icon;
}
