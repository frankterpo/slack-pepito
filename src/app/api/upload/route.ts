import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase'
import Papa from 'papaparse'

interface SlackMessage {
  user: string
  text: string
  ts: string
  channel: string
  thread_ts?: string
  reply_count?: number
  reactions?: any[]
}

interface ProcessedUser {
  user_id: string
  username: string
  messages_sent: number
  participation_rate: number
  avg_response_time: number
  collaboration_score: number
  engagement_trend: 'increasing' | 'decreasing' | 'stable'
  last_active: string
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Only CSV files are allowed' }, { status: 400 })
    }

    // Read file content
    const fileContent = await file.text()
    
    // Parse CSV
    const parseResult = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true
    })

    if (parseResult.errors.length > 0) {
      console.error('CSV parsing errors:', parseResult.errors)
      return NextResponse.json({ error: 'Invalid CSV format' }, { status: 400 })
    }

    const data = parseResult.data as any[]
    
    // Create file upload record
    const { data: uploadRecord, error: uploadError } = await supabaseAdmin
      .from('file_uploads')
      .insert({
        user_id: userId,
        filename: file.name,
        status: 'processing',
        total_records: data.length
      })
      .select()
      .single()

    if (uploadError) {
      console.error('Error creating upload record:', uploadError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Process data in background (simplified for demo)
    processSlackData(data, uploadRecord.id, userId)

    return NextResponse.json({ 
      success: true, 
      uploadId: uploadRecord.id,
      message: 'File uploaded successfully and processing started'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function processSlackData(data: any[], uploadId: string, userId: string) {
  try {
    // Process the CSV data to extract insights
    const processedData = analyzeSlackData(data)
    
    // Store processed users
    for (const user of processedData.users) {
      await supabaseAdmin
        .from('users')
        .upsert({
          user_id: user.user_id,
          username: user.username,
          email: `${user.username}@company.com`, // Placeholder
          upload_id: uploadId
        })

      await supabaseAdmin
        .from('performance_metrics')
        .upsert({
          user_id: user.user_id,
          messages_sent: user.messages_sent,
          participation_rate: user.participation_rate,
          avg_response_time: user.avg_response_time,
          collaboration_score: user.collaboration_score,
          engagement_trend: user.engagement_trend,
          last_active: user.last_active,
          upload_id: uploadId
        })
    }

    // Store messages (sample)
    const messagesToStore = data.slice(0, 1000) // Limit for demo
    for (const message of messagesToStore) {
      if (message.user && message.text && message.ts) {
        await supabaseAdmin
          .from('messages')
          .insert({
            user_id: message.user,
            channel_id: message.channel || 'general',
            content: message.text,
            timestamp: new Date(parseFloat(message.ts) * 1000).toISOString(),
            thread_ts: message.thread_ts,
            upload_id: uploadId
          })
      }
    }

    // Update upload status
    await supabaseAdmin
      .from('file_uploads')
      .update({
        status: 'completed',
        processed_records: processedData.users.length,
        processed_at: new Date().toISOString()
      })
      .eq('id', uploadId)

    console.log(`Successfully processed ${processedData.users.length} users from upload ${uploadId}`)

  } catch (error) {
    console.error('Error processing data:', error)
    
    // Update upload status to failed
    await supabaseAdmin
      .from('file_uploads')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('id', uploadId)
  }
}

function analyzeSlackData(data: any[]): { users: ProcessedUser[] } {
  const userStats = new Map<string, {
    messages: number
    totalResponseTime: number
    responseCount: number
    lastActive: Date
    channels: Set<string>
    threads: number
  }>()

  // Analyze messages
  for (const row of data) {
    if (!row.user || !row.ts) continue

    const userId = row.user
    const timestamp = new Date(parseFloat(row.ts) * 1000)
    
    if (!userStats.has(userId)) {
      userStats.set(userId, {
        messages: 0,
        totalResponseTime: 0,
        responseCount: 0,
        lastActive: timestamp,
        channels: new Set(),
        threads: 0
      })
    }

    const stats = userStats.get(userId)!
    stats.messages++
    stats.channels.add(row.channel || 'general')
    
    if (row.thread_ts) {
      stats.threads++
    }

    if (timestamp > stats.lastActive) {
      stats.lastActive = timestamp
    }
  }

  // Convert to processed users
  const users: ProcessedUser[] = []
  const totalMessages = Array.from(userStats.values()).reduce((sum, stats) => sum + stats.messages, 0)
  const avgMessages = totalMessages / userStats.size

  for (const [userId, stats] of userStats.entries()) {
    const participationRate = stats.messages / totalMessages
    const collaborationScore = Math.min(5, (stats.channels.size * 0.5) + (stats.threads * 0.1))
    const avgResponseTime = stats.responseCount > 0 ? stats.totalResponseTime / stats.responseCount : 12
    
    // Determine engagement trend (simplified)
    let engagementTrend: 'increasing' | 'decreasing' | 'stable' = 'stable'
    if (stats.messages > avgMessages * 1.2) {
      engagementTrend = 'increasing'
    } else if (stats.messages < avgMessages * 0.5) {
      engagementTrend = 'decreasing'
    }

    users.push({
      user_id: userId,
      username: userId, // In real data, this would be the actual username
      messages_sent: stats.messages,
      participation_rate: participationRate,
      avg_response_time: avgResponseTime,
      collaboration_score: collaborationScore,
      engagement_trend: engagementTrend,
      last_active: stats.lastActive.toISOString()
    })
  }

  return { users }
} 