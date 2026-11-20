import * as React from 'react';
import { DocumentCard, PrimaryButton } from '@fluentui/react';
import styles from './Card.module.scss';
import type { ICardProps } from './Card.types';

const variantClasses = {
  simple: styles.simple,
  bandeja: styles.bandeja,
  simpleButton: styles.simpleButton,
  detail: styles.detail,
  vertical: styles.vertical,
  horizontal: styles.horizontal,
};

export const Card: React.FC<ICardProps> = ({
  variant = 'detail',
  title = 'Title placeholder',
  subtitle,
  description,
  metadata = [],
  actionLabel = 'Ver detalle',
  onAction,
  icon,
  image,
  activity,
  comment,
  children,
  className,
}) => {
  const resolvedVariant = variant === 'tray' ? 'bandeja' : variant;
  const classNames = [styles.card, variantClasses[resolvedVariant], className || ''].join(' ');
  const action = actionLabel && <PrimaryButton className={styles.action} text={actionLabel} onClick={onAction} />;
  const commentContent = comment && (
    <div className={styles.comment}>
      {comment.avatar && <span className={styles.commentAvatar}>{comment.avatar}</span>}
      <div className={styles.commentBody}>
        <div className={styles.commentHeader}><strong>{comment.author}</strong><span>{comment.actionText || 'comentó'}</span></div>
        <p>{comment.text}</p>
      </div>
    </div>
  );
  const activityContent = activity || commentContent;

  if (children) {
    return <DocumentCard className={classNames}><div className={styles.customContent}>{children}</div></DocumentCard>;
  }

  if (resolvedVariant === 'simple' || resolvedVariant === 'bandeja') {
    return (
      <DocumentCard className={classNames}>
        <div className={resolvedVariant === 'simple' ? styles.simpleBody : styles.bandejaBody}>
          <h3 className={resolvedVariant === 'simple' ? styles.simpleTitle : styles.bandejaTitle}>{title}</h3>
          {subtitle && <p className={resolvedVariant === 'simple' ? styles.simpleSubtitle : styles.bandejaSubtitle}>{subtitle}</p>}
          {resolvedVariant === 'bandeja' && actionLabel && <button type="button" className={styles.textAction} onClick={onAction}>{actionLabel}</button>}
        </div>
        {icon && <span className={styles.cardIcon}>{icon}</span>}
      </DocumentCard>
    );
  }

  if (resolvedVariant === 'simpleButton') {
    return (
      <DocumentCard className={classNames}>
        {icon && <span className={styles.cardIcon}>{icon}</span>}
        <div className={styles.simpleButtonBody}>
          <h3 className={styles.title}>{title}</h3>
          {action}
        </div>
      </DocumentCard>
    );
  }

  return (
    <DocumentCard className={classNames}>
      {image && <div className={styles.image}>{image}</div>}
      {icon && <span className={styles.cardIcon}>{icon}</span>}
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        {description && <p>{description}</p>}
        {resolvedVariant !== 'vertical' && activityContent && <div className={styles.activity}>{activityContent}</div>}
        <div className={styles.actionRow}>
          <div className={styles.metadata}>
            {metadata.map((item) => <span key={item}>{item}</span>)}
          </div>
          {action}
        </div>
      </div>
      {resolvedVariant === 'vertical' && activityContent && <div className={styles.activity}>{activityContent}</div>}
    </DocumentCard>
  );
};
