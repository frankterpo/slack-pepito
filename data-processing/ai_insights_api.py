import os
import json
from openai import OpenAI
from datetime import datetime, timedelta
from typing import List, Dict, Any
from supabase import create_client, Client

class SlackAnalyticsAI:
    def __init__(self):
        # Initialize OpenAI client
        self.openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        # Initialize Supabase
        supabase_url = "https://hnymxzaugffegrpqsppu.supabase.co"
        supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
        self.supabase: Client = create_client(supabase_url, supabase_key)
    
    def generate_questions_for_underperforming(self, user_id: str, user_metrics: Dict) -> List[str]:
        """Generate questions for underperforming team members"""
        prompt = f"""
        You are an HR expert helping managers have constructive conversations with underperforming team members.
        
        Based on these Slack engagement metrics:
        - Messages sent last 30 days: {user_metrics.get('messages_sent', 0)}
        - Participation rate: {user_metrics.get('participation_rate', 0):.1%}
        - Response time: {user_metrics.get('avg_response_time', 0):.1f} hours
        - Engagement trend: {user_metrics.get('engagement_trend', 'unknown')}
        
        Generate 5 thoughtful, non-confrontational questions that a manager could ask to:
        1. Understand potential barriers or challenges
        2. Identify support needed
        3. Explore workload and priorities
        4. Assess job satisfaction and motivation
        5. Collaboratively find solutions
        
        Make questions open-ended, empathetic, and solution-focused.
        Return as a JSON array of strings.
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=800
            )
            
            questions = json.loads(response.choices[0].message.content)
            
            # Store in database
            for question in questions:
                self.supabase.table('ai_questions').insert({
                    'user_id': user_id,
                    'question_type': 'underperforming',
                    'question': question,
                    'context': f"Low engagement: {user_metrics.get('participation_rate', 0):.1%} participation",
                    'priority': 4,
                    'metadata': user_metrics
                }).execute()
            
            return questions
            
        except Exception as e:
            print(f"Error generating underperforming questions: {e}")
            return self._fallback_underperforming_questions()
    
    def generate_questions_for_overperforming(self, user_id: str, user_metrics: Dict) -> List[str]:
        """Generate questions for high-performing team members"""
        prompt = f"""
        You are an HR expert helping managers engage with high-performing team members.
        
        Based on these excellent Slack engagement metrics:
        - Messages sent last 30 days: {user_metrics.get('messages_sent', 0)}
        - Participation rate: {user_metrics.get('participation_rate', 0):.1%}
        - Response time: {user_metrics.get('avg_response_time', 0):.1f} hours
        - Collaboration score: {user_metrics.get('collaboration_score', 0):.1f}
        
        Generate 5 engaging questions that a manager could ask to:
        1. Recognize and appreciate their contributions
        2. Understand what drives their success
        3. Explore career growth opportunities
        4. Identify ways to leverage their strengths
        5. Discuss potential leadership or mentoring roles
        
        Make questions appreciative, growth-focused, and opportunity-oriented.
        Return as a JSON array of strings.
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=800
            )
            
            questions = json.loads(response.choices[0].message.content)
            
            # Store in database
            for question in questions:
                self.supabase.table('ai_questions').insert({
                    'user_id': user_id,
                    'question_type': 'overperforming',
                    'question': question,
                    'context': f"High performance: {user_metrics.get('participation_rate', 0):.1%} participation",
                    'priority': 2,
                    'metadata': user_metrics
                }).execute()
            
            return questions
            
        except Exception as e:
            print(f"Error generating overperforming questions: {e}")
            return self._fallback_overperforming_questions()
    
    def generate_questions_for_silent_quitting(self, user_id: str, user_metrics: Dict) -> List[str]:
        """Generate questions for potential silent quitting situations"""
        prompt = f"""
        You are an HR expert helping managers address potential disengagement.
        
        Based on these concerning Slack patterns:
        - Messages sent last 30 days: {user_metrics.get('messages_sent', 0)}
        - Days since last activity: {user_metrics.get('days_since_active', 0)}
        - Participation drop: {user_metrics.get('participation_drop', 0):.1%}
        - Engagement trend: {user_metrics.get('engagement_trend', 'declining')}
        
        Generate 5 sensitive, empathetic questions that a manager could ask to:
        1. Check on their wellbeing and job satisfaction
        2. Understand any challenges or frustrations
        3. Explore workload and work-life balance
        4. Identify what support or changes might help
        5. Rebuild engagement and connection
        
        Make questions caring, non-judgmental, and focused on understanding their experience.
        Return as a JSON array of strings.
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=800
            )
            
            questions = json.loads(response.choices[0].message.content)
            
            # Store in database
            for question in questions:
                self.supabase.table('ai_questions').insert({
                    'user_id': user_id,
                    'question_type': 'silent_quitting',
                    'question': question,
                    'context': f"Potential disengagement detected",
                    'priority': 5,
                    'metadata': user_metrics
                }).execute()
            
            return questions
            
        except Exception as e:
            print(f"Error generating silent quitting questions: {e}")
            return self._fallback_silent_quitting_questions()
    
    def generate_custom_questions(self, user_id: str, custom_request: str, user_metrics: Dict) -> List[str]:
        """Generate custom questions based on manager's specific request"""
        prompt = f"""
        You are an HR expert helping a manager with a specific situation.
        
        Team member's Slack metrics:
        - Messages sent last 30 days: {user_metrics.get('messages_sent', 0)}
        - Participation rate: {user_metrics.get('participation_rate', 0):.1%}
        - Response time: {user_metrics.get('avg_response_time', 0):.1f} hours
        - Collaboration score: {user_metrics.get('collaboration_score', 0):.1f}
        
        Manager's specific request: "{custom_request}"
        
        Generate 5 thoughtful questions that address the manager's request while considering the team member's performance data.
        Make questions professional, constructive, and actionable.
        Return as a JSON array of strings.
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=800
            )
            
            questions = json.loads(response.choices[0].message.content)
            
            # Store in database
            for question in questions:
                self.supabase.table('ai_questions').insert({
                    'user_id': user_id,
                    'question_type': 'custom',
                    'question': question,
                    'context': custom_request,
                    'priority': 3,
                    'metadata': {**user_metrics, 'custom_request': custom_request}
                }).execute()
            
            return questions
            
        except Exception as e:
            print(f"Error generating custom questions: {e}")
            return [f"Based on your request about '{custom_request}', what specific support or changes would be most helpful for this team member?"]
    
    def generate_insights(self, user_id: str, user_metrics: Dict) -> Dict[str, Any]:
        """Generate AI-powered insights about a team member"""
        prompt = f"""
        You are an HR analytics expert providing insights about team member performance.
        
        Slack engagement data:
        - Messages sent last 30 days: {user_metrics.get('messages_sent', 0)}
        - Participation rate: {user_metrics.get('participation_rate', 0):.1%}
        - Response time: {user_metrics.get('avg_response_time', 0):.1f} hours
        - Collaboration score: {user_metrics.get('collaboration_score', 0):.1f}
        - Engagement trend: {user_metrics.get('engagement_trend', 'stable')}
        
        Provide a comprehensive analysis including:
        1. Overall performance assessment
        2. Key strengths and areas of concern
        3. Potential underlying factors
        4. Recommended actions for the manager
        5. Risk level (low/medium/high) for retention
        
        Return as JSON with keys: assessment, strengths, concerns, factors, recommendations, risk_level, confidence_score
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=1000
            )
            
            insights = json.loads(response.choices[0].message.content)
            
            # Store in database
            self.supabase.table('ai_insights').insert({
                'user_id': user_id,
                'insight_type': self._determine_insight_type(user_metrics),
                'title': insights.get('assessment', 'Performance Analysis'),
                'description': json.dumps(insights),
                'confidence_score': insights.get('confidence_score', 0.8),
                'suggested_actions': insights.get('recommendations', []),
                'metadata': user_metrics
            }).execute()
            
            return insights
            
        except Exception as e:
            print(f"Error generating insights: {e}")
            return self._fallback_insights(user_metrics)
    
    def _determine_insight_type(self, metrics: Dict) -> str:
        """Determine the type of insight based on metrics"""
        participation = metrics.get('participation_rate', 0)
        messages = metrics.get('messages_sent', 0)
        
        if participation < 0.3 or messages < 10:
            return 'underperforming'
        elif participation > 0.8 and messages > 50:
            return 'overperforming'
        elif metrics.get('days_since_active', 0) > 7:
            return 'silent_quitting'
        else:
            return 'normal'
    
    # Fallback questions in case AI fails
    def _fallback_underperforming_questions(self) -> List[str]:
        return [
            "How are you feeling about your current workload and priorities?",
            "What challenges or obstacles are you facing that I might not be aware of?",
            "Is there any additional support or resources you need to be more effective?",
            "How do you prefer to receive feedback and stay connected with the team?",
            "What would make your work experience more engaging and fulfilling?"
        ]
    
    def _fallback_overperforming_questions(self) -> List[str]:
        return [
            "What aspects of your work do you find most energizing and rewarding?",
            "Are there any new challenges or projects you'd be interested in taking on?",
            "How can we better leverage your strengths to benefit the team?",
            "What are your career goals and how can I support your growth?",
            "Would you be interested in mentoring or leading initiatives for other team members?"
        ]
    
    def _fallback_silent_quitting_questions(self) -> List[str]:
        return [
            "How are you doing overall, both professionally and personally?",
            "What aspects of your work do you find most and least satisfying?",
            "Is there anything about your role or our team that's causing frustration?",
            "What changes could we make to improve your work experience?",
            "How can I better support you and help you feel more connected to the team?"
        ]
    
    def _fallback_insights(self, metrics: Dict) -> Dict[str, Any]:
        """Fallback insights when AI fails"""
        participation = metrics.get('participation_rate', 0)
        
        if participation < 0.3:
            return {
                "assessment": "Low engagement detected",
                "strengths": ["Potential for improvement"],
                "concerns": ["Low participation in team communications"],
                "factors": ["Workload", "Communication preferences", "Role clarity"],
                "recommendations": ["Schedule 1:1 meeting", "Assess workload", "Clarify expectations"],
                "risk_level": "medium",
                "confidence_score": 0.7
            }
        elif participation > 0.8:
            return {
                "assessment": "High performer with strong engagement",
                "strengths": ["Active communicator", "Team collaborator"],
                "concerns": ["Potential burnout risk"],
                "factors": ["High motivation", "Strong team connection"],
                "recommendations": ["Recognize contributions", "Explore growth opportunities"],
                "risk_level": "low",
                "confidence_score": 0.8
            }
        else:
            return {
                "assessment": "Stable performance with room for growth",
                "strengths": ["Consistent engagement"],
                "concerns": ["Could increase participation"],
                "factors": ["Role satisfaction", "Team dynamics"],
                "recommendations": ["Regular check-ins", "Encourage more participation"],
                "risk_level": "low",
                "confidence_score": 0.6
            }

# Example usage and testing
if __name__ == '__main__':
    ai = SlackAnalyticsAI()
    
    # Example metrics for testing
    test_metrics = {
        'messages_sent': 15,
        'participation_rate': 0.25,
        'avg_response_time': 4.5,
        'collaboration_score': 0.4,
        'engagement_trend': 'decreasing',
        'days_since_active': 3
    }
    
    print("Testing AI Question Generation...")
    
    # Test underperforming questions
    questions = ai.generate_questions_for_underperforming('TEST_USER_1', test_metrics)
    print(f"Generated {len(questions)} underperforming questions")
    
    # Test insights
    insights = ai.generate_insights('TEST_USER_1', test_metrics)
    print(f"Generated insights: {insights.get('assessment', 'No assessment')}") 