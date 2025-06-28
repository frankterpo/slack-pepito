import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { supabaseAdmin } from '../../../../lib/supabase'

interface UserMetrics {
  user_id: string
  messages_sent: number
  participation_rate: number
  avg_response_time: number
  collaboration_score: number
  engagement_trend: 'increasing' | 'decreasing' | 'stable'
  days_since_active?: number
}

interface AIInsight {
  assessment: string
  strengths: string[]
  concerns: string[]
  factors: string[]
  recommendations: string[]
  risk_level: 'low' | 'medium' | 'high'
  confidence_score: number
  ai_provider: string
  generated_at: string
}

interface EnhancedAnalytics {
  sentiment_score: number
  communication_patterns: string[]
  collaboration_network: {
    connections: number
    influence_score: number
  }
  productivity_indicators: {
    peak_hours: string[]
    response_consistency: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, userMetrics, type, customRequest } = await request.json()
    
    if (!userId || !userMetrics) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Initialize AI providers
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    })

    let result

    switch (type) {
      case 'underperforming':
        result = await generateUnderperformingQuestions(openai, userMetrics)
        break
      case 'overperforming':
        result = await generateOverperformingQuestions(openai, userMetrics)
        break
      case 'silent_quitting':
        result = await generateSilentQuittingQuestions(openai, userMetrics)
        break
      case 'custom':
        if (!customRequest) {
          return NextResponse.json(
            { error: 'Custom request is required for custom type' },
            { status: 400 }
          )
        }
        result = await generateCustomQuestions(openai, userMetrics, customRequest)
        break
      case 'insights':
        result = await generateComprehensiveInsights(openai, userMetrics, userId)
        break
      case 'advanced_analytics':
        result = await generateAdvancedAnalytics(userMetrics, userId)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid type' },
          { status: 400 }
        )
    }

    // Store the result in Supabase for future reference
    if (type === 'insights') {
      await storeInsights(userId, result as AIInsight)
    } else if (Array.isArray(result)) {
      await storeQuestions(userId, type, result)
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateComprehensiveInsights(openai: OpenAI, userMetrics: UserMetrics, userId: string): Promise<AIInsight> {
  // First, get enhanced analytics
  const enhancedData = await generateAdvancedAnalytics(userMetrics, userId)
  
  const prompt = `
  You are an expert workplace psychologist and data analyst. Analyze this team member's comprehensive performance data:

  SLACK ENGAGEMENT METRICS:
  - Messages sent (30 days): ${userMetrics.messages_sent}
  - Participation rate: ${(userMetrics.participation_rate * 100).toFixed(1)}%
  - Average response time: ${userMetrics.avg_response_time.toFixed(1)} hours
  - Collaboration score: ${userMetrics.collaboration_score.toFixed(1)}/5
  - Engagement trend: ${userMetrics.engagement_trend}
  - Days since last activity: ${userMetrics.days_since_active || 0}

  ADVANCED ANALYTICS:
  - Sentiment score: ${enhancedData.sentiment_score}/100
  - Communication patterns: ${enhancedData.communication_patterns.join(', ')}
  - Network connections: ${enhancedData.collaboration_network.connections}
  - Influence score: ${enhancedData.collaboration_network.influence_score}/100
  - Peak activity hours: ${enhancedData.productivity_indicators.peak_hours.join(', ')}
  - Response consistency: ${enhancedData.productivity_indicators.response_consistency}/100

  Provide a comprehensive analysis including:
  1. Overall assessment (2-3 sentences)
  2. Key strengths (3-5 specific points)
  3. Areas of concern (2-4 specific points)
  4. Contributing factors (3-5 insights)
  5. Actionable recommendations (4-6 specific suggestions)
  6. Risk level (low/medium/high)
  7. Confidence score (0-1)

  Return as JSON with this structure:
  {
    "assessment": "string",
    "strengths": ["string"],
    "concerns": ["string"], 
    "factors": ["string"],
    "recommendations": ["string"],
    "risk_level": "low|medium|high",
    "confidence_score": 0.95
  }
  `

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1500,
    })

    const insights = JSON.parse(response.choices[0].message.content || '{}')
    
    return {
      ...insights,
      ai_provider: 'OpenAI GPT-4',
      generated_at: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error generating comprehensive insights:', error)
    
    // Fallback to GPT-3.5-turbo
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1200,
      })

      const insights = JSON.parse(response.choices[0].message.content || '{}')
      
      return {
        ...insights,
        ai_provider: 'OpenAI GPT-3.5-turbo',
        generated_at: new Date().toISOString()
      }
    } catch (fallbackError) {
      console.error('Fallback AI also failed:', fallbackError)
      return getFallbackInsights(userMetrics)
    }
  }
}

async function generateAdvancedAnalytics(userMetrics: UserMetrics, userId: string): Promise<EnhancedAnalytics> {
  try {
    // Get historical data from Supabase
    const { data: messages } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(500)

    const { data: userConnections } = await supabaseAdmin
      .from('messages')
      .select('user_id, channel_id')
      .neq('user_id', userId)
      .limit(1000)

    // Analyze sentiment (simplified)
    const sentimentScore = calculateSentimentScore(userMetrics)
    
    // Analyze communication patterns
    const communicationPatterns = analyzeCommunicationPatterns(userMetrics, messages || [])
    
    // Calculate collaboration network
    const collaborationNetwork = calculateCollaborationNetwork(userMetrics, userConnections || [])
    
    // Analyze productivity indicators
    const productivityIndicators = analyzeProductivityIndicators(userMetrics, messages || [])

    return {
      sentiment_score: sentimentScore,
      communication_patterns: communicationPatterns,
      collaboration_network: collaborationNetwork,
      productivity_indicators: productivityIndicators
    }
  } catch (error) {
    console.error('Error generating advanced analytics:', error)
    
    // Return basic analytics based on available metrics
    return {
      sentiment_score: userMetrics.collaboration_score * 20,
      communication_patterns: ['Standard communication patterns'],
      collaboration_network: {
        connections: Math.floor(userMetrics.collaboration_score * 10),
        influence_score: userMetrics.participation_rate * 100
      },
      productivity_indicators: {
        peak_hours: ['9:00-11:00', '14:00-16:00'],
        response_consistency: Math.max(0, 100 - (userMetrics.avg_response_time * 5))
      }
    }
  }
}

function calculateSentimentScore(userMetrics: UserMetrics): number {
  // Simplified sentiment calculation based on engagement metrics
  let score = 50 // neutral baseline
  
  // Positive indicators
  if (userMetrics.engagement_trend === 'increasing') score += 20
  if (userMetrics.participation_rate > 0.3) score += 15
  if (userMetrics.collaboration_score > 3) score += 10
  if (userMetrics.avg_response_time < 4) score += 10
  
  // Negative indicators
  if (userMetrics.engagement_trend === 'decreasing') score -= 25
  if (userMetrics.participation_rate < 0.1) score -= 20
  if (userMetrics.days_since_active && userMetrics.days_since_active > 7) score -= 15
  if (userMetrics.avg_response_time > 12) score -= 10
  
  return Math.max(0, Math.min(100, score))
}

function analyzeCommunicationPatterns(userMetrics: UserMetrics, messages: any[]): string[] {
  const patterns = []
  
  if (userMetrics.avg_response_time < 2) {
    patterns.push('Highly responsive communicator')
  } else if (userMetrics.avg_response_time > 8) {
    patterns.push('Delayed response pattern')
  }
  
  if (userMetrics.collaboration_score > 3.5) {
    patterns.push('Strong cross-team collaboration')
  } else if (userMetrics.collaboration_score < 2) {
    patterns.push('Limited collaborative engagement')
  }
  
  if (userMetrics.participation_rate > 0.4) {
    patterns.push('High message volume contributor')
  } else if (userMetrics.participation_rate < 0.05) {
    patterns.push('Minimal communication activity')
  }
  
  if (userMetrics.engagement_trend === 'increasing') {
    patterns.push('Growing engagement over time')
  } else if (userMetrics.engagement_trend === 'decreasing') {
    patterns.push('Declining participation trend')
  }
  
  return patterns.length > 0 ? patterns : ['Standard communication patterns']
}

function calculateCollaborationNetwork(userMetrics: UserMetrics, connections: any[]): { connections: number, influence_score: number } {
  const baseConnections = Math.floor(userMetrics.collaboration_score * 8)
  const influenceScore = Math.min(100, userMetrics.participation_rate * 200 + userMetrics.collaboration_score * 15)
  
  return {
    connections: Math.max(1, baseConnections),
    influence_score: Math.round(influenceScore)
  }
}

function analyzeProductivityIndicators(userMetrics: UserMetrics, messages: any[]): { peak_hours: string[], response_consistency: number } {
  // Simplified analysis - in real implementation, would analyze message timestamps
  const peakHours = userMetrics.avg_response_time < 4 
    ? ['9:00-11:00', '14:00-16:00', '16:00-18:00']
    : ['10:00-12:00', '15:00-17:00']
  
  const consistency = Math.max(0, Math.min(100, 
    100 - (userMetrics.avg_response_time * 3) + (userMetrics.collaboration_score * 10)
  ))
  
  return {
    peak_hours: peakHours,
    response_consistency: Math.round(consistency)
  }
}

async function generateUnderperformingQuestions(openai: OpenAI, userMetrics: UserMetrics): Promise<string[]> {
  const prompt = `
  You are an expert HR consultant specializing in performance improvement conversations.
  
  Based on these concerning Slack engagement metrics:
  - Messages sent last 30 days: ${userMetrics.messages_sent}
  - Participation rate: ${(userMetrics.participation_rate * 100).toFixed(1)}%
  - Response time: ${userMetrics.avg_response_time.toFixed(1)} hours
  - Engagement trend: ${userMetrics.engagement_trend}
  
  Generate 5 thoughtful, empathetic questions that help:
  1. Understand root causes without blame
  2. Identify barriers and challenges
  3. Explore support needs and resources
  4. Assess workload and priorities
  5. Collaboratively develop improvement plans
  
  Questions should be open-ended, non-confrontational, and solution-focused.
  Return as a JSON array of exactly 5 strings.
  `

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    })

    return JSON.parse(response.choices[0].message.content || '[]')
  } catch (error) {
    console.error('Error generating underperforming questions:', error)
    return [
      "How are you feeling about your current workload and the support you're receiving?",
      "What challenges or obstacles are you facing that might be affecting your participation?",
      "Are there any tools, resources, or training that would help you be more effective?",
      "How do you prefer to receive feedback and stay connected with the team?",
      "What changes could we make together to improve your work experience and engagement?"
    ]
  }
}

async function generateOverperformingQuestions(openai: OpenAI, userMetrics: UserMetrics): Promise<string[]> {
  const prompt = `
  You are an expert HR consultant specializing in talent development and retention.
  
  Based on these excellent Slack engagement metrics:
  - Messages sent last 30 days: ${userMetrics.messages_sent}
  - Participation rate: ${(userMetrics.participation_rate * 100).toFixed(1)}%
  - Response time: ${userMetrics.avg_response_time.toFixed(1)} hours
  - Collaboration score: ${userMetrics.collaboration_score.toFixed(1)}
  
  Generate 5 engaging questions that help:
  1. Recognize and appreciate exceptional contributions
  2. Understand success drivers and motivations
  3. Explore career growth and development opportunities
  4. Identify ways to leverage strengths for team benefit
  5. Discuss leadership potential and mentoring roles
  
  Questions should be appreciative, growth-focused, and opportunity-oriented.
  Return as a JSON array of exactly 5 strings.
  `

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    })

    return JSON.parse(response.choices[0].message.content || '[]')
  } catch (error) {
    console.error('Error generating overperforming questions:', error)
    return [
      "What aspects of your work and collaboration do you find most energizing and rewarding?",
      "Are there any new challenges, projects, or responsibilities you'd be excited to take on?",
      "How can we better leverage your strengths and expertise to benefit the entire team?",
      "What are your career aspirations and how can I support your professional growth?",
      "Would you be interested in mentoring colleagues or leading initiatives that align with your strengths?"
    ]
  }
}

async function generateSilentQuittingQuestions(openai: OpenAI, userMetrics: UserMetrics): Promise<string[]> {
  const prompt = `
  You are an expert HR consultant specializing in employee re-engagement and retention.
  
  Based on these concerning disengagement patterns:
  - Messages sent last 30 days: ${userMetrics.messages_sent}
  - Days since last activity: ${userMetrics.days_since_active || 0}
  - Participation rate: ${(userMetrics.participation_rate * 100).toFixed(1)}%
  - Engagement trend: ${userMetrics.engagement_trend}
  
  Generate 5 sensitive, empathetic questions that help:
  1. Check on overall wellbeing and job satisfaction
  2. Understand underlying frustrations or challenges
  3. Explore work-life balance and workload concerns
  4. Identify what support or changes might help
  5. Rebuild connection and engagement with the team
  
  Questions should be caring, non-judgmental, and focused on understanding their experience.
  Return as a JSON array of exactly 5 strings.
  `

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    })

    return JSON.parse(response.choices[0].message.content || '[]')
  } catch (error) {
    console.error('Error generating silent quitting questions:', error)
    return [
      "How are you doing overall, both professionally and personally?",
      "What aspects of your work do you find most and least fulfilling right now?",
      "Are there any changes in your role or our team dynamics that have affected your experience?",
      "What support or adjustments could help improve your work experience and engagement?",
      "How can I better support you and help you feel more connected and valued on the team?"
    ]
  }
}

async function generateCustomQuestions(openai: OpenAI, userMetrics: UserMetrics, customRequest: string): Promise<string[]> {
  const prompt = `
  You are an expert HR consultant helping a manager with a specific team situation.
  
  Team member's metrics:
  - Messages: ${userMetrics.messages_sent}, Participation: ${(userMetrics.participation_rate * 100).toFixed(1)}%
  - Response time: ${userMetrics.avg_response_time.toFixed(1)}h, Collaboration: ${userMetrics.collaboration_score.toFixed(1)}
  
  Manager's specific situation: "${customRequest}"
  
  Generate 5 targeted questions that address this specific situation while being:
  - Constructive and solution-oriented
  - Empathetic and non-confrontational  
  - Focused on understanding and improvement
  - Professional and respectful
  
  Return as a JSON array of exactly 5 strings.
  `

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    })

    return JSON.parse(response.choices[0].message.content || '[]')
  } catch (error) {
    console.error('Error generating custom questions:', error)
    return [
      "Can you help me understand your perspective on this situation?",
      "What factors do you think might be contributing to this challenge?",
      "How do you think we could approach this differently moving forward?",
      "What support or resources would be most helpful to address this?",
      "What would success look like to you in resolving this situation?"
    ]
  }
}

async function storeInsights(userId: string, insights: AIInsight) {
  try {
    await supabaseAdmin
      .from('ai_insights')
      .insert({
        user_id: userId,
        assessment: insights.assessment,
        strengths: insights.strengths,
        concerns: insights.concerns,
        factors: insights.factors,
        recommendations: insights.recommendations,
        risk_level: insights.risk_level,
        confidence_score: insights.confidence_score,
        ai_provider: insights.ai_provider,
        generated_at: insights.generated_at
      })
  } catch (error) {
    console.error('Error storing insights:', error)
  }
}

async function storeQuestions(userId: string, type: string, questions: string[]) {
  try {
    await supabaseAdmin
      .from('ai_questions')
      .insert({
        user_id: userId,
        question_type: type,
        questions: questions,
        generated_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error storing questions:', error)
  }
}

function getFallbackResponse(type: string, userMetrics: UserMetrics): any {
  switch (type) {
    case 'insights':
      return getFallbackInsights(userMetrics)
    case 'underperforming':
      return [
        "How are you feeling about your current workload and priorities?",
        "What challenges are you facing that I might not be aware of?",
        "What support or resources would help you be more effective?",
        "How can we improve communication and collaboration?",
        "What changes would make your work experience more engaging?"
      ]
    case 'overperforming':
      return [
        "What aspects of your work do you find most rewarding?",
        "Are there new challenges you'd like to take on?",
        "How can we leverage your strengths for the team?",
        "What are your career goals and aspirations?",
        "Would you be interested in mentoring or leadership opportunities?"
      ]
    case 'silent_quitting':
      return [
        "How are you doing overall, both professionally and personally?",
        "What aspects of your work are most and least satisfying?",
        "Are there any frustrations or concerns I should know about?",
        "What changes could improve your work experience?",
        "How can I better support you and help you feel more connected?"
      ]
    default:
      return []
  }
}

function getFallbackInsights(userMetrics: UserMetrics): AIInsight {
  const participationLevel = userMetrics.participation_rate
  const responseTime = userMetrics.avg_response_time
  const engagement = userMetrics.engagement_trend
  
  let riskLevel: 'low' | 'medium' | 'high' = 'low'
  let assessment = ''
  let strengths: string[] = []
  let concerns: string[] = []
  
  if (participationLevel < 0.1 || responseTime > 12 || engagement === 'decreasing') {
    riskLevel = 'high'
    assessment = 'This team member shows signs of disengagement and may need immediate attention.'
    concerns = ['Low participation rate', 'Slow response times', 'Declining engagement trend']
  } else if (participationLevel < 0.2 || responseTime > 6) {
    riskLevel = 'medium'
    assessment = 'This team member has moderate engagement with some areas for improvement.'
    concerns = ['Below average participation', 'Slower response times']
  } else {
    assessment = 'This team member shows good engagement and collaboration patterns.'
    strengths = ['Good participation rate', 'Responsive communication', 'Positive engagement trend']
  }
  
  return {
    assessment,
    strengths,
    concerns,
    factors: ['Communication patterns', 'Workload balance', 'Team dynamics'],
    recommendations: ['Regular check-ins', 'Clear expectations', 'Support and resources'],
    risk_level: riskLevel,
    confidence_score: 0.75,
    ai_provider: 'Fallback System',
    generated_at: new Date().toISOString()
  }
} 