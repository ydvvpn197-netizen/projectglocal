// UI types for TheGlocal project
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
    input: string;
    ring: string;
  };
}

export interface LayoutConfig {
  sidebar: {
    collapsed: boolean;
    width: number;
    minWidth: number;
    maxWidth: number;
  };
  header: {
    height: number;
    sticky: boolean;
  };
  footer: {
    height: number;
    sticky: boolean;
  };
  content: {
    padding: number;
    maxWidth: number;
  };
}

export interface Breakpoint {
  name: string;
  min: number;
  max?: number;
}

export interface ResponsiveConfig {
  breakpoints: Breakpoint[];
  defaultBreakpoint: string;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
}

export interface TextareaProps extends BaseComponentProps {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  rows?: number;
  cols?: number;
}

export interface SelectProps extends BaseComponentProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CheckboxProps extends BaseComponentProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
}

export interface RadioProps extends BaseComponentProps {
  value: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
}

export interface SwitchProps extends BaseComponentProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
}

export interface SliderProps extends BaseComponentProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
}

export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  backdrop?: boolean;
}

export interface DialogProps extends BaseComponentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface TooltipProps extends BaseComponentProps {
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
}

export interface PopoverProps extends BaseComponentProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  content: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
}

export interface DropdownMenuProps extends BaseComponentProps {
  trigger?: React.ReactNode;
  items: DropdownMenuItem[];
  placement?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
}

export interface DropdownMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  separator?: boolean;
  children?: DropdownMenuItem[];
}

export interface TabsProps extends BaseComponentProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  items: TabItem[];
}

export interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps extends BaseComponentProps {
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  items: AccordionItem[];
}

export interface AccordionItem {
  value: string;
  trigger: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TableProps<T = any> extends BaseComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

export interface FormProps extends BaseComponentProps {
  onSubmit: (data: any) => void;
  onReset?: () => void;
  loading?: boolean;
  disabled?: boolean;
  validation?: any;
}

export interface FormFieldProps extends BaseComponentProps {
  name: string;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
}

// Navigation types
export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: NavigationItem[];
  disabled?: boolean;
  external?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
}

// Layout types
export interface SidebarProps extends BaseComponentProps {
  items: NavigationItem[];
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface HeaderProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onUserMenuClick?: () => void;
}

export interface FooterProps extends BaseComponentProps {
  links?: Array<{
    label: string;
    href: string;
    external?: boolean;
  }>;
  copyright?: string;
  social?: Array<{
    name: string;
    href: string;
    icon: React.ReactNode;
  }>;
}

// Animation types
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  fill?: 'forwards' | 'backwards' | 'both' | 'none';
}

export interface TransitionProps {
  in: boolean;
  timeout?: number;
  children: React.ReactNode;
  onEnter?: () => void;
  onEntering?: () => void;
  onEntered?: () => void;
  onExit?: () => void;
  onExiting?: () => void;
  onExited?: () => void;
}

// Accessibility types
export interface A11yProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
  'aria-disabled'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  'aria-busy'?: boolean;
  'aria-controls'?: string;
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  'aria-details'?: string;
  'aria-errormessage'?: string;
  'aria-flowto'?: string;
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-invalid'?: boolean | 'grammar' | 'spelling';
  'aria-keyshortcuts'?: string;
  'aria-modal'?: boolean;
  'aria-multiline'?: boolean;
  'aria-multiselectable'?: boolean;
  'aria-orientation'?: 'horizontal' | 'vertical';
  'aria-placeholder'?: string;
  'aria-pressed'?: boolean | 'mixed';
  'aria-readonly'?: boolean;
  'aria-required'?: boolean;
  'aria-roledescription'?: string;
  'aria-rowcount'?: number;
  'aria-rowindex'?: number;
  'aria-rowspan'?: number;
  'aria-setsize'?: number;
  'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other';
  'aria-valuemax'?: number;
  'aria-valuemin'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
}
