# Catálogo del Design System YPF (SHP Template)

Referencia generada a partir de `DESIGN-SYSTEM-SHP-TEMPLATE/src/core/ui`. Es la lista cerrada de piezas de UI disponibles: antes de construir cualquier elemento de interfaz, buscarlo acá. Si nada encaja, detenerse y consultar; no crear componentes ad hoc.

## Reglas de uso

- `src/core/ui` no se modifica salvo decisión explícita del plan, registrada en `docs/design-system-cambios.md`. No se reexporta desde `core/index.ts`.
- Imports selectivos por capa, nunca el índice completo de `core` ni de `core/ui`:

```ts
import { Button, Table } from '<ruta>/core/ui/components';
import { HomeCard, Header, Tabs } from '<ruta>/core/ui/patterns';
import { Nav } from '<ruta>/core/ui/layouts';
import { FigmaIcon, getImageSource, getBrandLogoSource, spacing, typography } from '<ruta>/core/ui/foundations';
```

- Íconos con `FigmaIcon`, imágenes con `getImageSource` y logos con `getBrandLogoSource`. Si falta una imagen o un ícono, usar un placeholder con nombre descriptivo.
- Colores, tipografías y espaciados solo desde tokens, `spacing` y `typography`.
- Si ninguna pieza de este catálogo corresponde, detenerse y consultar. Solo con aprobación se usa Fluent UI v8 directamente, estilado con los tokens del Design System.

## Foundations

### `foundations/icons/sizes.ts`

```ts
export const iconSizes = {
  xs: '12px',
  sm: '16px',
  md: '20px',
  lg: '24px',
  xl: '28px',
  xxl: '32px',
  xxxl: '48px',
} as const;

export type DesignSystemIconSize = keyof typeof iconSizes;
export type IconVariant = 'outline' | 'filled';
```

### `foundations/spacing/index.ts`

```ts
export const spacing = {
  none: '0px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
  xxxl: '48px',
} as const;

export type DesignSystemSpacing = typeof spacing;

// Base-2x spacing scale shown in the Figma "Espacios" foundation frame (node 443:18002).
export const spacingScale: string[] = ['96px', '80px', '64px', '48px', '32px', '24px', '16px', '8px', '4px'];

// Grid examples shown in the Figma "Grillas" foundation frame (node 443:18002).
export interface IGridScaleStep {
  width: string;
  columns: number;
  margin: string;
  gutter: string;
}

export const gridScale: IGridScaleStep[] = [
  { width: '1920px', columns: 12, margin: '120px', gutter: '16px' },
  { width: '1366px', columns: 12, margin: '32px', gutter: '16px' },
  { width: '640px', columns: 6, margin: '16px', gutter: '16px' },
];
```

### `foundations/typography/index.ts`

```ts
export const typography = {
  family: {
    base: '"Segoe UI", "Segoe UI Web (West European)", sans-serif',
  },
  weight: {
    regular: 400,
    semibold: 600,
    bold: 700,
  },
  size: {
    42: '42px',
    32: '32px',
    28: '28px',
    24: '24px',
    20: '20px',
    18: '18px',
    16: '16px',
    14: '14px',
    12: '12px',
    10: '10px',
    display: '42px',
    heading: '32px',
    body: '16px',
    subtitle: '14px',
    caption: '12px',
  },
  lineHeight: {
    42: '52px',
    32: '40px',
    28: '36px',
    24: '32px',
    20: '28px',
    18: '24px',
    16: '22px',
    14: '20px',
    12: '16px',
    10: '14px',
    display: '52px',
    heading: '40px',
    body: '22px',
    subtitle: '20px',
    caption: '16px',
  },
} as const;

export type DesignSystemTypography = typeof typography;
```

### `foundations/brand/brandAssets.ts`

```ts
export type BrandLogoName = 'ypf' | 'ypfWhite' | 'powerApps' | 'plataformas365' | 'shpTemplate';

// Brand logos exported from the Figma "DS - Sharepoint - Fluent UI v8".
const brandLogos: Record<BrandLogoName, string> = {
  ypf: require(...),
  ypfWhite: require(...),
  powerApps: require(...),
  plataformas365: require(...),
  shpTemplate: require(...),
};

export function getBrandLogoSource(name: BrandLogoName): string {
  return brandLogos[name];
}
```

### `foundations/images/imageAssets.ts`

```ts
export type DesignSystemImageName = 'coverBackground' | 'homeCover' | 'avatarPhoto' | 'activityAvatar';

// Raster images exported from the Figma "DS - Sharepoint - Fluent UI v8".
const images: Record<DesignSystemImageName, string> = {
  coverBackground: require(...),
  homeCover: require(...),
  avatarPhoto: require(...),
  activityAvatar: require(...),
};

export function getImageSource(name: DesignSystemImageName): string {
  return images[name];
}
```

### `foundations/colors/index.ts`

```ts
export const colors = {
  brand: {
    primary: 'var(--ds-color-brand-primary)',
    primaryHover: 'var(--ds-color-brand-primary-hover)',
  },
  neutral: {
    white: 'var(--ds-color-neutral-white)',
    background: 'var(--ds-color-neutral-background)',
    border: 'var(--ds-color-neutral-border)',
    text: 'var(--ds-color-neutral-text)',
    textMuted: 'var(--ds-color-neutral-text-muted)',
  },
  semantic: {
    success: 'var(--ds-color-semantic-success)',
    warning: 'var(--ds-color-semantic-warning)',
    error: 'var(--ds-color-semantic-error)',
    info: 'var(--ds-color-semantic-info)',
  },
} as const;

export type DesignSystemColors = typeof colors;

export * from './colorScales';
```

### `foundations/elevation/index.ts`

```ts
export const elevation = {
  none: 'none',
  depth4: '0 1.6px 3.6px rgba(0, 0, 0, 0.25)',
  depth8: '0 3.2px 7.2px rgba(0, 0, 0, 0.25)',
  depth16: '0 6.4px 14.4px rgba(0, 0, 0, 0.25)',
  depth64: '0 25.6px 57.6px rgba(0, 0, 0, 0.25)',
  low: '0 1.6px 3.6px rgba(0, 0, 0, 0.25)',
  medium: '0 3.2px 7.2px rgba(0, 0, 0, 0.25)',
  high: '0 6.4px 14.4px rgba(0, 0, 0, 0.25)',
} as const;

export type DesignSystemElevation = typeof elevation;
```

### `foundations/theme/_tokens.scss`

```scss
@mixin design-system-theme($dark: false) {
  --ds-font-family-base: "Segoe UI", "Segoe UI Web (West European)", sans-serif;
  --ds-font-size-body: 16px;
  --ds-font-size-caption: 12px;
  --ds-line-height-body: 22px;
  --ds-line-height-caption: 16px;
  --ds-space-xs: 4px;
  --ds-space-lg: 16px;
  // Colors below are the exact tokens extracted from the Figma "DS - Sharepoint - Fluent UI v8" file.
  --ds-color-brand-primary: #0451dd;
  --ds-color-brand-primary-hover: #003fa3;
  --ds-color-neutral-white: #ffffff;
  --ds-color-neutral-background: #fcfcfc;
  --ds-color-neutral-border: #dbdbdb;
  --ds-color-neutral-text: #1f1f1f;
  --ds-color-neutral-text-muted: #5c5c5c;
  --ds-color-semantic-success: #107c41;
  --ds-color-semantic-warning: #ffb900;
  --ds-color-semantic-error: #ab0017;
  --ds-color-semantic-info: #0078d4;

  @if $dark {
    --ds-color-neutral-background: #1f1f1f;
    --ds-color-neutral-border: #484644;
    --ds-color-neutral-text: #fcfcfc;
    --ds-color-neutral-text-muted: #c8c6c4;
  }
}
```

### Íconos (`FigmaIcon`)

`<FigmaIcon name="..." size="xs|sm|md|lg|xl|xxl|xxxl" variant="outline|filled" />`

Nombres disponibles: `attach`, `attachPrimary`, `closeCircle`, `closeCirclePrimary`


**generalIcons:** `search`, `searchPrimary`, `filter`, `filterPrimary`, `upload`, `uploadPrimary`, `checkmark`, `checkmarkPrimary`, `chevronDown`, `chevronDownPrimary`, `chevronRight`, `chevronRightPrimary`, `menu`, `menuPrimary`, `close`, `closePrimary`, `home`, `homePrimary`, `info`, `infoPrimary`, `clock`, `clockPrimary`, `add`, `addPrimary`, `navigate`, `navigatePrimary`, `reload`, `reloadPrimary`, `arrowCircle`, `arrowCirclePrimary`, `chevronCirclePrimary`, `edit`, `editPrimary`, `delete`, `deletePrimary`, `copy`, `copyPrimary`, `alertPrimary`, `download`, `downloadPrimary`, `settings`, `settingsPrimary`, `more`, `morePrimary`, `eye`, `eyePrimary`, `bookmark`, `bookmarkPrimary`, `arrowForward`, `arrowForwardPrimary`, `calendar`, `calendarPrimary`, `applications`, `mail`, `mailPrimary`, `user`, `userPrimary`, `users`, `usersPrimary`, `lock`, `lockPrimary`, `star`, `starPrimary`, `bell`, `bellPrimary`, `alert`, `flag`, `flagPrimary`, `globe`, `globePrimary`, `list`, `listPrimary`, `tag`, `tagPrimary`, `pin`, `pinPrimary`, `chat`, `chatPrimary`, `communication`


**fileTypeIcons:** `docx`, `xlsx`, `ppt`, `form`


**additionalGeneralIcons:** `arrowDownload`, `arrowDownloadPrimary`, `history`, `historyFilled`, `folderAdd`, `folderAddFilled`, `archive`, `archiveFilled`


## Components

### Avatar  ·  `core/ui/components/Avatar`

```ts
// Avatar.types.ts
import type { ReactNode } from 'react';

export type AvatarType = 'photo' | 'name' | 'icon';
export type AvatarSize = 'sm' | 'md' | 'lg';

export interface IAvatarProps {
  type?: AvatarType;
  name?: string;
  initials?: string;
  src?: string;
  icon?: ReactNode;
  size?: AvatarSize;
  alt?: string;
  className?: string;
}
```

Exporta: `export { Avatar } from './Avatar'; export type { AvatarSize, AvatarType, IAvatarProps } from './Avatar.types';`

### Button  ·  `core/ui/components/Button`

```ts
// Button.types.ts
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { IContextualMenuItem } from '@fluentui/react';

export type ButtonVariant = 'primary' | 'secondary' | 'compound';
export type ButtonSize = 'default' | 'small';
export type ButtonColor = 'blue' | 'red' | 'green';
export type ButtonType = 'standard' | 'split' | 'icon' | 'iconSplit' | 'contextualMenu';

export interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: ButtonColor;
  darkMode?: boolean;
  buttonType?: ButtonType;
  secondaryText?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  iconOnly?: boolean;
  circular?: boolean;
  split?: boolean;
  menuItems?: IContextualMenuItem[];
  onSplitClick?: () => void;
}
```

Exporta: `export { Button } from './Button'; export type { ButtonColor, ButtonSize, ButtonType, ButtonVariant, IButtonProps } from './Button.types';`

### Callout  ·  `core/ui/components/Callout`

```ts
// Callout.types.ts
import type { ReactNode } from 'react';

export type CalloutIndicator = 'top' | 'right' | 'bottom' | 'left';
export type CalloutTheme = 'light' | 'dark';
export type CalloutDirectionalHint =
  | 'bottomCenter' | 'topCenter' | 'leftCenter' | 'rightCenter'
  | 'bottomLeftEdge' | 'bottomRightEdge' | 'topLeftEdge' | 'topRightEdge'
  | 'leftTopEdge' | 'leftBottomEdge' | 'rightTopEdge' | 'rightBottomEdge';

export interface ICalloutProps {
  title: string;
  description?: string;
  indicator?: CalloutIndicator;
  theme?: CalloutTheme;
  darkMode?: boolean;
  directionalHint?: CalloutDirectionalHint;
  showLink?: boolean;
  linkLabel?: string;
  showButtonLabel?: string;
  showButton?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
  className?: string;
}
```

Exporta: `export { Callout } from './Callout'; export type { ICalloutProps, CalloutIndicator, CalloutTheme } from './Callout.types';`

### Card  ·  `core/ui/components/Card`

```ts
// Card.types.ts
import type { ReactNode } from 'react';

export type CardVariant = 'simple' | 'bandeja' | 'tray' | 'simpleButton' | 'detail' | 'vertical' | 'horizontal';

export interface ICardComment {
  author: string;
  text: string;
  avatar?: ReactNode;
  actionText?: string;
}

export interface ICardProps {
  variant?: CardVariant;
  title?: string;
  subtitle?: string;
  description?: string;
  metadata?: string[];
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  image?: ReactNode;
  activity?: ReactNode;
  comment?: ICardComment;
  children?: ReactNode;
  className?: string;
}
```

Exporta: `export { Card } from './Card'; export type { CardVariant, ICardProps } from './Card.types';`

### Checkbox  ·  `core/ui/components/Checkbox`

```ts
// Checkbox.types.ts
import type { InputHTMLAttributes, ReactNode } from 'react';

export interface ICheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  required?: boolean;
  indeterminate?: boolean;
  error?: boolean;
}
```

```ts
// ChoiceGroup.types.ts
import type { ReactNode } from 'react';

export interface IChoiceOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface IChoiceGroupProps {
  name: string;
  options: IChoiceOption[];
  label?: string;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  darkMode?: boolean;
  error?: boolean;
  onChange?: (value: string) => void;
  className?: string;
}
```

Exporta: `export { Checkbox } from './Checkbox'; export { ChoiceGroup } from './ChoiceGroup'; export type { ICheckboxProps } from './Checkbox.types'; export type { IChoiceGroupProps, IChoiceOption } from './ChoiceGroup.types';`

### ColorSwatch  ·  `core/ui/components/ColorSwatch`

```ts
// ColorSwatch.types.ts
export interface IColorSwatchProps {
  name: string;
  scale?: string;
  value: string;
  textColor?: string;
}
```

Exporta: `export { ColorSwatch } from './ColorSwatch'; export type { IColorSwatchProps } from './ColorSwatch.types';`

### Dropdown  ·  `core/ui/components/Dropdown`

```ts
// Combobox.types.ts
import type { IDropdownOption } from './Dropdown.types';

export interface IComboboxProps {
  label: string;
  options: IDropdownOption[];
  placeholder?: string;
  value?: string | string[];
  defaultValue?: string | string[];
  multiple?: boolean;
  required?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  darkMode?: boolean;
  dividerAfter?: number[];
  onChange?: (value: string | string[]) => void;
  className?: string;
}
```

```ts
// Dropdown.types.ts
export interface IDropdownOption {
  key: string;
  text: string;
  disabled?: boolean;
}

export interface IDropdownProps {
  label: string;
  options: IDropdownOption[];
  placeholder?: string;
  value?: string | string[];
  defaultValue?: string | string[];
  multiple?: boolean;
  required?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  darkMode?: boolean;
  className?: string;
  onChange?: (value: string | string[]) => void;
}
```

Exporta: `export { Dropdown } from './Dropdown'; export { Combobox } from './Combobox'; export type { IDropdownOption, IDropdownProps } from './Dropdown.types'; export type { IComboboxProps } from './Combobox.types';`

### Input  ·  `core/ui/components/Input`

```ts
// Input.types.ts
import type { InputHTMLAttributes, ReactNode } from 'react';

export interface IInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  required?: boolean;
  errorMessage?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  readOnly?: boolean;
}
```

```ts
// Multiline.types.ts
import type { TextareaHTMLAttributes } from 'react';

export interface IMultilineProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  errorMessage?: string;
}
```

```ts
// SpinButton.types.ts
import type { InputHTMLAttributes } from 'react';

export interface ISpinButtonProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  required?: boolean;
  errorMessage?: string;
  step?: number;
}
```

```ts
// TimeInput.types.ts
import type { IInputProps } from './Input.types';

export interface ITimeInputProps extends Omit<IInputProps, 'type'> {
  value?: string;
  defaultValue?: string;
}
```

Exporta: `export { Input } from './Input'; export { Multiline } from './Multiline'; export { SpinButton } from './SpinButton'; export { TimeInput } from './TimeInput'; export type { IInputProps } from './Input.types'; export type { IMultilineProps } from './Multiline.types'; export type { ISpinButtonProps } from './SpinButton.types'; export type { ITimeInputProps } from './TimeInput.types';`

### PersonaTag  ·  `core/ui/components/PersonaTag`

```ts
// PersonaTag.types.ts
import type { ReactNode } from 'react';

export interface IPersonaTagProps {
  name: string;
  avatar?: ReactNode;
  initials?: string;
  removable?: boolean;
  darkMode?: boolean;
  className?: string;
  onRemove?: () => void;
}
```

Exporta: `export { PersonaTag } from './PersonaTag'; export type { IPersonaTagProps } from './PersonaTag.types';`

### Rating  ·  `core/ui/components/Rating`

```ts
// Rating.types.ts
import type { ReactNode } from 'react';

export type RatingSize = 'large' | 'small';

export interface IRatingProps {
  label?: ReactNode;
  required?: boolean;
  rating?: number;
  defaultRating?: number;
  max?: number;
  size?: RatingSize;
  disabled?: boolean;
  readOnly?: boolean;
  darkMode?: boolean;
  ariaLabel?: string;
  ariaLabelFormat?: string;
  id?: string;
  className?: string;
  onChange?: (rating: number) => void;
}
```

Exporta: `export { Rating } from './Rating'; export type { IRatingProps, RatingSize } from './Rating.types';`

### Scrollable  ·  `core/ui/components/Scrollable`

```ts
// Scrollable.types.ts
import type { ReactNode } from 'react';

export type ScrollDirection = 'vertical' | 'horizontal' | 'both';

export interface IScrollableProps {
  children: ReactNode;
  direction?: ScrollDirection;
  maxHeight?: number | string;
  maxWidth?: number | string;
  className?: string;
}
```

Exporta: `export { Scrollable } from './Scrollable'; export type { IScrollableProps, ScrollDirection } from './Scrollable.types';`

### Slider  ·  `core/ui/components/Slider`

```ts
// Slider.types.ts
import type { ReactNode } from 'react';

export type SliderDirection = 'horizontal' | 'vertical';
export type SliderValue = number | [number, number];

export interface ISliderProps {
  label?: ReactNode;
  value?: SliderValue;
  defaultValue?: SliderValue;
  min?: number;
  max?: number;
  step?: number;
  direction?: SliderDirection;
  disabled?: boolean;
  darkMode?: boolean;
  onChange?: (value: SliderValue) => void;
  className?: string;
}
```

Exporta: `export { Slider } from './Slider'; export type { ISliderProps, SliderDirection, SliderValue } from './Slider.types';`

### Switch  ·  `core/ui/components/Switch`

```ts
// Switch.types.ts
import type { ReactNode } from 'react';

export type SwitchLabelPosition = 'top' | 'inlineRight' | 'inlineLeft';

export interface ISwitchProps {
  label?: ReactNode;
  active?: boolean;
  defaultActive?: boolean;
  labelPosition?: SwitchLabelPosition;
  textOff?: boolean;
  disabled?: boolean;
  darkMode?: boolean;
  onChange?: (active: boolean) => void;
  className?: string;
}
```

Exporta: `export { Switch } from './Switch'; export type { ISwitchProps, SwitchLabelPosition } from './Switch.types';`

### Table  ·  `core/ui/components/Table`

```ts
// Table.types.ts
import type { ReactNode } from 'react';

export type TableCellKind = 'text' | 'checkbox' | 'radio' | 'icon' | 'dropdown' | 'trailIcons' | 'chip' | 'link';
export type TableSelectionType = 'checkbox' | 'radio';

export interface ITableColumn<T> {
  key: string;
  header: ReactNode;
  kind?: TableCellKind;
  width?: string | number;
  render?: (value: unknown, row: T, rowIndex: number) => ReactNode;
}

export interface ITableGroup<T> {
  key: string;
  header: ReactNode;
  rows: T[];
  defaultCollapsed?: boolean;
}

export type TableRowHeight<T> = number | ((row: T, rowIndex: number) => number | undefined);

export interface ITableProps<T extends Record<string, unknown>> {
  columns: ITableColumn<T>[];
  rows: T[];
  groups?: ITableGroup<T>[];
  getRowKey?: (row: T, rowIndex: number) => string;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  selectable?: boolean;
  selectionType?: TableSelectionType;
  darkMode?: boolean;
  compact?: boolean;
  rowHeight?: TableRowHeight<T>;
  toolbar?: ReactNode;
  emptyText?: ReactNode;
  className?: string;
}
```

Exporta: `export { Table } from './Table'; export type { ITableColumn, ITableGroup, ITableProps, TableCellKind, TableRowHeight } from './Table.types';`

### Tooltip  ·  `core/ui/components/Tooltip`

```ts
// Tooltip.types.ts
import type { ReactNode } from 'react';

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

export interface ITooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  darkMode?: boolean;
  disabled?: boolean;
  className?: string;
}
```

Exporta: `export { Tooltip } from './Tooltip'; export type { ITooltipProps, TooltipPosition } from './Tooltip.types';`

## Patterns

### ActivityItems  ·  `core/ui/patterns/ActivityItems`

```ts
// ActivityItems.types.ts
import type { ReactNode } from 'react';

export type ActivityStatus = 'neutral' | 'info' | 'success' | 'warning' | 'critical';
export type ActivityItemVariant = 'comment' | 'deletion' | 'notice' | 'photoComment';

export interface IActivityItem {
  key: string;
  variant: ActivityItemVariant;
  author: string;
  verb: string;
  description?: string;
  subject?: string;
  time?: string;
  avatarSrc?: string;
}

export interface IActivityItemsProps {
  items: IActivityItem[];
  title?: string;
  emptyMessage?: string;
  className?: string;
}
```

Exporta: `export { ActivityItem, ActivityItems } from './ActivityItems'; export type { IActivityItem, IActivityItemsProps, ActivityItemVariant, ActivityStatus } from './ActivityItems.types';`

### AttachmentUpload  ·  `core/ui/patterns/AttachmentUpload`

```ts
// AttachmentUpload.types.ts
import type { ChangeEvent, ReactNode } from 'react';

export type AttachmentUploadVariant = 'modern' | 'classic';

export interface IAttachmentUploadProps {
  label?: string;
  files?: string[];
  defaultFiles?: string[];
  required?: boolean;
  readOnly?: boolean;
  darkMode?: boolean;
  variant?: AttachmentUploadVariant;
  emptyText?: string;
  uploadLabel?: string;
  onFilesChange?: (files: File[], names: string[]) => void;
  onRemove?: (fileName: string, index: number) => void;
  className?: string;
  children?: ReactNode;
  onInputChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}
```

Exporta: `export { AttachmentUpload } from './AttachmentUpload'; export type { AttachmentUploadVariant, IAttachmentUploadProps } from './AttachmentUpload.types';`

### Chips  ·  `core/ui/patterns/Chips`

```ts
// Chips.types.ts
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ChipVariant = 'filled' | 'outline' | 'subtle';
export type ChipSize = 'small' | 'medium' | 'large';
export type ChipColor = 'neutral' | 'brand' | 'secondary' | 'success' | 'warning' | 'danger';

export interface IChipItem {
  key: string;
  label: string;
  value?: string;
  selected?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  ariaLabel?: string;
  onRemove?: (key: string) => void;
}

export interface IChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onChange'> {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  variant?: ChipVariant;
  size?: ChipSize;
  color?: ChipColor;
  stroke?: boolean;
  clickable?: boolean;
  darkMode?: boolean;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export interface IChipsProps {
  items: IChipItem[];
  value?: string[];
  defaultValue?: string[];
  multiSelect?: boolean;
  variant?: ChipVariant;
  size?: ChipSize;
  color?: ChipColor;
  stroke?: boolean;
  clickable?: boolean;
  darkMode?: boolean;
  disabled?: boolean;
  removable?: boolean;
  onChange?: (selectedKeys: string[]) => void;
  onSelect?: (item: IChipItem, selectedKeys: string[]) => void;
  className?: string;
}
```

Exporta: `export { Chip, Chips } from './Chips'; export type { ChipColor, ChipSize, ChipVariant, IChipItem, IChipProps, IChipsProps } from './Chips.types';`

### CommandBar  ·  `core/ui/patterns/CommandBar`

```ts
// CommandBar.types.ts
import type { ReactNode } from 'react';

export interface ICommandBarMenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

export interface ICommandBarItem {
  key: string;
  label: string;
  icon?: ReactNode;
  menu?: ReactNode;
  menuItems?: ICommandBarMenuItem[];
  disabled?: boolean;
  onClick?: () => void;
}

export interface ICommandBarProps {
  items: ICommandBarItem[];
  darkMode?: boolean;
  className?: string;
}
```

Exporta: `export { CommandBar } from './CommandBar'; export type { ICommandBarItem, ICommandBarMenuItem, ICommandBarProps } from './CommandBar.types';`

### EmptyState  ·  `core/ui/patterns/EmptyState`

```ts
// EmptyState.types.ts
import type { ReactNode } from 'react';

export interface IEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  icon?: ReactNode;
  action?: ReactNode;
  darkMode?: boolean;
  className?: string;
  onAction?: () => void;
}
```

Exporta: `export { EmptyState } from './EmptyState'; export type { IEmptyStateProps } from './EmptyState.types';`

### Filters  ·  `core/ui/patterns/Filters`

```ts
// Filters.types.ts
import type { ReactNode } from 'react';

export interface IFilterOption {
  value: string;
  label: string;
}

export interface IFilterDefinition {
  key: string;
  options: IFilterOption[];
  placeholder?: string;
}

export type FilterValues = Record<string, string>;

export interface IFiltersProps {
  title?: string;
  helperText?: string;
  filters: IFilterDefinition[];
  values?: FilterValues;
  defaultValues?: FilterValues;
  darkMode?: boolean;
  onChange?: (key: string, value: string, values: FilterValues) => void;
  onApply?: (values: FilterValues) => void;
  onReset?: () => void;
  applyIcon?: ReactNode;
  resetIcon?: ReactNode;
  className?: string;
}
```

Exporta: `export { Filters } from './Filters'; export type { FilterValues, IFilterDefinition, IFilterOption, IFiltersProps } from './Filters.types';`

### Footer  ·  `core/ui/patterns/Footer`

```ts
// Footer.types.ts
import type { ReactNode } from 'react';

export interface IFooterProps {
  primaryText?: string;
  secondaryText?: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  darkMode?: boolean;
  children?: ReactNode;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  className?: string;
}
```

Exporta: `export { Footer } from './Footer'; export type { IFooterProps } from './Footer.types';`

### Header  ·  `core/ui/patterns/Header`

```ts
// Header.types.ts
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type HeaderColor = 'blue' | 'dark' | 'white';

export interface IHeaderProps {
  color?: HeaderColor;
  mobile?: boolean;
  showLogo?: boolean;
  logo?: ReactNode;
  showMenu?: boolean;
  menuIcon?: ReactNode;
  menuAriaLabel?: string;
  onMenuClick?: () => void;
  appIcon?: ReactNode;
  separator?: boolean;
  title?: string;
  description?: string;
  showPlatformLogo?: boolean;
  platformLogo?: ReactNode;
  rightContent?: ReactNode;
  actions?: ReactNode;
  userName?: string;
  userRole?: string;
  className?: string;
}

export interface INativeHeaderProps extends ButtonHTMLAttributes<HTMLDivElement> {
  logo?: ReactNode;
  search?: ReactNode;
  actions?: ReactNode;
  user?: ReactNode;
  className?: string;
}
```

Exporta: `export { Header, NativeHeader } from './Header'; export type { HeaderColor, IHeaderProps, INativeHeaderProps } from './Header.types';`

### HomeCards  ·  `core/ui/patterns/HomeCards`

```ts
// HomeCards.types.ts
import type { ReactNode } from 'react';

export type HomeCardType = 'simple' | 'bandeja' | 'detail' | 'simpleButton';

export interface IHomeCardProps {
  type?: HomeCardType;
  title: string;
  value?: string;
  icon?: ReactNode;
  details?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}
```

Exporta: `export { HomeCard } from './HomeCards'; export type { HomeCardType, IHomeCardProps } from './HomeCards.types';`

### Modal  ·  `core/ui/patterns/Modal`

```ts
// Modal.types.ts
import type { ReactNode } from 'react';

export type ModalVariant = 'default' | 'oneSlot' | 'twoSlots';

export interface IModalProps {
  open: boolean;
  title?: string;
  description?: string;
  variant?: ModalVariant;
  darkMode?: boolean;
  children?: ReactNode;
  secondaryContent?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  onClose?: () => void;
  closeOnOverlayClick?: boolean;
  className?: string;
}
```

Exporta: `export { Modal } from './Modal'; export type { IModalProps, ModalVariant } from './Modal.types';`

### Notifications  ·  `core/ui/patterns/Notifications`

```ts
// MessageBar.types.ts
import type { ReactNode } from 'react';

export type MessageBarType = 'success' | 'info' | 'warning' | 'error' | 'blocked' | 'severeWarning';

export interface IMessageBarProps {
  type?: MessageBarType;
  message: string;
  darkMode?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  multiline?: boolean;
  dismissible?: boolean;
  actions?: ReactNode;
  iconName?: string;
  iconColor?: string;
  onClose?: () => void;
  onToggle?: (open: boolean) => void;
  icon?: ReactNode;
  className?: string;
}
```

Exporta: `export { MessageBar } from './MessageBar'; export { Toast } from './Toast'; export type { IMessageBarProps, MessageBarType } from './MessageBar.types'; export type { IToastProps, ToastVariant } from './Toast';`

### Panel  ·  `core/ui/patterns/Panel`

```ts
// Panel.types.ts
import type { ReactNode } from 'react';

export interface IPanelProps {
  open: boolean;
  title?: string;
  children?: ReactNode;
  footerSlot?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  onClose?: () => void;
  className?: string;
}
```

Exporta: `export { Panel } from './Panel'; export type { IPanelProps } from './Panel.types';`

### PeopleSuggestion  ·  `core/ui/patterns/PeopleSuggestion`

```ts
// PeopleSuggestion.types.ts
import type { ReactNode } from 'react';

export interface IPeopleSuggestionProps {
  name: string;
  secondaryText?: string;
  avatarSrc?: string;
  avatarIcon?: ReactNode;
  initials?: string;
  selected?: boolean;
  disabled?: boolean;
  darkMode?: boolean;
  className?: string;
  onSelect?: () => void;
}
```

Exporta: `export { PeopleSuggestion } from './PeopleSuggestion'; export type { IPeopleSuggestionProps } from './PeopleSuggestion.types';`

### Picker  ·  `core/ui/patterns/Picker`

```ts
// Picker.types.ts
import type { ReactNode } from 'react';

export type PickerMode = 'date' | 'people';

export interface IPersonOption {
  key: string;
  name: string;
  secondaryText?: string;
  avatar?: ReactNode;
}

export interface IPickerProps {
  mode: PickerMode;
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  people?: IPersonOption[];
  selectedPeople?: IPersonOption[];
  defaultSelectedPeople?: IPersonOption[];
  open?: boolean;
  darkMode?: boolean;
  required?: boolean;
  onChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  onPersonSelect?: (person: IPersonOption) => void;
  onSelectedPeopleChange?: (people: IPersonOption[]) => void;
  className?: string;
}
```

Exporta: `export { Picker } from './Picker'; export type { IPersonOption, IPickerProps, PickerMode } from './Picker.types';`

### Pivot  ·  `core/ui/patterns/Pivot`

```ts
// Pivot.types.ts
import type { ReactNode } from 'react';

export interface IPivotItem {
  key: string;
  label: string;
  icon?: ReactNode;
  content?: ReactNode;
}

export interface IPivotProps {
  items: IPivotItem[];
  value?: string;
  defaultValue?: string;
  darkMode?: boolean;
  ariaLabel?: string;
  onChange?: (key: string) => void;
  className?: string;
}
```

Exporta: `export { Pivot } from './Pivot'; export type { IPivotProps, IPivotItem } from './Pivot.types';`

### Progress  ·  `core/ui/patterns/Progress`

```ts
// Progress.types.ts
import type { ReactNode } from 'react';

export type SpinnerLabelPosition = 'above' | 'below' | 'left' | 'right';

export interface ISpinnerProps {
  text?: string;
  labelPosition?: SpinnerLabelPosition;
  darkMode?: boolean;
  icon?: ReactNode;
  className?: string;
}

export interface IProgressBarProps {
  title?: string;
  description?: string;
  value?: number;
  darkMode?: boolean;
  className?: string;
}
```

Exporta: `export { ProgressBar, Spinner } from './Progress'; export type { IProgressBarProps, ISpinnerProps, SpinnerLabelPosition } from './Progress.types';`

### SearchBox  ·  `core/ui/patterns/SearchBox`

```ts
// SearchBox.types.ts
import type { InputHTMLAttributes } from 'react';

export interface ISearchBoxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onSubmit'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSearch?: (value: string) => void;
}
```

Exporta: `export { SearchBox } from './SearchBox'; export type { ISearchBoxProps } from './SearchBox.types';`

### Surfaces  ·  `core/ui/patterns/Surfaces`

```ts
// Surfaces.types.ts
import type { CSSProperties, ReactNode } from 'react';

export type SurfaceVariant = 'default' | 'subtle' | 'raised' | 'outline' | 'dark';
export type SurfacePadding = 'none' | 'compact' | 'comfortable' | 'spacious';

export interface ISurfaceProps {
  children?: ReactNode;
  variant?: SurfaceVariant;
  padding?: SurfacePadding;
  borderRadius?: number;
  darkMode?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  style?: CSSProperties;
}
```

Exporta: `export { Surface } from './Surfaces'; export type { ISurfaceProps, SurfacePadding, SurfaceVariant } from './Surfaces.types';`

### TableFilters  ·  `core/ui/patterns/TableFilters`

```ts
// TableFilters.types.ts
import type { ReactNode } from 'react';

export interface ITableFiltersProps {
  title?: string;
  info?: string;
  showTitle?: boolean;
  showBack?: boolean;
  backLabel?: string;
  onBack?: () => void;
  children?: ReactNode;
  onReload?: () => void;
  onApply?: () => void;
  darkMode?: boolean;
  className?: string;
}
```

Exporta: `export { TableFilters } from './TableFilters'; export type { ITableFiltersProps } from './TableFilters.types';`

### Tabs  ·  `core/ui/patterns/Tabs`

```ts
// Tabs.types.ts
import type { ReactNode } from 'react';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsSize = 'medium' | 'small';
export type TabsStyle = 'transparent' | 'subtle' | 'filled';

export interface ITabItem {
  key: string;
  label?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface ITabsProps {
  items: ITabItem[];
  value?: string;
  defaultValue?: string;
  orientation?: TabsOrientation;
  size?: TabsSize;
  variant?: TabsStyle;
  circular?: boolean;
  ariaLabel?: string;
  onChange?: (key: string) => void;
  className?: string;
}
```

Exporta: `export { Tabs } from './Tabs'; export type { ITabItem, ITabsProps, TabsOrientation, TabsSize, TabsStyle } from './Tabs.types';`

## Layouts

### Nav  ·  `core/ui/layouts/Nav`

```ts
// Nav.types.ts
import type { ReactNode } from 'react';

export type NavItemStatus = 'default' | 'hover' | 'active' | 'disabled' | 'open';

export interface INavItem {
  key: string;
  label: string;
  icon?: ReactNode;
  status?: NavItemStatus;
  children?: INavItem[];
}

export interface INavProps {
  items: INavItem[];
  title?: string;
  showHeader?: boolean;
  darkMode?: boolean;
  open?: boolean;
  selectedKey?: string;
  onClose?: () => void;
  onItemClick?: (item: INavItem) => void;
  className?: string;
}
```

Exporta: `export { Nav } from './Nav'; export type { INavItem, INavProps, NavItemStatus } from './Nav.types';`
