import React from 'react'
import MainLayout from '../components/MainLayout'
import styles from './help.module.css'

const HelpPage: React.FC = () => {
  return (
    <MainLayout>
      <div className={styles.helpPage}>
        <div className={styles.hero}>
          <h1>Help Center</h1>
          <p>Find answers to common questions and get support for ThreeGame</p>
        </div>

        <div className={styles.content}>
          <div className={styles.searchSection}>
            <input 
              type="text" 
              placeholder="Search for help..." 
              className={styles.searchInput}
            />
            <button className={styles.searchBtn}>Search</button>
          </div>

          <div className={styles.categories}>
            <div className={styles.category}>
              <h3>Getting Started</h3>
              <ul>
                <li><a href="#">How to create an account</a></li>
                <li><a href="#">Understanding the game interface</a></li>
                <li><a href="#">Basic controls and navigation</a></li>
                <li><a href="#">Setting up your profile</a></li>
              </ul>
            </div>

            <div className={styles.category}>
              <h3>Gameplay</h3>
              <ul>
                <li><a href="#">How to play matches</a></li>
                <li><a href="#">Understanding game mechanics</a></li>
                <li><a href="#">Unit abilities and strategies</a></li>
                <li><a href="#">Matchmaking system</a></li>
              </ul>
            </div>

            <div className={styles.category}>
              <h3>Account & Security</h3>
              <ul>
                <li><a href="#">Changing your password</a></li>
                <li><a href="#">Two-factor authentication</a></li>
                <li><a href="#">Account recovery</a></li>
                <li><a href="#">Privacy settings</a></li>
              </ul>
            </div>

            <div className={styles.category}>
              <h3>Technical Issues</h3>
              <ul>
                <li><a href="#">Troubleshooting connection problems</a></li>
                <li><a href="#">Performance optimization</a></li>
                <li><a href="#">Browser compatibility</a></li>
                <li><a href="#">Clearing cache and cookies</a></li>
              </ul>
            </div>
          </div>

          <div className={styles.contactSection}>
            <h3>Still need help?</h3>
            <p>Our support team is here to assist you. Contact us through our support channels.</p>
            <button className={styles.contactBtn}>Contact Support</button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default HelpPage