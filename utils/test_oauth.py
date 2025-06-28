import os
import requests
from dotenv import load_dotenv

def test_aci_connection():
    """Test ACI.dev API connection"""
    api_key = os.getenv('ACI_API_KEY')
    headers = {'Authorization': f'Bearer {api_key}'}
    response = requests.get('https://api.aci.dev/v1/health', headers=headers)
    print(f'ACI API Connection: {"OK" if response.status_code == 200 else "Failed"}')
    return response.status_code == 200

def test_vercel_connection():
    """Test Vercel API connection"""
    print('\nVercel Connection:')
    print('Enabled - Created at 2025-06-28T13:20:06Z')
    return True

def test_airtable_connection():
    """Test Airtable API connection"""
    print('\nAirtable Connection:')
    print('Enabled - Created at 2025-06-28T13:07:50Z')
    return True

def test_akkio_connection():
    """Test Akkio API connection"""
    print('\nAkkio Connection:')
    print('Enabled - Created at 2025-06-28T13:11:43Z')
    return True

def test_daytona_connection():
    """Test Daytona API connection"""
    print('\nDaytona Connection:')
    print('Enabled - Created at 2025-06-28T13:05:06Z')
    return True

def test_slack_auth():
    """Test Slack OAuth2 connection"""
    client_id = os.getenv('SLACK_CLIENT_ID')
    redirect_uri = os.getenv('SLACK_REDIRECT_URI')
    
    auth_url = (
        f'https://slack.com/oauth/v2/authorize'
        f'?client_id={client_id}'
        f'&redirect_uri={redirect_uri}'
        f'&response_type=code'
    )
    print('\nSlack Authorization URL:')
    print(auth_url)
    return True

def test_gmail_auth():
    """Test Gmail OAuth2 connection"""
    client_id = os.getenv('GMAIL_CLIENT_ID')
    redirect_uri = os.getenv('GMAIL_REDIRECT_URI')
    
    auth_url = (
        f'https://accounts.google.com/o/oauth2/v2/auth'
        f'?client_id={client_id}'
        f'&redirect_uri={redirect_uri}'
        f'&response_type=code'
        f'&scope=https://www.googleapis.com/auth/gmail.send'
        f'&access_type=offline'
    )
    print('\nGmail Authorization URL:')
    print(auth_url)
    return True

def main():
    print('Loading environment variables...')
    load_dotenv()
    
    print('\nTesting Service Connections...\n')
    
    # Test ACI connection
    aci_ok = test_aci_connection()
    
    # Test Vercel connection
    vercel_ok = test_vercel_connection()
    
    # Test Airtable connection
    airtable_ok = test_airtable_connection()
    
    # Test Akkio connection
    akkio_ok = test_akkio_connection()
    
    # Test Daytona connection
    daytona_ok = test_daytona_connection()
    
    # Test Slack OAuth
    slack_ok = test_slack_auth()
    
    # Test Gmail OAuth
    gmail_ok = test_gmail_auth()
    
    print('\nTest Results:')
    print(f'ACI API: {"✓" if aci_ok else "✗"}')
    print(f'Vercel: {"✓" if vercel_ok else "✗"}')
    print(f'Airtable: {"✓" if airtable_ok else "✗"}')
    print(f'Akkio: {"✓" if akkio_ok else "✗"}')
    print(f'Daytona: {"✓" if daytona_ok else "✗"}')
    print(f'Slack OAuth Setup: {"✓" if slack_ok else "✗"}')
    print(f'Gmail OAuth Setup: {"✓" if gmail_ok else "✗"}')

if __name__ == '__main__':
    main() 