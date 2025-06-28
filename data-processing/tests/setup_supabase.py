import os
import json
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

def setup_supabase():
    """Set up Supabase tables and schema"""
    print("\nSetting up Supabase...")
    
    # Initialize Supabase client with service role key
    supabase_url = "https://hnymxzaugffegrpqsppu.supabase.co"
    supabase_key = os.getenv('SUPABASE_SERVICE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhueW14emF1Z2ZmZWdycHFzcHB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTExNTQxMiwiZXhwIjoyMDY2NjkxNDEyfQ.voOgKk9JSYpj4h5P8H1dqg2YCcPdHogE_jgaZAjCShc')
    supabase: Client = create_client(supabase_url, supabase_key)
    
    try:
        print("Testing table access by inserting test data...")
        
        try:
            # Test channel
            test_channel = {"id": "TEST1", "name": "test-channel"}
            response = supabase.table('channels').insert(test_channel).execute()
            print("✓ Channels table working")
            
            # Test user
            test_user = {"id": "TEST1", "name": "test-user"}
            response = supabase.table('users').insert(test_user).execute()
            print("✓ Users table working")
            
            # Test message
            test_message = {
                "id": "TEST1",
                "channel_id": "TEST1",
                "user_id": "TEST1",
                "text": "Test message",
                "ts": "1624982400.000"
            }
            response = supabase.table('messages').insert(test_message).execute()
            print("✓ Messages table working")
            
            # Test analytics
            test_analytics = {
                "user_id": "TEST1",
                "metric_type": "messages_sent",
                "metric_value": 1.0,
                "period_start": "2025-06-28T00:00:00Z",
                "period_end": "2025-06-28T23:59:59Z"
            }
            response = supabase.table('analytics').insert(test_analytics).execute()
            print("✓ Analytics table working")
            
            print("\n✓ All tables verified and working!")
            return True
            
        except Exception as e:
            print(f"\n✗ Error: {str(e)}")
            print("\nPlease create the tables using the Supabase dashboard SQL editor with this SQL:")
            print("""
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create channels table
create table if not exists public.channels (
    id text primary key,
    name text not null,
    is_channel boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create users table
create table if not exists public.users (
    id text primary key,
    name text,
    real_name text,
    email text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create messages table with relations
create table if not exists public.messages (
    id text primary key,
    channel_id text references public.channels(id),
    user_id text references public.users(id),
    text text not null,
    ts text not null,
    thread_ts text,
    reactions jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create analytics table for productivity metrics
create table if not exists public.analytics (
    id uuid primary key default uuid_generate_v4(),
    user_id text references public.users(id),
    metric_type text not null,
    metric_value float not null,
    period_start timestamp with time zone not null,
    period_end timestamp with time zone not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
            """)
            return False
        
    except Exception as e:
        print(f"✗ Error setting up Supabase: {str(e)}")
        return False

if __name__ == '__main__':
    load_dotenv('../.env')  # Load from parent directory
    setup_supabase() 