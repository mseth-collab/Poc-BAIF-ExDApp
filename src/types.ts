/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Department = 'HR' | 'Finance' | 'IT' | 'Legal' | 'General';

export interface FeedItem {
  id: string;
  type: 'news' | 'event' | 'job';
  title: string;
  description: string;
  date: string;
  category: Department;
  link?: string;
  region?: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: Department;
  tags: string[];
  regions?: Record<string, string>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: string[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: Department;
}

export interface SupportTicket {
  id: string;
  title: string;
  status: 'open' | 'in-progress' | 'resolved';
  assignee: string;
  date: string;
}

export interface AIInitiative {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'upcoming' | 'volunteer' | 'event';
  type: 'initiative' | 'news' | 'event';
  region?: string;
  date?: string;
  location?: string;
}
