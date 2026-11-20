import * as React from 'react';
import { Avatar } from '../../components/Avatar';
import { FigmaIcon, getImageSource } from '../../foundations';
import styles from './ActivityItems.module.scss';
import type { IActivityItem, IActivityItemsProps } from './ActivityItems.types';

const iconByVariant = {
  comment: 'chat',
  deletion: 'delete',
  notice: 'communication',
} as const;

export const ActivityItem: React.FC<IActivityItem> = ({
  variant,
  author,
  verb,
  description,
  subject,
  time,
  avatarSrc,
}) => {
  const isPhotoComment = variant === 'photoComment';
  const hasDescription = variant === 'comment' || isPhotoComment;
  const itemClassName = `${styles.item} ${hasDescription ? styles.comment : ''}`;
  const contentClassName = `${styles.content} ${hasDescription ? styles.wideContent : ''}`;

  return (
    <article className={itemClassName}>
      {isPhotoComment ? (
        <Avatar type="photo" src={avatarSrc || getImageSource('activityAvatar')} size="md" alt={author} />
      ) : (
        <FigmaIcon name={iconByVariant[variant as keyof typeof iconByVariant]} size="md" className={styles.icon} />
      )}
      <div className={contentClassName}>
        <div className={styles.header}>
          <span className={styles.author}>{author}</span>
          <span className={styles.verb}>{verb}</span>
          {subject && <span className={styles.subject}>{subject}</span>}
        </div>
        {description && <p className={styles.description}>{description}</p>}
        {time && <span className={styles.time}>{time}</span>}
      </div>
    </article>
  );
};

export const ActivityItems: React.FC<IActivityItemsProps> = ({
  items,
  title = 'Actividad reciente',
  emptyMessage = 'No hay actividad reciente.',
  className,
}) => {
  if (!items || items.length === 0) {
    return (
      <section className={`${styles.activityItems} ${className || ''}`} aria-label={title}>
        <p className={styles.empty}>{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className={`${styles.activityItems} ${className || ''}`} aria-label={title}>
      <div className={styles.list}>
        {items.map(({ key, ...item }) => (
          <ActivityItem key={key} {...item} />
        ))}
      </div>
    </section>
  );
};
