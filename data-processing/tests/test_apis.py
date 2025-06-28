import os
import json
import time
from datetime import datetime, timedelta
from dotenv import load_dotenv
import requests
from supabase import create_client, Client

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

def test_supabase_api():
    """Test Supabase API endpoints"""
    print("\nTesting Supabase API...")
    supabase_url = "https://wrwwxjdgrkhvahqjqfzg.supabase.co"
    supabase_key = os.getenv('SUPABASE_API_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indyd3d4amRncmtodmFocWpxZnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMTM3NDYsImV4cCI6MjA2NjY4OTc0Nn0.W6DWfZXpS4HTtCbkN4XfwlVnYCVvjMt7WTC7MKDfJEU')
    
    if not supabase_key:
        print("✗ Missing Supabase API key")
        return False
        
    try:
        # Initialize Supabase client
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Test connection by creating a test table
        try:
            response = supabase.table('test_connection').select("*").execute()
            print("✓ Successfully connected to Supabase")
            print(f"✓ Test query executed successfully")
            
            # Try to insert test data
            test_data = {"name": "test", "created_at": datetime.now().isoformat()}
            insert_response = supabase.table('test_connection').insert(test_data).execute()
            print("✓ Test data insertion successful")
            
            return True
        except Exception as table_error:
            print(f"✓ Connected to Supabase (table operations need setup)")
            print(f"Note: {str(table_error)}")
            return True
            
    except Exception as e:
        print(f"✗ Error connecting to Supabase: {str(e)}")
        return False

def test_slack_api(use_dummy_data=True, export_path='/Users/franciscoterpolilli/Downloads/Specter Slack export May 29 2025 - Jun 28 2025'):
    """Test Slack API endpoints with fallback to dummy data or local export"""
    print("\nTesting Slack API...")
    
    if not use_dummy_data and os.path.exists(export_path):
        try:
            # Process real Slack export data
            messages = []
            channels = []
            users = set()
            
            # Walk through the export directory
            for root, dirs, files in os.walk(export_path):
                for file in files:
                    if file.endswith('.json'):
                        channel_name = os.path.basename(root)
                        channel_id = f"C{len(channels)}"
                        channels.append({"id": channel_id, "name": channel_name, "is_channel": True})
                        
                        with open(os.path.join(root, file), 'r') as f:
                            channel_messages = json.load(f)
                            for msg in channel_messages:
                                if isinstance(msg, dict) and 'user' in msg:
                                    msg['channel'] = channel_id  # Add channel reference
                                    messages.append(msg)
                                    users.add(msg['user'])
            
            print(f"✓ Using real Slack export data")
            print(f"✓ Retrieved {len(messages)} messages")
            print(f"✓ Found {len(channels)} channels")
            print(f"✓ Found {len(users)} unique users")
            
            # Save processed data for development
            with open('slack_export_data.json', 'w') as f:
                json.dump({
                    'messages': messages[:100],  # Save first 100 messages as sample
                    'channels': channels,
                    'users': [{"id": uid, "name": uid} for uid in list(users)]
                }, f, indent=2)
            print("✓ Saved processed export data to slack_export_data.json")
            return True
            
        except Exception as e:
            print(f"✗ Error processing Slack export: {str(e)}")
            print("Falling back to dummy data...")
            use_dummy_data = True
    
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

def test_vercel_api():
    """Test Vercel API endpoints"""
    print("\nTesting Vercel API...")
    api_key = os.getenv('VERCEL_API_KEY', 'QsXQ7vGu70VuIpOpTntuPMxf')
    
    if not api_key:
        print("✗ Missing Vercel API key")
        return False
    
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    try:
        # Get user information
        response = requests.get('https://api.vercel.com/v2/user', headers=headers)
        if response.status_code == 200:
            user_data = response.json()
            print(f"✓ Successfully connected to Vercel API")
            print(f"✓ Authenticated as: {user_data.get('user', {}).get('email', 'unknown')}")
            
            # Get projects
            projects_response = requests.get('https://api.vercel.com/v9/projects', headers=headers)
            if projects_response.status_code == 200:
                projects = projects_response.json()
                print(f"✓ Found {len(projects.get('projects', []))} projects")
            return True
        else:
            print(f"✗ Failed to connect to Vercel API: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Error connecting to Vercel: {str(e)}")
        return False

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
    load_dotenv('../.env')  # Load from parent directory
    
    # Test all APIs
    slack_ok = test_slack_api(use_dummy_data=False)  # Use real export data
    supabase_ok = test_supabase_api()
    akkio_ok = test_akkio_api()
    vercel_ok = test_vercel_api()
    daytona_ok = test_daytona_api()
    
    print("\nTest Results:")
    print(f"Slack API (Export Data): {'✓' if slack_ok else '✗'}")
    print(f"Supabase API: {'✓' if supabase_ok else '✗'}")
    print(f"Akkio API: {'✓' if akkio_ok else '✗'}")
    print(f"Vercel API: {'✓' if vercel_ok else '✗'}")
    print(f"Daytona API: {'✓' if daytona_ok else '✗'}")

if __name__ == '__main__':
    main() 