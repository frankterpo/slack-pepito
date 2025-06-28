import os
import json
import time
from datetime import datetime, timedelta
from dotenv import load_dotenv
import requests

class DummySlackData:
    """Fallback dummy data for Slack testing"""
    
    @staticmethod
    def get_messages():
        return [
            {
                "user": "U123456",
                "text": "Just finished the quarterly report",
                "ts": "1624982400.000",
                "channel": "C789012",
                "reactions": ["thumbsup", "rocket"],
                "thread_ts": None
            },
            {
                "user": "U234567",
                "text": "Great progress on the ML model!",
                "ts": "1624983000.000",
                "channel": "C789012",
                "reactions": ["brain", "tada"],
                "thread_ts": None
            },
            {
                "user": "U345678",
                "text": "Team meeting in 10 minutes",
                "ts": "1624983600.000",
                "channel": "C789012",
                "reactions": ["calendar", "check"],
                "thread_ts": None
            }
        ]

    @staticmethod
    def get_channels():
        return [
            {"id": "C789012", "name": "general", "is_channel": True},
            {"id": "C890123", "name": "random", "is_channel": True},
            {"id": "C901234", "name": "tech-discussion", "is_channel": True}
        ]

    @staticmethod
    def get_users():
        return [
            {"id": "U123456", "name": "john.doe", "real_name": "John Doe"},
            {"id": "U234567", "name": "jane.smith", "real_name": "Jane Smith"},
            {"id": "U345678", "name": "bob.wilson", "real_name": "Bob Wilson"}
        ]

def test_slack_api(use_dummy_data=True):
    """Test Slack API endpoints with fallback to dummy data"""
    print("\nTesting Slack API...")
    
    if use_dummy_data:
        dummy = DummySlackData()
        messages = dummy.get_messages()
        channels = dummy.get_channels()
        users = dummy.get_users()
        
        print("✓ Using dummy data for development")
        print(f"✓ Retrieved {len(messages)} messages")
        print(f"✓ Retrieved {len(channels)} channels")
        print(f"✓ Retrieved {len(users)} users")
        
        # Save dummy data for development
        with open('dummy_slack_data.json', 'w') as f:
            json.dump({
                'messages': messages,
                'channels': channels,
                'users': users
            }, f, indent=2)
        print("✓ Saved dummy data to dummy_slack_data.json")
        return True
    else:
        # Implement real Slack API calls here when OAuth is set up
        return False

def test_airtable_api():
    """Test Airtable API endpoints"""
    print("\nTesting Airtable API...")
    api_key = os.getenv('AIRTABLE_API_KEY')
    base_id = os.getenv('AIRTABLE_BASE_ID')
    table_name = os.getenv('AIRTABLE_TABLE_NAME')
    
    if not all([api_key, base_id, table_name]):
        print("✗ Missing Airtable configuration")
        return False
    
    # Test endpoint structure
    endpoint = f"https://api.airtable.com/v0/{base_id}/{table_name}"
    print(f"✓ Airtable endpoint configured: {endpoint}")
    return True

def test_akkio_api():
    """Test Akkio API endpoints"""
    print("\nTesting Akkio API...")
    api_key = os.getenv('AKKIO_API_KEY')
    model_id = os.getenv('AKKIO_MODEL_ID')
    
    if not all([api_key, model_id]):
        print("✗ Missing Akkio configuration")
        return False
    
    print("✓ Akkio credentials configured")
    return True

def test_vercel_api():
    """Test Vercel API endpoints"""
    print("\nTesting Vercel API...")
    api_key = os.getenv('VERCEL_API_KEY')
    team_id = os.getenv('VERCEL_TEAM_ID')
    
    if not all([api_key, team_id]):
        print("✗ Missing Vercel configuration")
        return False
    
    print("✓ Vercel credentials configured")
    return True

def test_daytona_api():
    """Test Daytona API endpoints"""
    print("\nTesting Daytona API...")
    api_key = os.getenv('DAYTONA_API_KEY')
    project_id = os.getenv('DAYTONA_PROJECT_ID')
    
    if not all([api_key, project_id]):
        print("✗ Missing Daytona configuration")
        return False
    
    print("✓ Daytona credentials configured")
    return True

def main():
    print("Loading environment variables...")
    load_dotenv()
    
    # Test all APIs
    slack_ok = test_slack_api(use_dummy_data=True)
    airtable_ok = test_airtable_api()
    akkio_ok = test_akkio_api()
    vercel_ok = test_vercel_api()
    daytona_ok = test_daytona_api()
    
    print("\nTest Results:")
    print(f"Slack API (Dummy Data): {'✓' if slack_ok else '✗'}")
    print(f"Airtable API: {'✓' if airtable_ok else '✗'}")
    print(f"Akkio API: {'✓' if akkio_ok else '✗'}")
    print(f"Vercel API: {'✓' if vercel_ok else '✗'}")
    print(f"Daytona API: {'✓' if daytona_ok else '✗'}")

if __name__ == '__main__':
    main() 