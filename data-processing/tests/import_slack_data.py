import os
import json
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

def import_slack_data(export_path='/Users/franciscoterpolilli/Downloads/Specter Slack export May 29 2025 - Jun 28 2025'):
    """Import Slack export data into Supabase"""
    print("\nImporting Slack data...")
    
    # Initialize Supabase client
    supabase_url = "https://wrwwxjdgrkhvahqjqfzg.supabase.co"
    supabase_key = os.getenv('SUPABASE_API_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indyd3d4amRncmtodmFocWpxZnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMTM3NDYsImV4cCI6MjA2NjY4OTc0Nn0.W6DWfZXpS4HTtCbkN4XfwlVnYCVvjMt7WTC7MKDfJEU')
    supabase: Client = create_client(supabase_url, supabase_key)
    
    try:
        # Process Slack export data
        channels = {}
        users = set()
        messages = []
        
        # Walk through the export directory
        for root, dirs, files in os.walk(export_path):
            for file in files:
                if file.endswith('.json'):
                    channel_name = os.path.basename(root)
                    channel_id = f"C{len(channels)}"
                    channels[channel_name] = {
                        "id": channel_id,
                        "name": channel_name,
                        "is_channel": True
                    }
                    
                    with open(os.path.join(root, file), 'r') as f:
                        channel_messages = json.load(f)
                        for msg in channel_messages:
                            if isinstance(msg, dict) and 'user' in msg:
                                # Add user to set
                                users.add(msg['user'])
                                
                                # Add channel reference to message
                                msg['channel_id'] = channel_id
                                msg['id'] = f"M{len(messages)}"  # Generate unique message ID
                                messages.append(msg)
        
        # Convert users to list of dicts
        user_records = [{"id": uid, "name": uid} for uid in users]
        
        print(f"Found {len(channels)} channels, {len(users)} users, and {len(messages)} messages")
        
        try:
            # Insert channels
            print("\nInserting channels...")
            for channel in channels.values():
                response = supabase.table('channels').insert(channel).execute()
                print(f"✓ Inserted channel: {channel['name']}")
            
            # Insert users
            print("\nInserting users...")
            for user in user_records:
                response = supabase.table('users').insert(user).execute()
                print(f"✓ Inserted user: {user['id']}")
            
            # Insert messages in batches
            print("\nInserting messages...")
            batch_size = 100
            for i in range(0, len(messages), batch_size):
                batch = messages[i:i + batch_size]
                message_records = []
                for msg in batch:
                    record = {
                        "id": msg['id'],
                        "channel_id": msg['channel_id'],
                        "user_id": msg['user'],
                        "text": msg['text'],
                        "ts": msg['ts'],
                        "thread_ts": msg.get('thread_ts'),
                        "reactions": json.dumps(msg.get('reactions', [])) if msg.get('reactions') else None
                    }
                    message_records.append(record)
                
                response = supabase.table('messages').insert(message_records).execute()
                print(f"✓ Inserted {len(batch)} messages")
            
            print("\n✓ All data imported successfully!")
            return True
            
        except Exception as e:
            print(f"\n✗ Error importing data: {str(e)}")
            return False
        
    except Exception as e:
        print(f"✗ Error processing Slack export: {str(e)}")
        return False

if __name__ == '__main__':
    load_dotenv('../.env')  # Load from parent directory
    import_slack_data() 