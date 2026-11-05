export type DesignSystemImageName = 'coverBackground' | 'homeCover' | 'avatarPhoto' | 'activityAvatar';

// Raster images exported from the Figma "DS - Sharepoint - Fluent UI v8".
const images: Record<DesignSystemImageName, string> = {
  coverBackground: require('./assets/cover-background.png'),
  homeCover: require('./assets/home-cover.png'),
  avatarPhoto: require('./assets/avatar-photo.png'),
  activityAvatar: require('./assets/activity-avatar.png'),
};

export function getImageSource(name: DesignSystemImageName): string {
  return images[name];
}
