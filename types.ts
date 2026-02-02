
export enum AccountStatus {
  ACTIVE = 'Active',
  SUSPENDED = 'Suspended',
  UNSUBSCRIBED = 'Unsubscribed'
}

export enum TicketPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  EMERGENCY = 'Emergency'
}

export enum TicketStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In-Progress',
  PENDING_SITE_VISIT = 'Pending Site Visit',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed'
}

export enum AuthorType {
  ENGINEER = 'Engineer',
  SYSTEM = 'System',
  CUSTOMER = 'Customer'
}

export interface Building {
  id: string;
  name: string;
  address: string;
}

export interface InternetPackage {
  id: string;
  name: string;
  speed: string;
}

export interface Subscriber {
  id: string;
  name: string;
  phone: string;
  email: string;
  condoName: string; // References Building name
  unitNumber: string;
  status: AccountStatus;
  routerSerialNumber: string;
  plan: string; // References InternetPackage name
}

export interface Ticket {
  id: string;
  subscriberId: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedEngineerId?: string;
  channel: 'WhatsApp' | 'Manual';
  createdAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  hardwareReplacement?: string;
}

export interface Comment {
  id: string;
  ticketId: string;
  authorType: AuthorType;
  authorName: string;
  message: string;
  timestamp: string;
}

export interface Engineer {
  id: string;
  name: string;
  role: 'Engineer' | 'Manager';
  password: string;
  isOnShift: boolean;
  lastLogin?: string;
  lastLogout?: string;
}

export interface CollisionState {
  ticketId: string;
  engineerName: string;
}
