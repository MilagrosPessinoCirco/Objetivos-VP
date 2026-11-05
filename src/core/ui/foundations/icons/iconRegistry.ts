import type { DesignSystemIconSize, IconVariant } from './sizes';

const attachIcons: Record<DesignSystemIconSize, Record<IconVariant, string>> = {
  xs: {
    outline: require('./assets/attach/attach-12-outline.svg'),
    filled: require('./assets/attach/attach-12-filled.svg'),
  },
  sm: {
    outline: require('./assets/attach/attach-16-outline.svg'),
    filled: require('./assets/attach/attach-16-filled.svg'),
  },
  md: {
    outline: require('./assets/attach/attach-20-outline.svg'),
    filled: require('./assets/attach/attach-20-filled.svg'),
  },
  lg: {
    outline: require('./assets/attach/attach-24-outline.svg'),
    filled: require('./assets/attach/attach-24-filled.svg'),
  },
  xl: {
    outline: require('./assets/attach/attach-28-outline.svg'),
    filled: require('./assets/attach/attach-28-filled.svg'),
  },
  xxl: {
    outline: require('./assets/attach/attach-32-outline.svg'),
    filled: require('./assets/attach/attach-32-filled.svg'),
  },
  xxxl: {
    outline: require('./assets/attach/attach-48-outline.svg'),
    filled: require('./assets/attach/attach-48-filled.svg'),
  },
};

const attachPrimaryIcons: Record<DesignSystemIconSize, Record<IconVariant, string>> = {
  xs: {
    outline: require('./assets/attach/attach-12-outline-primary.svg'),
    filled: require('./assets/attach/attach-12-filled-primary.svg'),
  },
  sm: {
    outline: require('./assets/attach/attach-16-outline-primary.svg'),
    filled: require('./assets/attach/attach-16-filled-primary.svg'),
  },
  md: {
    outline: require('./assets/attach/attach-20-outline-primary.svg'),
    filled: require('./assets/attach/attach-20-filled-primary.svg'),
  },
  lg: {
    outline: require('./assets/attach/attach-24-outline-primary.svg'),
    filled: require('./assets/attach/attach-24-filled-primary.svg'),
  },
  xl: {
    outline: require('./assets/attach/attach-28-outline-primary.svg'),
    filled: require('./assets/attach/attach-28-filled-primary.svg'),
  },
  xxl: {
    outline: require('./assets/attach/attach-32-outline-primary.svg'),
    filled: require('./assets/attach/attach-32-filled-primary.svg'),
  },
  xxxl: {
    outline: require('./assets/attach/attach-48-outline-primary.svg'),
    filled: require('./assets/attach/attach-48-filled-primary.svg'),
  },
};

const fileTypeIcons = {
  docx: {
    xxxl: require('./assets/file-types/docx-48.svg'),
  },
  xlsx: {
    xxxl: require('./assets/file-types/xlsx-48.svg'),
  },
  ppt: {
    xxxl: require('./assets/file-types/ppt-48.svg'),
  },
  form: {
    xxxl: require('./assets/file-types/form-48.svg'),
  },
} as const;

// Scalable single-source icons, valid at any size.
const generalIcons = {
  search: require('./assets/general/search.svg'),
  searchPrimary: require('./assets/general/search-primary.svg'),
  filter: require('./assets/general/filter.svg'),
  filterPrimary: require('./assets/general/filter-primary.svg'),
  upload: require('./assets/general/upload.svg'),
  uploadPrimary: require('./assets/general/upload-primary.svg'),
  checkmark: require('./assets/general/checkmark.svg'),
  checkmarkPrimary: require('./assets/general/checkmark-primary.svg'),
  chevronDown: require('./assets/general/chevron-down.svg'),
  chevronDownPrimary: require('./assets/general/chevron-down-primary.svg'),
  chevronRight: require('./assets/general/chevron-right.svg'),
  chevronRightPrimary: require('./assets/general/chevron-right-primary.svg'),
  menu: require('./assets/general/menu.svg'),
  menuPrimary: require('./assets/general/menu-primary.svg'),
  close: require('./assets/general/close.svg'),
  closePrimary: require('./assets/general/close-primary.svg'),
  home: require('./assets/general/home.svg'),
  homePrimary: require('./assets/general/home-primary.svg'),
  info: require('./assets/general/info.svg'),
  infoPrimary: require('./assets/general/info-primary.svg'),
  clock: require('./assets/general/clock.svg'),
  clockPrimary: require('./assets/general/clock-primary.svg'),
  add: require('./assets/general/add.svg'),
  addPrimary: require('./assets/general/add-primary.svg'),
  navigate: require('./assets/general/navigate.svg'),
  navigatePrimary: require('./assets/general/navigate-primary.svg'),
  reload: require('./assets/general/reload.svg'),
  reloadPrimary: require('./assets/general/reload-primary.svg'),
  arrowCircle: require('./assets/general/arrow-circle.svg'),
  arrowCirclePrimary: require('./assets/general/arrow-circle-primary.svg'),
  chevronCirclePrimary: require('./assets/general/chevron-circle-primary.svg'),
  edit: require('./assets/general/edit.svg'),
  editPrimary: require('./assets/general/edit-primary.svg'),
  delete: require('./assets/general/delete.svg'),
  deletePrimary: require('./assets/general/delete-primary.svg'),
  copy: require('./assets/general/copy.svg'),
  copyPrimary: require('./assets/general/copy-primary.svg'),
  alertPrimary: require('./assets/general/alert-primary.svg'),
  download: require('./assets/general/download.svg'),
  downloadPrimary: require('./assets/general/download-primary.svg'),
  settings: require('./assets/general/settings.svg'),
  settingsPrimary: require('./assets/general/settings-primary.svg'),
  more: require('./assets/general/more.svg'),
  morePrimary: require('./assets/general/more-primary.svg'),
  eye: require('./assets/general/eye.svg'),
  eyePrimary: require('./assets/general/eye-primary.svg'),
  bookmark: require('./assets/general/bookmark.svg'),
  bookmarkPrimary: require('./assets/general/bookmark-primary.svg'),
  arrowForward: require('./assets/general/arrow-forward.svg'),
  arrowForwardPrimary: require('./assets/general/arrow-forward-primary.svg'),
  calendar: require('./assets/general/calendar.svg'),
  calendarPrimary: require('./assets/general/calendar-primary.svg'),
  applications: require('./assets/general/applications.svg'),
  mail: require('./assets/general/mail.svg'),
  mailPrimary: require('./assets/general/mail-primary.svg'),
  user: require('./assets/general/user.svg'),
  userPrimary: require('./assets/general/user-primary.svg'),
  users: require('./assets/general/users.svg'),
  usersPrimary: require('./assets/general/users-primary.svg'),
  lock: require('./assets/general/lock.svg'),
  lockPrimary: require('./assets/general/lock-primary.svg'),
  star: require('./assets/general/star.svg'),
  starPrimary: require('./assets/general/star-primary.svg'),
  bell: require('./assets/general/bell.svg'),
  bellPrimary: require('./assets/general/bell-primary.svg'),
  alert: require('./assets/general/alert.svg'),
  flag: require('./assets/general/flag.svg'),
  flagPrimary: require('./assets/general/flag-primary.svg'),
  globe: require('./assets/general/globe.svg'),
  globePrimary: require('./assets/general/globe-primary.svg'),
  list: require('./assets/general/list.svg'),
  listPrimary: require('./assets/general/list-primary.svg'),
  tag: require('./assets/general/tag.svg'),
  tagPrimary: require('./assets/general/tag-primary.svg'),
  pin: require('./assets/general/pin.svg'),
  pinPrimary: require('./assets/general/pin-primary.svg'),
  chat: require('./assets/general/chat.svg'),
  chatPrimary: require('./assets/general/chat-primary.svg'),
  communication: require('./assets/general/communication.svg'),
} as const;

const sizeIconAssets = {
  xs: '12',
  sm: '16',
  md: '20',
  lg: '24',
  xl: '28',
  xxl: '32',
  xxxl: '48',
} as const;

const additionalGeneralIcons = {
  arrowDownload: {
    xs: require('./assets/actions/arrow-download-regular-12.svg'),
    sm: require('./assets/actions/arrow-download-regular-16.svg'),
    md: require('./assets/actions/arrow-download-regular-20.svg'),
    lg: require('./assets/actions/arrow-download-regular-24.svg'),
    xl: require('./assets/actions/arrow-download-regular-28.svg'),
    xxl: require('./assets/actions/arrow-download-regular-32.svg'),
    xxxl: require('./assets/actions/arrow-download-regular-48.svg'),
  },
  arrowDownloadPrimary: {
    xs: require('./assets/actions/arrow-download-primary-12.svg'),
    sm: require('./assets/actions/arrow-download-primary-16.svg'),
    md: require('./assets/actions/arrow-download-primary-20.svg'),
    lg: require('./assets/actions/arrow-download-primary-24.svg'),
    xl: require('./assets/actions/arrow-download-primary-28.svg'),
    xxl: require('./assets/actions/arrow-download-primary-32.svg'),
    xxxl: require('./assets/actions/arrow-download-primary-48.svg'),
  },
  history: {
    xs: require('./assets/actions/history-regular-12.svg'),
    sm: require('./assets/actions/history-regular-16.svg'),
    md: require('./assets/actions/history-regular-20.svg'),
    lg: require('./assets/actions/history-regular-24.svg'),
    xl: require('./assets/actions/history-regular-28.svg'),
    xxl: require('./assets/actions/history-regular-32.svg'),
    xxxl: require('./assets/actions/history-regular-48.svg'),
  },
  historyFilled: {
    xs: require('./assets/actions/history-primary-12.svg'),
    sm: require('./assets/actions/history-primary-16.svg'),
    md: require('./assets/actions/history-primary-20.svg'),
    lg: require('./assets/actions/history-primary-24.svg'),
    xl: require('./assets/actions/history-primary-28.svg'),
    xxl: require('./assets/actions/history-primary-32.svg'),
    xxxl: require('./assets/actions/history-primary-48.svg'),
  },
  folderAdd: {
    xs: require('./assets/actions/folder-add-regular-12.svg'),
    sm: require('./assets/actions/folder-add-regular-16.svg'),
    md: require('./assets/actions/folder-add-regular-20.svg'),
    lg: require('./assets/actions/folder-add-regular-24.svg'),
    xl: require('./assets/actions/folder-add-regular-28.svg'),
    xxl: require('./assets/actions/folder-add-regular-32.svg'),
    xxxl: require('./assets/actions/folder-add-regular-48.svg'),
  },
  folderAddFilled: {
    xs: require('./assets/actions/folder-add-primary-12.svg'),
    sm: require('./assets/actions/folder-add-primary-16.svg'),
    md: require('./assets/actions/folder-add-primary-20.svg'),
    lg: require('./assets/actions/folder-add-primary-24.svg'),
    xl: require('./assets/actions/folder-add-primary-28.svg'),
    xxl: require('./assets/actions/folder-add-primary-32.svg'),
    xxxl: require('./assets/actions/folder-add-primary-48.svg'),
  },
  archive: {
    xs: require('./assets/general/archive-regular-12.svg'),
    sm: require('./assets/general/archive-regular-16.svg'),
    md: require('./assets/general/archive-regular-20.svg'),
    lg: require('./assets/general/archive-regular-24.svg'),
    xl: require('./assets/general/archive-regular-28.svg'),
    xxl: require('./assets/general/archive-regular-32.svg'),
    xxxl: require('./assets/general/archive-regular-48.svg'),
  },
  archiveFilled: {
    xs: require('./assets/general/archive-primary-12.svg'),
    sm: require('./assets/general/archive-primary-16.svg'),
    md: require('./assets/general/archive-primary-20.svg'),
    lg: require('./assets/general/archive-primary-24.svg'),
    xl: require('./assets/general/archive-primary-28.svg'),
    xxl: require('./assets/general/archive-primary-32.svg'),
    xxxl: require('./assets/general/archive-primary-48.svg'),
  },
} as const;

const closeCircleIcons = {
  xs: require('./assets/general/close-circle-16.svg'),
  sm: require('./assets/general/close-circle-20.svg'),
  md: require('./assets/general/close-circle-20.svg'),
  lg: require('./assets/general/close-circle-20.svg'),
  xl: require('./assets/general/close-circle-20.svg'),
  xxl: require('./assets/general/close-circle-20.svg'),
  xxxl: require('./assets/general/close-circle-20.svg'),
} as const;

const closeCirclePrimaryIcons = {
  xs: require('./assets/general/close-circle-16-primary.svg'),
  sm: require('./assets/general/close-circle-20-primary.svg'),
  md: require('./assets/general/close-circle-20-primary.svg'),
  lg: require('./assets/general/close-circle-20-primary.svg'),
  xl: require('./assets/general/close-circle-20-primary.svg'),
  xxl: require('./assets/general/close-circle-20-primary.svg'),
  xxxl: require('./assets/general/close-circle-20-primary.svg'),
} as const;

export type GeneralIconName = keyof typeof generalIcons;
export type FileTypeIconName = keyof typeof fileTypeIcons;

export type AdditionalGeneralIconName = keyof typeof additionalGeneralIcons;
export type FigmaIconName = 'attach' | 'attachPrimary' | 'closeCircle' | 'closeCirclePrimary' | FileTypeIconName | GeneralIconName | AdditionalGeneralIconName;

const fileTypeIconNames = Object.keys(fileTypeIcons) as FileTypeIconName[];

function isFileTypeIcon(name: FigmaIconName): name is FileTypeIconName {
  return fileTypeIconNames.indexOf(name as FileTypeIconName) >= 0;
}

export function getFigmaIconSource(
  name: FigmaIconName,
  size: DesignSystemIconSize,
  variant: IconVariant,
): string {
  if (name === 'attach') {
    return attachIcons[size][variant];
  }

  if (name === 'attachPrimary') {
    return attachPrimaryIcons[size][variant];
  }

  if (name === 'closeCircle') {
    return closeCircleIcons[size];
  }

  if (name === 'closeCirclePrimary') {
    return closeCirclePrimaryIcons[size];
  }

  if (isFileTypeIcon(name)) {
    if (size !== 'xxxl') {
      throw new Error(`The ${name} icon is only available at 48px.`);
    }
    return fileTypeIcons[name].xxxl;
  }

  if (name in additionalGeneralIcons) {
    return additionalGeneralIcons[name as AdditionalGeneralIconName][size];
  }

  return generalIcons[name as GeneralIconName];
}
