import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return null
  if (!session) return <Auth />
  return <Dashboard userId={session.user.id} />
}

export default App