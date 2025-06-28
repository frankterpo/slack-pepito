import { OpenAI } from 'openai'
import { supabaseAdmin } from './supabase'

export interface UserMetrics {
  user_id: string
  messages_sent: number
  participation_rate: number
  avg_response_time: number
  collaboration_score: number
  engagement_trend: 'increasing' | 'decreasing' | 'stable'
  days_since_active?: number
}

export interface AIInsight {
  assessment: string
  strengths: string[]
  concerns: string[]
  factors: string[]
  recommendations: string[]
  risk_level: 'low' | 'medium' | 'high'
  confidence_score: number
}

export interface AIQuestion {
  question: string
  context: string
  priority: number
}

export class SlackAnalyticsAI {
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    })
  }

  async generateQuestionsForUnderperforming(
    userId: string,
    userMetrics: UserMetrics
  ): Promise<string[]> {
    const prompt = `
    You are an HR expert helping managers have constructive conversations with underperforming team members.
    
    Based on these Slack engagement metrics:
    - Messages sent last 30 days: ${userMetrics.messages_sent}
    - Participation rate: ${(userMetrics.participation_rate * 100).toFixed(1)}%
    - Response time: ${userMetrics.avg_response_time.toFixed(1)} hours
    - Engagement trend: ${userMetrics.engagement_trend}
    
    Generate 5 thoughtful, non-confrontational questions that a manager could ask to:
    1. Understand potential barriers or challenges
    2. Identify support needed
    3. Explore workload and priorities
    4. Assess job satisfaction and motivation
    5. Collaboratively find solutions
    
    Make questions open-ended, empathetic, and solution-focused.
    Return as a JSON array of strings.
    `

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
      })

      const questions = JSON.parse(response.choices[0].message.content || '[]')

      // Store in database
      for (const question of questions) {
        await supabaseAdmin.from('ai_questions').insert({
          user_id: userId,
          question_type: 'underperforming',
          question,
          context: `Low engagement: ${(userMetrics.participation_rate * 100).toFixed(1)}% participation`,
          priority: 4,
          metadata: userMetrics,
        })
      }

      return questions
    } catch (error) {
      console.error('Error generating underperforming questions:', error)
      return this.fallbackUnderperformingQuestions()
    }
  }

  async generateQuestionsForOverperforming(
    userId: string,
    userMetrics: UserMetrics
  ): Promise<string[]> {
    const prompt = `
    You are an HR expert helping managers engage with high-performing team members.
    
    Based on these excellent Slack engagement metrics:
    - Messages sent last 30 days: ${userMetrics.messages_sent}
    - Participation rate: ${(userMetrics.participation_rate * 100).toFixed(1)}%
    - Response time: ${userMetrics.avg_response_time.toFixed(1)} hours
    - Collaboration score: ${userMetrics.collaboration_score.toFixed(1)}
    
    Generate 5 engaging questions that a manager could ask to:
    1. Recognize and appreciate their contributions
    2. Understand what drives their success
    3. Explore career growth opportunities
    4. Identify ways to leverage their strengths
    5. Discuss potential leadership or mentoring roles
    
    Make questions appreciative, growth-focused, and opportunity-oriented.
    Return as a JSON array of strings.
    `

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
      })

      const questions = JSON.parse(response.choices[0].message.content || '[]')

      // Store in database
      for (const question of questions) {
        await supabaseAdmin.from('ai_questions').insert({
          user_id: userId,
          question_type: 'overperforming',
          question,
          context: `High performance: ${(userMetrics.participation_rate * 100).toFixed(1)}% participation`,
          priority: 2,
          metadata: userMetrics,
        })
      }

      return questions
    } catch (error) {
      console.error('Error generating overperforming questions:', error)
      return this.fallbackOverperformingQuestions()
    }
  }

  async generateQuestionsForSilentQuitting(
    userId: string,
    userMetrics: UserMetrics
  ): Promise<string[]> {
    const prompt = `
    You are an HR expert helping managers address potential disengagement.
    
    Based on these concerning Slack patterns:
    - Messages sent last 30 days: ${userMetrics.messages_sent}
    - Days since last activity: ${userMetrics.days_since_active || 0}
    - Participation rate: ${(userMetrics.participation_rate * 100).toFixed(1)}%
    - Engagement trend: ${userMetrics.engagement_trend}
    
    Generate 5 sensitive, empathetic questions that a manager could ask to:
    1. Check on their wellbeing and job satisfaction
    2. Understand any challenges or frustrations
    3. Explore workload and work-life balance
    4. Identify what support or changes might help
    5. Rebuild engagement and connection
    
    Make questions caring, non-judgmental, and focused on understanding their experience.
    Return as a JSON array of strings.
    `

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
      })

      const questions = JSON.parse(response.choices[0].message.content || '[]')

      // Store in database
      for (const question of questions) {
        await supabaseAdmin.from('ai_questions').insert({
          user_id: userId,
          question_type: 'silent_quitting',
          question,
          context: 'Potential disengagement detected',
          priority: 5,
          metadata: userMetrics,
        })
      }

      return questions
    } catch (error) {
      console.error('Error generating silent quitting questions:', error)
      return this.fallbackSilentQuittingQuestions()
    }
  }

  async generateCustomQuestions(
    userId: string,
    customRequest: string,
    userMetrics: UserMetrics
  ): Promise<string[]> {
    const prompt = `
    You are an HR expert helping a manager with a specific situation.
    
    Team member's Slack metrics:
    - Messages sent last 30 days: ${userMetrics.messages_sent}
    - Participation rate: ${(userMetrics.participation_rate * 100).toFixed(1)}%
    - Response time: ${userMetrics.avg_response_time.toFixed(1)} hours
    - Collaboration score: ${userMetrics.collaboration_score.toFixed(1)}
    
    Manager's specific request: "${customRequest}"
    
    Generate 5 thoughtful questions that address the manager's request while considering the team member's performance data.
    Make questions professional, constructive, and actionable.
    Return as a JSON array of strings.
    `

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
      })

      const questions = JSON.parse(response.choices[0].message.content || '[]')

      // Store in database
      for (const question of questions) {
        await supabaseAdmin.from('ai_questions').insert({
          user_id: userId,
          question_type: 'custom',
          question,
          context: customRequest,
          priority: 3,
          metadata: { ...userMetrics, custom_request: customRequest },
        })
      }

      return questions
    } catch (error) {
      console.error('Error generating custom questions:', error)
      return [`Based on your request about '${customRequest}', what specific support or changes would be most helpful for this team member?`]
    }
  }

  async generateInsights(userId: string, userMetrics: UserMetrics): Promise<AIInsight> {
    const prompt = `
    You are an HR analytics expert providing insights about team member performance.
    
    Slack engagement data:
    - Messages sent last 30 days: ${userMetrics.messages_sent}
    - Participation rate: ${(userMetrics.participation_rate * 100).toFixed(1)}%
    - Response time: ${userMetrics.avg_response_time.toFixed(1)} hours
    - Collaboration score: ${userMetrics.collaboration_score.toFixed(1)}
    - Engagement trend: ${userMetrics.engagement_trend}
    
    Provide a comprehensive analysis including:
    1. Overall performance assessment
    2. Key strengths and areas of concern
    3. Potential underlying factors
    4. Recommended actions for the manager
    5. Risk level (low/medium/high) for retention
    
    Return as JSON with keys: assessment, strengths, concerns, factors, recommendations, risk_level, confidence_score
    `

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      })

      const insights = JSON.parse(response.choices[0].message.content || '{}')

      // Store in database
      await supabaseAdmin.from('ai_insights').insert({
        user_id: userId,
        insight_type: this.determineInsightType(userMetrics),
        title: insights.assessment || 'Performance Analysis',
        description: JSON.stringify(insights),
        confidence_score: insights.confidence_score || 0.8,
        suggested_actions: insights.recommendations || [],
        metadata: userMetrics,
      })

      return insights
    } catch (error) {
      console.error('Error generating insights:', error)
      return this.fallbackInsights(userMetrics)
    }
  }

  private determineInsightType(metrics: UserMetrics): string {
    if (metrics.participation_rate < 0.3 || metrics.messages_sent < 10) {
      return 'underperforming'
    } else if (metrics.participation_rate > 0.8 && metrics.messages_sent > 50) {
      return 'overperforming'
    } else if ((metrics.days_since_active || 0) > 7) {
      return 'silent_quitting'
    } else {
      return 'normal'
    }
  }

  private fallbackUnderperformingQuestions(): string[] {
    return [
      "How are you feeling about your current workload and priorities?",
      "What challenges or obstacles are you facing that I might not be aware of?",
      "Is there any additional support or resources you need to be more effective?",
      "How do you prefer to receive feedback and stay connected with the team?",
      "What would make your work experience more engaging and fulfilling?"
    ]
  }

  private fallbackOverperformingQuestions(): string[] {
    return [
      "What aspects of your work do you find most energizing and rewarding?",
      "Are there any new challenges or projects you'd be interested in taking on?",
      "How can we better leverage your strengths to benefit the team?",
      "What are your career goals and how can I support your growth?",
      "Would you be interested in mentoring or leading initiatives for other team members?"
    ]
  }

  private fallbackSilentQuittingQuestions(): string[] {
    return [
      "How are you doing overall, both professionally and personally?",
      "What aspects of your work do you find most and least satisfying?",
      "Is there anything about your role or our team that's causing frustration?",
      "What changes could we make to improve your work experience?",
      "How can I better support you and help you feel more connected to the team?"
    ]
  }

  private fallbackInsights(metrics: UserMetrics): AIInsight {
    if (metrics.participation_rate < 0.3) {
      return {
        assessment: "Low engagement detected",
        strengths: ["Potential for improvement"],
        concerns: ["Low participation in team communications"],
        factors: ["Workload", "Communication preferences", "Role clarity"],
        recommendations: ["Schedule 1:1 meeting", "Assess workload", "Clarify expectations"],
        risk_level: "medium",
        confidence_score: 0.7
      }
    } else if (metrics.participation_rate > 0.8) {
      return {
        assessment: "High performer with strong engagement",
        strengths: ["Active communicator", "Team collaborator"],
        concerns: ["Potential burnout risk"],
        factors: ["High motivation", "Strong team connection"],
        recommendations: ["Recognize contributions", "Explore growth opportunities"],
        risk_level: "low",
        confidence_score: 0.8
      }
    } else {
      return {
        assessment: "Stable performance with room for growth",
        strengths: ["Consistent engagement"],
        concerns: ["Could increase participation"],
        factors: ["Role satisfaction", "Team dynamics"],
        recommendations: ["Regular check-ins", "Encourage more participation"],
        risk_level: "low",
        confidence_score: 0.6
      }
    }
  }
} 