# Authentication Bypass Guide

Currently, **Aura OS** is running in **Demo Mode** to allow your friends to test the app without registering via Google or hitting your Render/Supabase free tier limits.

Here is exactly what was changed and how to revert it in the future when you are ready to launch real authentication.

---

## 1. The Frontend Middleware (`frontend/src/middleware.ts`)
The middleware usually checks if a user has a valid session token (JWT) stored in their cookies. If they don't, it redirects them to `/login`.
**What we did:** We commented out the redirect logic so the middleware lets everyone into the dashboard regardless of their tokens.

**How to re-enable:**
Go to `frontend/src/middleware.ts` and uncomment the route protection blocks around line 60:
```typescript
// 1. If no session and trying to access protected route -> redirect to login
if (!session
    && !request.nextUrl.pathname.startsWith('/login')
    && !request.nextUrl.pathname.startsWith('/auth')
    && !request.nextUrl.pathname.startsWith('/_next')
    && !request.nextUrl.pathname.startsWith('/favicon.ico')
    && request.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url))
}

// 2. If session and trying to access login -> redirect to home
if (session && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url))
}
```

## 2. The Dashboard Entrypoint (`frontend/src/app/page.tsx`)
The dashboard usually asks Supabase `await supabase.auth.getUser()`. If it fails, it leaves the user in a loading/logged-out state.
**What we did:** We replaced the check with hardcoded logic to instantly assign every visitor the identity `"demo-user-123"`. Ensure you remove these lines when reverting.

**How to re-enable:**
Go to `frontend/src/app/page.tsx` around line 75, and restore the Supabase authentication fetch:
```typescript
useEffect(() => {
  const checkUser = async () => {
    // RE-ENABLE THIS FOR PRODUCTION:
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      setUserId(null);
    } else {
      setUserId(user.id);
      setUserEmail(user.email);
    }
    
    // DELETE THESE TWO LINES:
    // setUserId("demo-user-123");
    // setUserEmail("guest@aura.os");
    
    setIsLoading(false);
  };
  checkUser();
}, [supabase, router]);
```

## 3. The Python Backend (`app/dependencies/auth.py`)
Because the backend protects API routes (like Tasks, Timers, Analytics) using bearer tokens, it has a built-in toggle.
**What we did:** In your `.env` (or on Render Dashboard Environment Variables), you added `AURA_AUTH_MODE=mock`. 
The `auth.py` file reads this. If it says `"mock"`, the server assumes every request is perfectly legitimate and bypasses verifying the JWT with Supabase.

**How to re-enable:**
Change the environment variable parameter inside your `.env` file (or Render dashboard) back to production:
```env
# Change this:
AURA_AUTH_MODE=mock

# To this:
AURA_AUTH_MODE=production
```
Save and restart the backend server. The API will now block any request without a real, cryptographically signed Supabase token.
