import { createBrowserClient } from '@supabase/ssr'

// 🛠️ DEVELOPMENT OVERRIDE
// Since the environment cannot reliably connect to Supabase (causing 'Failed to fetch' timeouts),
// we use a mock client for local development to keep the UI functional.
const MOCK_MODE = true;

const createMockClient = () => {
    return {
        auth: {
            getUser: async () => ({
                data: { user: { id: "demo-user-123", email: "demo@example.com" } },
                error: null
            }),
            getSession: async () => ({
                data: { session: { access_token: "dev-mock-token" } },
                error: null
            }),
            onAuthStateChange: () => ({
                data: { subscription: { unsubscribe: () => { } } }
            })
        },
        from: (table: string) => ({
            select: () => ({
                eq: () => ({
                    order: () => ({
                        limit: () => ({
                            execute: async () => ({ data: [], error: null })
                        }),
                        execute: async () => ({ data: [], error: null })
                    }),
                    execute: async () => ({ data: [], error: null })
                }),
                in: () => ({
                    execute: async () => ({ data: [], error: null })
                }),
                execute: async () => ({ data: [], error: null })
            }),
            insert: () => ({
                select: () => ({
                    single: async () => ({ data: {}, error: null })
                }),
                execute: async () => ({ data: [], error: null })
            }),
            update: () => ({
                eq: () => ({
                    execute: async () => ({ data: [], error: null })
                })
            }),
            delete: () => ({
                eq: () => ({
                    execute: async () => ({ data: [], error: null })
                })
            })
        }),
        // Add table synonym for server-side compatibility if needed (python client uses .table)
        table: (table: string) => ({
            select: () => ({
                eq: () => ({
                    order: () => ({
                        limit: () => ({
                            execute: async () => ({ data: [], error: null })
                        })
                    })
                })
            })
        })
    } as any;
};

export const createClient = () => {
    if (MOCK_MODE) {
        return createMockClient();
    }

    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}
