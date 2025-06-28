# Project Structure

This document outlines the complete structure of the Slack Spark Insights platform.

## 📁 Directory Structure

```
slack-spark-insights/
├── README.md                 # Main project documentation
├── package.json             # Node.js dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── components.json          # shadcn/ui configuration
├── env.template             # Environment variables template
├── .env.local              # Local environment variables (gitignored)
├── .gitignore              # Git ignore rules
│
├── src/                    # Main application source code
│   ├── app/               # Next.js App Router
│   │   ├── page.tsx       # Main dashboard page
│   │   ├── layout.tsx     # Root layout
│   │   ├── globals.css    # Global styles
│   │   └── api/           # API routes
│   │       └── insights/  # AI insights API endpoint
│   │           └── route.ts
│   │
│   ├── components/        # React components
│   │   └── ui/           # shadcn/ui components
│   │       ├── card.tsx
│   │       ├── button.tsx
│   │       ├── badge.tsx
│   │       ├── tabs.tsx
│   │       ├── alert.tsx
│   │       └── textarea.tsx
│   │
│   └── lib/              # Utility libraries
│       ├── utils.ts      # General utilities
│       ├── supabase.ts   # Supabase client configuration
│       └── ai-insights.ts # AI insights TypeScript interfaces
│
├── lib/                   # Additional libraries (Python compatibility)
│   ├── supabase.ts       # Supabase configuration
│   └── ai-insights.py    # Original Python AI service
│
├── docs/                 # Project documentation
│   ├── PROJECT_STRUCTURE.md  # This file
│   ├── PRD_PROMPT.md         # Product Requirements Document
│   └── TECHNICAL_SPEC.md     # Technical specifications
│
├── data-processing/      # Data processing and AI scripts
│   ├── ai_insights_api.py    # Original Python AI service
│   └── tests/               # Test data and utilities
│       ├── dummy_slack_data.json
│       ├── import_slack_data.py
│       ├── setup_supabase.py
│       ├── slack_export_data.json
│       └── test_apis.py
│
├── utils/                # Utility scripts and configurations
│   ├── test_oauth.py     # OAuth testing utilities
│   ├── test_apis.py      # API testing utilities
│   ├── linked-accounts.yaml  # Account configurations
│   └── agents/           # Agent configurations
│       ├── dashboard-data-agent.yaml
│       ├── low-performer-alert-agent.yaml
│       ├── onboarding-form-agent.yaml
│       ├── productivity-analytics-agent.yaml
│       └── slack-indexer-agent.yaml
│
└── public/               # Static assets
    ├── next.svg
    ├── vercel.svg
    └── file.svg
```

## 🏗️ Architecture Overview

### Frontend (`src/app/`)
- **Next.js 15** with App Router for modern React development
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for consistent UI components

### Backend (`src/app/api/`)
- **API Routes** for serverless functions
- **OpenAI Integration** for AI-powered insights
- **Supabase** for database operations

### Data Processing (`data-processing/`)
- **Python Scripts** for Slack data processing
- **Test Data** for development and testing
- **Database Setup** utilities

### Documentation (`docs/`)
- **Technical Specifications** for development reference
- **Product Requirements** for feature understanding
- **Project Structure** for navigation

### Utilities (`utils/`)
- **Testing Scripts** for OAuth and API validation
- **Configuration Files** for various integrations
- **Agent Definitions** for automated workflows

## 🔧 Key Files

### Configuration
- `package.json` - Node.js dependencies and scripts
- `tsconfig.json` - TypeScript compiler options
- `next.config.ts` - Next.js framework configuration
- `components.json` - shadcn/ui component configuration
- `env.template` - Environment variables template

### Core Application
- `src/app/page.tsx` - Main dashboard interface
- `src/app/api/insights/route.ts` - AI insights API endpoint
- `src/lib/supabase.ts` - Database client configuration

### Data & Testing
- `data-processing/ai_insights_api.py` - Original Python AI service
- `data-processing/tests/dummy_slack_data.json` - Sample Slack data
- `utils/test_oauth.py` - OAuth flow testing
- `utils/test_apis.py` - API endpoint testing

## 🚀 Development Workflow

1. **Local Development**: Use `npm run dev` to start the development server
2. **Testing**: Run API tests with `python utils/test_apis.py`
3. **Building**: Use `npm run build` for production builds
4. **Deployment**: Automatic deployment via GitLab CI/CD to Vercel

## 📦 Dependencies

### Frontend Dependencies
- `next` - React framework
- `react` & `react-dom` - React library
- `typescript` - Type safety
- `tailwindcss` - CSS framework
- `@supabase/supabase-js` - Database client
- `openai` - AI integration
- `lucide-react` - Icons

### Development Dependencies
- `eslint` - Code linting
- `@types/*` - TypeScript definitions
- `postcss` - CSS processing

## 🔐 Environment Variables

Required environment variables (see `env.template`):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=your_app_url
```

## 📊 Data Flow

1. **User Interaction** → Frontend dashboard (`src/app/page.tsx`)
2. **API Request** → Backend API routes (`src/app/api/insights/route.ts`)
3. **AI Processing** → OpenAI GPT-3.5-turbo integration
4. **Data Storage** → Supabase PostgreSQL database
5. **Real-time Updates** → Supabase real-time subscriptions

This structure provides a clean separation of concerns, making the project maintainable and scalable. 