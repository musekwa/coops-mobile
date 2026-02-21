
import { Session } from '@supabase/supabase-js'
import { create } from 'zustand'

export type SupabaseActionStore = {
    // session
    session: Session | null
    setSession: (session: Session | null) => void
    getSession: () => Session | null

}

export const useSupabaseActionStore = create<SupabaseActionStore>((set, get) => ({

    // session
    session: null,
    setSession: (session: Session | null) => set({ session }),
    getSession: () => get().session,

}))
