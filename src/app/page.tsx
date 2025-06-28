'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  AlertTriangle,
  Sparkles,
  Clock,
  Activity
} from 'lucide-react'

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
}

interface TeamMember {
  id: string
  name: string
  email: string
  metrics: UserMetrics
  insights?: AIInsight
  questions?: string[]
  category: 'underperforming' | 'overperforming' | 'silent_quitting' | 'normal'
}

export default function Dashboard() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [customRequest, setCustomRequest] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTeamData()
  }, [])

  const loadTeamData = async () => {
    try {
      // Load sample data for demonstration
      const sampleMembers: TeamMember[] = [
        {
          id: '1',
          name: 'Alice Johnson',
          email: 'alice@company.com',
          metrics: {
            user_id: '1',
            messages_sent: 45,
            participation_rate: 0.85,
            avg_response_time: 2.3,
            collaboration_score: 4.2,
            engagement_trend: 'increasing'
          },
          category: 'overperforming'
        },
        {
          id: '2',
          name: 'Bob Smith',
          email: 'bob@company.com',
          metrics: {
            user_id: '2',
            messages_sent: 8,
            participation_rate: 0.15,
            avg_response_time: 12.5,
            collaboration_score: 1.8,
            engagement_trend: 'decreasing'
          },
          category: 'underperforming'
        },
        {
          id: '3',
          name: 'Carol Davis',
          email: 'carol@company.com',
          metrics: {
            user_id: '3',
            messages_sent: 2,
            participation_rate: 0.05,
            avg_response_time: 24.0,
            collaboration_score: 0.5,
            engagement_trend: 'decreasing',
            days_since_active: 14
          },
          category: 'silent_quitting'
        }
      ]
      
      setTeamMembers(sampleMembers)
    } catch (error) {
      console.error('Error loading team data:', error)
    }
  }

  const generateQuestions = async (member: TeamMember, type: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: member.id,
          userMetrics: member.metrics,
          type,
          customRequest: type === 'custom' ? customRequest : undefined
        })
      })

      if (!response.ok) throw new Error('Failed to generate questions')
      
      const { result: questions } = await response.json()
      const updatedMember = { ...member, questions }
      setTeamMembers(prev => prev.map(m => m.id === member.id ? updatedMember : m))
      setSelectedMember(updatedMember)
    } catch (error) {
      console.error('Error generating questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateInsights = async (member: TeamMember) => {
    setLoading(true)
    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: member.id,
          userMetrics: member.metrics,
          type: 'insights'
        })
      })

      if (!response.ok) throw new Error('Failed to generate insights')
      
      const { result: insights } = await response.json()
      const updatedMember = { ...member, insights }
      setTeamMembers(prev => prev.map(m => m.id === member.id ? updatedMember : m))
      setSelectedMember(updatedMember)
    } catch (error) {
      console.error('Error generating insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'overperforming': return 'bg-green-100 text-green-800'
      case 'underperforming': return 'bg-red-100 text-red-800'
      case 'silent_quitting': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'overperforming': return <TrendingUp className="w-4 h-4" />
      case 'underperforming': return <TrendingDown className="w-4 h-4" />
      case 'silent_quitting': return <AlertTriangle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Slack Spark Insights
          </h1>
          <p className="text-gray-600">
            AI-powered team engagement analytics and coaching questions
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Members
                </CardTitle>
                <CardDescription>
                  Click on a member to view insights and generate questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedMember?.id === member.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{member.name}</h3>
                      <Badge className={getCategoryColor(member.category)}>
                        {getCategoryIcon(member.category)}
                        <span className="ml-1 capitalize">
                          {member.category.replace('_', ' ')}
                        </span>
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Messages:</span>
                        <span>{member.metrics.messages_sent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Participation:</span>
                        <span>{(member.metrics.participation_rate * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Member Details */}
          <div className="lg:col-span-2">
            {selectedMember ? (
              <Tabs defaultValue="metrics" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                  <TabsTrigger value="insights">AI Insights</TabsTrigger>
                  <TabsTrigger value="questions">Questions</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>

                <TabsContent value="metrics">
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedMember.name} - Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                          <MessageSquare className="w-8 h-8 text-blue-600" />
                          <div>
                            <p className="text-2xl font-bold">{selectedMember.metrics.messages_sent}</p>
                            <p className="text-sm text-gray-600">Messages Sent</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                          <Activity className="w-8 h-8 text-green-600" />
                          <div>
                            <p className="text-2xl font-bold">
                              {(selectedMember.metrics.participation_rate * 100).toFixed(1)}%
                            </p>
                            <p className="text-sm text-gray-600">Participation Rate</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                          <Clock className="w-8 h-8 text-orange-600" />
                          <div>
                            <p className="text-2xl font-bold">
                              {selectedMember.metrics.avg_response_time.toFixed(1)}h
                            </p>
                            <p className="text-sm text-gray-600">Avg Response Time</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                          <Users className="w-8 h-8 text-purple-600" />
                          <div>
                            <p className="text-2xl font-bold">
                              {selectedMember.metrics.collaboration_score.toFixed(1)}
                            </p>
                            <p className="text-sm text-gray-600">Collaboration Score</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="insights">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        AI-Generated Insights
                      </CardTitle>
                                             <CardDescription>
                         Comprehensive analysis of {selectedMember.name}&apos;s performance
                       </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedMember.insights ? (
                        <div className="space-y-4">
                          <Alert>
                            <AlertDescription>
                              <strong>Assessment:</strong> {selectedMember.insights.assessment}
                            </AlertDescription>
                          </Alert>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h4 className="font-medium text-green-700">Strengths</h4>
                              <ul className="list-disc list-inside text-sm space-y-1">
                                {selectedMember.insights.strengths.map((strength, idx) => (
                                  <li key={idx}>{strength}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="font-medium text-red-700">Concerns</h4>
                              <ul className="list-disc list-inside text-sm space-y-1">
                                {selectedMember.insights.concerns.map((concern, idx) => (
                                  <li key={idx}>{concern}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-medium text-blue-700">Recommendations</h4>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {selectedMember.insights.recommendations.map((rec, idx) => (
                                <li key={idx}>{rec}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t">
                            <Badge className={`${
                              selectedMember.insights.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                              selectedMember.insights.risk_level === 'medium' ? 'bg-orange-100 text-orange-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              Risk Level: {selectedMember.insights.risk_level.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              Confidence: {(selectedMember.insights.confidence_score * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Button 
                            onClick={() => generateInsights(selectedMember)}
                            disabled={loading}
                          >
                            {loading ? 'Generating...' : 'Generate AI Insights'}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="questions">
                  <Card>
                    <CardHeader>
                      <CardTitle>Coaching Questions</CardTitle>
                      <CardDescription>
                        AI-generated questions for your 1:1 with {selectedMember.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            onClick={() => generateQuestions(selectedMember, selectedMember.category)}
                            disabled={loading}
                          >
                            Generate {selectedMember.category.replace('_', ' ')} Questions
                          </Button>
                        </div>

                        {selectedMember.questions && (
                          <div className="space-y-3">
                            <h4 className="font-medium">Suggested Questions:</h4>
                            {selectedMember.questions.map((question, idx) => (
                              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm">{idx + 1}. {question}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="custom">
                  <Card>
                    <CardHeader>
                      <CardTitle>Custom Questions</CardTitle>
                      <CardDescription>
                        Describe a specific situation to get tailored coaching questions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Describe the specific situation or challenge you want to address with this team member..."
                          value={customRequest}
                          onChange={(e) => setCustomRequest(e.target.value)}
                          rows={3}
                        />
                        <Button
                          onClick={() => generateQuestions(selectedMember, 'custom')}
                          disabled={loading || !customRequest.trim()}
                        >
                          {loading ? 'Generating...' : 'Generate Custom Questions'}
                        </Button>

                        {selectedMember.questions && customRequest && (
                          <div className="space-y-3">
                            <h4 className="font-medium">Custom Questions:</h4>
                            {selectedMember.questions.map((question, idx) => (
                              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm">{idx + 1}. {question}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select a Team Member
                    </h3>
                    <p className="text-gray-600">
                      Choose a team member from the list to view their metrics and generate coaching questions
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
