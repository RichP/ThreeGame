'use client'

import Head from 'next/head'
import dynamic from 'next/dynamic'
import type { NextPage } from 'next'
import MainLayout from '../components/MainLayout'

const SceneCanvas = dynamic(
  () => import('../components/SceneCanvas'),
  { 
    ssr: false,
    loading: () => <div style={{ color: '#fff', fontSize: '20px' }}>Loading scene...</div>
  }
)

const Home: NextPage = () => {
  return (
    <MainLayout>
      <Head>
        <title>ThreeGame — Next.js + React Three Fiber</title>
      </Head>
      
      <div style={{ width: '100%', height: '100%' }}>
        <SceneCanvas canvasProps={undefined} />
      </div>
    </MainLayout>
  )
}

export default Home
