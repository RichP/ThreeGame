'use client'

import Head from 'next/head'
import dynamic from 'next/dynamic'
import type { NextPage } from 'next'

const SceneCanvas = dynamic(
  () => import('../components/SceneCanvas'),
  { 
    ssr: false,
    loading: () => <div style={{ color: '#fff', fontSize: '20px' }}>Loading scene...</div>
  }
)

const Home: NextPage = () => {
  return (
    <div className="container">
      <Head>
        <title>Grid Tactics Prototype</title>
      </Head>
      <h1>ThreeGame — Next.js + React Three Fiber</h1>
      <div style={{ width: '100vw', height: '100vh' }}>
        <SceneCanvas canvasProps={undefined} />
      </div>
    </div>
  )
}

export default Home
