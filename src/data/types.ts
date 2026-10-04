export type BillingCycle = 'weekly' | 'monthly' | 'yearly' | 'custom';

export type SubscriptionStatus = 'active' | 'trial' | 'cancelled';

export type Category =
  | 'Streaming'
  | 'Music'
  | 'Cloud'
  | 'Productivity'
  | 'Gaming'
  | 'Fitness'
  | 'News'
  | 'Other';

export type PriceChange = {
  date: string; // ISO
  price: number;
};

export type SplitMember = {
  id: string;
  name: string;
  share: number; // this member's portion of the subscription price, in the subscription's currency
  paid: boolean;
};

export type Subscription = {
  id: string;
  name: string;
  initials: string;
  color: string;
  price: number;
  currency: string;
  cycle: BillingCycle;
  category: Category;
  nextRenewal: string; // ISO date
  status: SubscriptionStatus;
  isTrial?: boolean;
  trialEndsAt?: string;
  priceAfterTrial?: number;
  notes?: string;
  reminderDays: number[]; // e.g. [1, 3]
  priceHistory: PriceChange[];
  paymentHistory: string[]; // ISO dates marked paid
  totalSpent: number;
  createdAt: string;
  isShared?: boolean;
  splitMembers?: SplitMember[];
};

export type ReminderDefaults = {
  days: number[];
  time: string; // HH:mm
};
