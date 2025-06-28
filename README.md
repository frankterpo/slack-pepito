# Slack Spark Insights 🚀

An AI-powered team engagement analytics platform that helps managers identify performance patterns and generate personalized coaching questions based on Slack communication data.

## 🌟 Features

- **Real-time Team Analytics**: Monitor engagement metrics, participation rates, and communication patterns
- **AI-Powered Insights**: Generate comprehensive performance assessments using OpenAI GPT-3.5-turbo
- **Smart Coaching Questions**: Get tailored 1:1 questions for different scenarios:
  - Underperforming team members
  - Overperforming employees
  - Silent quitting detection
  - Custom situations
- **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS
- **Secure Database**: Supabase integration for data storage and real-time updates

## 🏗️ Architecture

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, and shadcn/ui components
- **Backend**: Next.js API routes with OpenAI integration
- **Database**: Supabase PostgreSQL with real-time subscriptions
- **Deployment**: Vercel with automatic GitLab CI/CD
- **AI**: OpenAI GPT-3.5-turbo for generating insights and questions

## 🚀 Live Demo

**Production URL**: [https://feae288e-7666-46d1-9aae-69ba42eda87d02828109-5411-aci-vibe-ops.vercel.app](https://feae288e-7666-46d1-9aae-69ba42eda87d02828109-5411-aci-vibe-ops.vercel.app)

## 📊 Sample Data

The application includes sample team members with different performance profiles:

- **Alice Johnson** (Overperforming): 85% participation, 45 messages, 2.3h response time
- **Bob Smith** (Underperforming): 15% participation, 8 messages, 12.5h response time  
- **Carol Davis** (Silent Quitting): 5% participation, 2 messages, 14 days inactive

## 🛠️ Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern component library
- **Lucide React**: Beautiful icons

### Backend & AI
- **OpenAI API**: GPT-3.5-turbo for AI insights
- **Supabase**: PostgreSQL database and auth
- **Next.js API Routes**: Serverless functions

### Deployment
- **Vercel**: Hosting and deployment
- **GitLab**: Source control and CI/CD
- **ACI.dev**: Infrastructure management

## 🔧 Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://hnymxzaugffegrpqsppu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📋 Database Schema

The application uses the following main tables:

- **users**: Team member profiles and metadata
- **messages**: Slack message data and analytics
- **channels**: Slack channel information
- **analytics**: Processed engagement metrics
- **ai_insights**: Generated AI assessments and recommendations
- **ai_questions**: Coaching questions for managers
- **performance_alerts**: Automated alerts for performance changes

## 🎯 Use Cases

### For Managers
- **Performance Reviews**: Get data-driven insights for 1:1 meetings
- **Early Intervention**: Identify disengagement before it becomes a problem
- **Growth Opportunities**: Recognize high performers and provide development paths
- **Team Health**: Monitor overall team engagement and communication patterns

### For HR Teams
- **Retention Analytics**: Predict and prevent employee turnover
- **Performance Coaching**: Provide managers with effective conversation starters
- **Data-Driven Decisions**: Use communication patterns to inform HR strategies
- **Scalable Insights**: Analyze large teams efficiently

## 🔮 AI-Generated Question Examples

### Underperforming Employee
- "How are you feeling about your current workload and priorities?"
- "What challenges or obstacles are you facing that I might not be aware of?"
- "Is there any additional support or resources you need to be more effective?"

### Overperforming Employee
- "What aspects of your work do you find most energizing and rewarding?"
- "Are there any new challenges or projects you'd be interested in taking on?"
- "How can we better leverage your strengths to benefit the team?"

### Silent Quitting Detection
- "How are you doing overall, both professionally and personally?"
- "What aspects of your work do you find most and least satisfying?"
- "What changes could we make to improve your work experience?"

## 📁 Project Structure

This project is now fully consolidated with all components organized in a clean structure:

```
slack-spark-insights/
├── src/                    # Main Next.js application
├── docs/                   # Project documentation
├── data-processing/        # AI scripts and test data
├── utils/                  # Testing utilities and configs
└── README.md              # This file
```

For detailed structure information, see [`docs/PROJECT_STRUCTURE.md`](docs/PROJECT_STRUCTURE.md).

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://gitlab.com/vibeops.infra-group/feae288e-7666-46d1-9aae-69ba42eda87d.02828109-5411-4d01-bd08-0d6edad8524f.git
   cd slack-spark-insights
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.template .env.local
   # Edit .env.local with your API keys
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Testing the Integration

You can test various components using the utilities:

```bash
# Test API endpoints
python utils/test_apis.py

# Test OAuth flows
python utils/test_oauth.py

# Process Slack data
python data-processing/ai_insights_api.py
```

### Building for Production

```bash
npm run build
npm start
```

## 📈 Metrics Tracked

- **Messages Sent**: Total messages in last 30 days
- **Participation Rate**: Percentage of active communication
- **Response Time**: Average time to respond to messages
- **Collaboration Score**: Quality of team interactions
- **Engagement Trend**: Increasing, decreasing, or stable patterns
- **Days Since Active**: Time since last meaningful contribution

## 🔒 Security & Privacy

- All API keys are stored securely in environment variables
- Supabase Row Level Security (RLS) protects user data
- No sensitive Slack data is stored in logs
- AI processing uses anonymized metrics only
- GDPR-compliant data handling practices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing the GPT-3.5-turbo API
- **Supabase** for the database and real-time features
- **Vercel** for seamless deployment
- **shadcn/ui** for the beautiful component library
- **ACI.dev** for infrastructure management

## 📞 Support

For support, email frankpablote@mac.com or create an issue in the repository.

---

Built with ❤️ by Francisco Terpolilli using ACI.dev and Lovable
