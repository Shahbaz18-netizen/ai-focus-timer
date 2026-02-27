'use client'

import { createClient } from '@/lib/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AuthChangeEvent } from '@supabase/supabase-js'

export default function LoginPage() {
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event: AuthChangeEvent) => {
                if (event === 'SIGNED_IN') {
                    router.refresh()
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [supabase, router])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-md p-8 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Aura OS</h1>
                    <p className="text-zinc-400">Enter the Focus Zone</p>
                </div>
                <Auth
                    supabaseClient={supabase}
                    appearance={{
                        theme: ThemeSupa,
                        variables: {
                            default: {
                                colors: {
                                    brand: '#22c55e', // Green accent
                                    brandAccent: '#16a34a',
                                    inputBackground: '#18181b', // zinc-900
                                    inputText: 'white',
                                    inputBorder: '#27272a',
                                    inputLabelText: '#a1a1aa',
                                }
                            }
                        }
                    }}
                    theme="dark"
                    providers={['google']} // Google Auth enabled
                    socialLayout="horizontal"
                    redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
                />
            </div>
        </div>
    )
}
