export interface Category {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface Moderator {
  id: string;
  initials: string;
  name: string;
  role: string;
}

export type MessageStatus = 'pending' | 'approved' | 'blocked' | 'escalated';
export type FeedStatus = 'safe' | 'flagged' | 'blocked';
export type Severity = 'danger' | 'amber';
export type ToastKind = 'approve' | 'block' | 'escalate';
export type NavPage = 'overview' | 'review' | 'feed' | 'analytics' | 'categories' | 'audit' | 'settings';

export interface QueueMessage {
  id: string;
  ts: number;
  sender: string;
  recipient?: string;
  cats: [string, number][];
  ar: string;
  en: string;
  ar_expl: string;
  en_expl: string;
  conf: number;
  status: MessageStatus;
}

export interface ActivityEntry {
  who: string;
  name: string;
  act: 'approved' | 'blocked' | 'escalated';
  cat: string;
  msg: string;
  t: string;
}

export interface VolumePoint {
  label: string;
  safe: number;
  flagged: number;
}

export interface FeedMessage {
  id: string;
  status: FeedStatus;
  text: string;
  cat: string | null;
  catKey: string | null;
  conf: number | null;
  lat: number;
  ts: Date;
}

export interface ToastItem {
  id: string;
  kind: ToastKind;
  title: string;
  msg: string;
}

export interface HoverPoint {
  idx: number;
  x: number;
  y: number;
}
