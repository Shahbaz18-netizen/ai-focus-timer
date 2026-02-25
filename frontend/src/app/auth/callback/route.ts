import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    console.log(`Auth Callback hit. Code present: ${!!code}, Next: ${next}`);

    if (code) {
        const response = NextResponse.redirect(`${origin}${next}`)

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        console.log(`Setting cookie: ${name}`);
                        response.cookies.set({
                            name,
                            value,
                            ...options,
                        })
                    },
                    remove(name: string, options: CookieOptions) {
                        console.log(`Removing cookie: ${name}`);
                        response.cookies.set({
                            name,
                            value: '',
                            ...options,
                        })
                    },
                },
            }
        )

        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            console.log("Session exchange successful.");
            return response
        } else {
            console.error("Session exchange error:", error);
        }
    }

    // return the user to an error page with instructions
    console.log("Redirecting to auth-code-error");
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
