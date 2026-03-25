import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import MainLayout from '../components/MainLayout'
import { AuthProvider } from '../components/auth/AuthContext'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  
  // Check if this is a match page (should not have main layout)
  // This includes both /match and /match/[id] routes
  // Note: router.pathname for /match/[id] is '/match/[id]', not '/match/some-id'
  const isMatchPage = router.pathname === '/match' || 
                      router.pathname.startsWith('/match/') || 
                      router.pathname === '/match/[id]'
  
  if (isMatchPage) {
    // Match pages should only have the game layout, not the main website layout
    // But they still need AuthProvider for authentication
    return (
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    )
  }
  
  return (
    <MainLayout
