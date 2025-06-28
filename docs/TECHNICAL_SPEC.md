# Technical Specification: Lovable Frontend

## Backend Infrastructure

### Supabase Database Schema

#### Tables

1. `channels`
   ```sql
   {
     id: text (primary key),
     name: text (not null),
     is_channel: boolean,
     created_at: timestamptz
   }
   ```
   - Purpose: Stores Slack channel information
   - Current count: 736 channels
   - Use cases: Channel filtering, activity tracking

2. `users`
   ```sql
   {
     id: text (primary key),
     name: text,
     real_name: text,
     email: text,
     created_at: timestamptz
   }
   ```
   - Purpose: User profiles and authentication
   - Current count: 35 active users
   - Use cases: User activity tracking, permissions

3. `messages`
   ```sql
   {
     id: text (primary key),
     channel_id: text (foreign key),
     user_id: text (foreign key),
     text: text (not null),
     ts: text (not null),
     thread_ts: text,
     reactions: jsonb,
     created_at: timestamptz
   }
   ```
   - Purpose: Message history and analytics
   - Current count: 8,055 messages
   - Use cases: Sentiment analysis, activity patterns

4. `analytics`
   ```sql
   {
     id: uuid (primary key),
     user_id: text (foreign key),
     metric_type: text,
     metric_value: float,
     period_start: timestamptz,
     period_end: timestamptz,
     created_at: timestamptz
   }
   ```
   - Purpose: Productivity metrics storage
   - Metric types: messages_sent, response_time, sentiment_score
   - Use cases: Performance tracking, trends

### API Endpoints

#### Supabase Auto-generated REST API

1. Channels
   - GET `/rest/v1/channels`: List all channels
   - GET `/rest/v1/channels?name=eq.{channel_name}`: Get specific channel
   - GET `/rest/v1/channels?select=id,name`: Get channel names

2. Users
   - GET `/rest/v1/users`: List all users
   - GET `/rest/v1/users?id=eq.{user_id}`: Get specific user
   - GET `/rest/v1/users?select=id,name,email`: Get user profiles

3. Messages
   - GET `/rest/v1/messages`: List all messages
   - GET `/rest/v1/messages?channel_id=eq.{channel_id}`: Get channel messages
   - GET `/rest/v1/messages?user_id=eq.{user_id}`: Get user messages
   - POST `/rest/v1/messages`: Create new message

4. Analytics
   - GET `/rest/v1/analytics`: List all metrics
   - GET `/rest/v1/analytics?user_id=eq.{user_id}`: Get user metrics
   - POST `/rest/v1/analytics`: Create new metric

#### Real-time Subscriptions

Available through Supabase's real-time API:
```typescript
supabase
  .channel('schema-db-changes')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public' 
  }, payload => {
    console.log(payload)
  })
  .subscribe()
```

## Frontend Requirements

### Technology Stack

1. Framework
   - Next.js 14 (App Router)
   - React Server Components
   - TypeScript 5.x

2. UI Components
   - Shadcn/ui (Radix UI + Tailwind)
   - Custom components for data visualization
   - Responsive design (mobile-first)

3. State Management
   - React Server Components for most data
   - Zustand for complex client state
   - React Query for cache management

### Core Features

1. Dashboard
   - Real-time activity feed
   - User performance metrics
   - Channel activity heatmap
   - Response time analytics

2. User Profiles
   - Activity timeline
   - Performance metrics
   - Engagement statistics
   - Productivity trends

3. Channel Analytics
   - Message volume trends
   - User participation rates
   - Peak activity periods
   - Topic analysis

4. Performance Metrics
   - Response time tracking
   - Message quality scoring
   - Engagement measurement
   - Productivity indicators

### Data Visualization

1. Charts (using Tremor)
   - Line charts for trends
   - Bar charts for comparisons
   - Heatmaps for activity
   - Radar charts for metrics

2. Interactive Elements
   - Date range selectors
   - User/channel filters
   - Metric toggles
   - Custom views

### Authentication & Authorization

1. Supabase Auth
   - Email/password
   - OAuth (Google, GitHub)
   - Role-based access
   - Session management

2. Protected Routes
   - Admin dashboard
   - User settings
   - Analytics access

### Performance Optimization

1. Data Loading
   - Incremental Static Regeneration
   - Streaming Server Components
   - Optimistic updates
   - Edge caching

2. Resource Management
   - Image optimization
   - Code splitting
   - Bundle optimization
   - Lazy loading

### Analytics Integration

1. Real-time Processing
   - Message sentiment analysis
   - Response time calculation
   - Activity pattern detection
   - Performance scoring

2. Metric Calculation
   - User engagement score
   - Channel health index
   - Team velocity
   - Quality metrics

## Development Guidelines

### Code Organization

```typescript
src/
  app/
    (auth)/
      login/
      register/
    (dashboard)/
      page.tsx
      layout.tsx
      loading.tsx
    (analytics)/
      [...slug]/
    api/
  components/
    ui/
    charts/
    forms/
    layouts/
  lib/
    supabase/
    utils/
    hooks/
  types/
    schema.ts
    api.ts
```

### Type Definitions

```typescript
interface User {
  id: string;
  name: string;
  real_name?: string;
  email?: string;
  created_at: string;
}

interface Channel {
  id: string;
  name: string;
  is_channel: boolean;
  created_at: string;
}

interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  text: string;
  ts: string;
  thread_ts?: string;
  reactions?: Array<{
    name: string;
    count: number;
    users: string[];
  }>;
  created_at: string;
}

interface Analytics {
  id: string;
  user_id: string;
  metric_type: string;
  metric_value: number;
  period_start: string;
  period_end: string;
  created_at: string;
}
```

### API Utilities

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// lib/api/messages.ts
export async function getChannelMessages(channelId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      users (id, name),
      channels (id, name)
    `)
    .eq('channel_id', channelId)
    .order('ts', { ascending: false });

  if (error) throw error;
  return data;
}
```

### Component Examples

```typescript
// components/charts/ActivityHeatmap.tsx
'use client';

import { Card } from '@/components/ui/card';
import { Heatmap } from '@tremor/react';

interface ActivityHeatmapProps {
  data: Array<{
    date: string;
    value: number;
  }>;
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  return (
    <Card>
      <Heatmap
        data={data}
        colors={['slate.50', 'slate.100', 'slate.200']}
        valueFormatter={(value) => `${value} messages`}
      />
    </Card>
  );
}
```

## Deployment

### Vercel Configuration

```json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "outputDirectory": ".next"
}
```

### Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://wrwwxjdgrkhvahqjqfzg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_VERCEL_URL=your-vercel-url
```

This technical specification provides all the necessary details for creating a comprehensive PRD that will guide the frontend development of our Lovable application. The frontend will seamlessly integrate with our Supabase backend, providing real-time analytics and insights from our Slack data. 