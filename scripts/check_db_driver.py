
import os
from supabase import create_client, Client

# Initialize Supabase client
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    # Try to load from env file if environment variables are missing
    try:
        from dotenv import load_dotenv
        load_dotenv()
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
    except:
        pass

if not url or not key:
    print("Error: SUPABASE_URL and SUPABASE_KEY must be set.")
    exit(1)

supabase: Client = create_client(url, key)

# SQL to add reporting_time column
sql = """
ALTER TABLE daily_plans 
ADD COLUMN IF NOT EXISTS reporting_time TEXT;
"""
# Note: Using TEXT for ISO string initially to match frontend usage, or TIMESTAMPTZ.
# migration_v2.sql used TIMESTAMPTZ. Let's use TIMESTAMPTZ.
sql_timestamp = """
ALTER TABLE daily_plans 
ADD COLUMN IF NOT EXISTS reporting_time TIMESTAMPTZ;
"""

try:
    # Supabase-py doesn't have a direct query method for DDL usually, 
    # but we can try rpc if a function exists, or use the postgrest client?
    # Actually, standard supabase-py client interacts with PostgREST. 
    # PostgREST doesn't support DDL (ALTER TABLE).
    # We need a direct SQL connection or use the dashboard.
    
    # HOWEVER, if we are in a dev environment with a local postgres, we might assume psycopg2?
    # But the user asked why it is stored in JSON. 
    
    # Since I cannot run DDL via the supabase-py client directly unless there is a specific RPC function 
    # or I have direct PG access, I might be blocked from *applying* the migration myself.
    
    # Wait, I see "migration_v2.sql" exists. Maybe the user expects me to run it?
    # If the user has a local postgres running on port 5432 (common for local supabase dev), 
    # I can try to use `psql` if installed or `python` with `psycopg2`.
    
    # Let's check if psycopg2 is installed.
    import psycopg2
    print("psycopg2 is installed.")
except ImportError:
    print("psycopg2 is NOT installed.")

