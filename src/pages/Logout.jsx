import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function Logout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    signOut().then(() => navigate('/', { replace: true }))
  }, [])

  return null
}
