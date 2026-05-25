import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import ResetPassword from './pages/ResetPassword'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)
  const recoveryRef = useRef(false)

  useEffect(() => {
    const initAuth = async () => {
      const isRecoveryRedirect = window.location.search.includes('type=recovery') || window.location.hash.includes('type=recovery') || window.location.hash.includes('access_token')
      let session = null

      if (isRecoveryRedirect) {
        const { data, error } = await supabase.auth.getSessionFromUrl()
        if (error) console.error('Auth redirect error:', error.message)
        session = data?.session ?? null
        recoveryRef.current = true
        setIsPasswordRecovery(true)
        window.history.replaceState({}, '', window.location.origin + window.location.pathname)
      } else {
        const { data } = await supabase.auth.getSession()
        session = data?.session ?? null
      }

      setSession(session)
      setLoading(false)
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('event:', _event)
      if (_event === 'PASSWORD_RECOVERY') {
        recoveryRef.current = true
        setIsPasswordRecovery(true)
      } else if (_event === 'SIGNED_OUT') {
        recoveryRef.current = false
        setIsPasswordRecovery(false)
      } else if (_event === 'SIGNED_IN' && !recoveryRef.current) {
        setIsPasswordRecovery(false)
      }
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return null
  if (isPasswordRecovery) return <ResetPassword onDone={() => {
    recoveryRef.current = false
    setIsPasswordRecovery(false)
  }} />
  if (!session) return <Auth />
  return <Dashboard userId={session.user.id} />
}

export default App
