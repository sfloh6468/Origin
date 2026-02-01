
import { Subscriber, Ticket, Engineer, AccountStatus, TicketPriority, TicketStatus } from './types';

// Extended Engineer type conceptually for this mock
export interface EngineerWithPassword extends Engineer {
  password?: string;
}

export const mockEngineers: (Engineer & { password?: string })[] = [
  { id: 'eng-1', name: 'Zack Wilson', role: 'Engineer', isOnShift: false, password: 'password123' },
  { id: 'eng-2', name: 'Sarah Chen', role: 'Engineer', isOnShift: false, password: 'password123' },
  { id: 'mgr-1', name: 'Admin Manager', role: 'Manager', isOnShift: false, password: 'password123' },
];

export const mockSubscribers: Subscriber[] = [
  {
    id: 'sub-1',
    name: 'Alice Johnson',
    phone: '+60123456789',
    email: 'alice@example.com',
    condoName: 'Horizon Residences',
    unitNumber: 'A-12-05',
    status: AccountStatus.ACTIVE,
    routerSerialNumber: 'SN-HOR-001293'
  },
  {
    id: 'sub-2',
    name: 'Bob Smith',
    phone: '+60119876543',
    email: 'bob@smith.me',
    condoName: 'Skyline Towers',
    unitNumber: 'B-05-11',
    status: AccountStatus.SUSPENDED,
    routerSerialNumber: 'SN-SKY-992211'
  },
  {
    id: 'sub-3',
    name: 'Charlie Davis',
    phone: '+60172233445',
    email: 'charlie.d@gmail.com',
    condoName: 'Horizon Residences',
    unitNumber: 'C-22-01',
    status: AccountStatus.ACTIVE,
    routerSerialNumber: 'SN-HOR-887766'
  }
];

export const mockTickets: Ticket[] = [
  {
    id: 'TKT-1001',
    subscriberId: 'sub-1',
    subject: 'Slow internet connection',
    description: 'Speeds dropped from 500Mbps to 10Mbps today.',
    priority: TicketPriority.HIGH,
    status: TicketStatus.IN_PROGRESS,
    assignedEngineerId: 'eng-1',
    channel: 'WhatsApp',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'TKT-1002',
    subscriberId: 'sub-2',
    subject: 'Complete loss of service',
    description: 'Red light flashing on router since morning.',
    priority: TicketPriority.EMERGENCY,
    status: TicketStatus.OPEN,
    channel: 'Manual',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  }
];
