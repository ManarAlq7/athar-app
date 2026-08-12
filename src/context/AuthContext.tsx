import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, authErrorMessage } from '../lib/supabase'

interface AuthValue {
  user: User | null
  session: Session | null
  /** صحيح حتى تُستعاد الجلسة المحفوظة — تمنع وميض صفحة الدخول للمستخدم المسجَّل */
  loading: boolean
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string; needsConfirmation?: boolean }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return
        setSession(data.session)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,

      async signUp(email, password, name) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim() } },
        })

        if (error) return { error: authErrorMessage(error.message) }

        // إن كان تأكيد البريد مفعّلاً في المشروع، لا تُنشأ جلسة فوراً
        return { needsConfirmation: !data.session }
      },

      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (error) return { error: authErrorMessage(error.message) }
        return {}
      },

      async signOut() {
        await supabase.auth.signOut()
      },
    }),
    [session, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth يجب أن يُستخدم داخل AuthProvider')
  return ctx
}

/** اسم العرض: الاسم الكامل إن وُجد، وإلا الجزء الأول من البريد */
export function displayName(user: User | null): string {
  if (!user) return ''
  const full = (user.user_metadata?.full_name as string | undefined)?.trim()
  if (full) return full
  return user.email?.split('@')[0] ?? 'مستخدم'
}
