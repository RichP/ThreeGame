'use client'

import React from 'react'
import { useRouter } from 'next/router'
import MainLayout from '../components/MainLayout'
import styles from './tutorial.module.css'

export default function TutorialPage() {
  const router = useRouter()

  return (
    <MainLayout>
      <div className={styles.wrap}>
        <div className={styles.panel}>
          <h1 className={styles.title}>Tutorial</h1>
          <p className={styles.subtitle}>
            Learn the basics in under 60 seconds. This is a lightweight onboarding page
            (no video yet) that explains the core rules and gets you into a match quickly.
          </p>

          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Goal</div>
              <ul className={styles.list}>
                <li>Defeat all enemy units.</li>
                <li>Each turn, your units can move and then attack (if able).</li>
              </ul>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Turn Flow</div>
              <ul className={styles.list}>
                <li><b>Select</b> a unit with actions remaining.</li>
                <li><b>Move</b> to a highlighted tile (movement cost shown in Move Preview).</li>
                <li><b>Attack</b> an enemy in range/line-of-sight (see Target Preview odds).</li>
              </ul>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Reading the Board</div>
              <ul className={styles.list}>
                <li>Highlighted tiles show where you can move or attack.</li>
                <li>Blocked tiles block movement and line-of-sight.</li>
                <li>Hover targets to see hit/miss/crit odds and kill chance.</li>
              </ul>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Quick Tips</div>
              <ul className={styles.list}>
                <li>Use cover: units adjacent to blocked tiles are harder to hit.</li>
                <li>Try to end moves with good lines of sight.</li>
                <li>If no enemies are in range, you can skip attack and continue turn.</li>
              </ul>
            </div>
          </div>

          <div className={styles.ctaRow}>
            <button
              className={styles.primaryButton}
              onClick={() => {
                router.push('/match?tutorial=1')
              }}
            >
              Start Tutorial Match
            </button>

            <button
              className={styles.secondaryButton}
              onClick={() => {
                router.push('/')
              }}
            >
              Back to Home
            </button>
          </div>

          <div className={styles.hint}>
            Tip: Open <b>Animation Settings</b> in-match to toggle sound effects and tweak visuals.
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
