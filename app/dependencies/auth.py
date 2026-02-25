from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from app.core.supabase_client import supabase

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Validates the Bearer token against Supabase Auth.
    Returns the user_id (sub) if valid.
    """
    token = credentials.credentials
    
    # 🛠️ DEVELOPMENT OVERRIDE
    # If network is restricted or during quick dev, use a mock user.
    if os.environ.get("AURA_AUTH_MODE") == "mock":
        # Return a consistent demo user ID
        return "demo-user-123"


    try:
        # Check token structure before sending
        if not token or len(token) < 20:
             print(f"DEBUG: Token is missing or malformed. Length: {len(token) if token else 0}")
             raise ValueError("Malformed token")
             
        # Verify the token with Supabase
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        
        if not user:
            print(f"DEBUG: No user found for token. Response: {user_response}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid session or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        return user.id
        
    except Exception as e:
        error_name = type(e).__name__
        print(f"❌ Auth Error ({error_name}): {e}")
        
        # If it's a connection timeout, provide a more helpful message
        if "Timeout" in error_name or "Connection" in error_name:
            detail = "Backend could not reach Supabase for authentication. Check your internet connection or use AURA_AUTH_MODE=mock."
        else:
            detail = f"Authentication failed: {error_name}"
            
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )
