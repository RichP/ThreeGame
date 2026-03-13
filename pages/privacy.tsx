import React from 'react'
import MainLayout from '../components/MainLayout'
import styles from './privacy.module.css'

const PrivacyPage: React.FC = () => {
  return (
    <MainLayout>
      <div className={styles.privacyPage}>
        <div className={styles.hero}>
          <h1>Privacy Policy</h1>
          <p>Last updated: March 2026</p>
        </div>

        <div className={styles.content}>
          <div className={styles.intro}>
            <p>
              At ThreeGame, we respect your privacy and are committed to protecting your 
              personal data. This privacy policy will inform you about how we handle your 
              personal data when you visit our website and tell you about your privacy rights.
            </p>
          </div>

          <div className={styles.sections}>
            <div className={styles.section}>
              <h2>1. Information We Collect</h2>
              <p>We collect several different types of information from and about users:</p>
              <ul>
                <li><strong>Personal Information:</strong> Name, email address, username, and password</li>
                <li><strong>Game Data:</strong> Match history, statistics, achievements, and preferences</li>
                <li><strong>Technical Data:</strong> IP address, browser type, time zone, and device information</li>
                <li><strong>Usage Data:</strong> Information about how you use our website and services</li>
              </ul>
            </div>

            <div className={styles.section}>
              <h2>2. How We Use Your Information</h2>
              <p>We use your personal information to:</p>
              <ul>
                <li>Provide and maintain our services</li>
                <li>Create and manage your user account</li>
                <li>Personalize your experience and game recommendations</li>
                <li>Improve our website, products, and services</li>
                <li>Communicate with you about updates and support</li>
                <li>Prevent fraud and ensure security</li>
              </ul>
            </div>

            <div className={styles.section}>
              <h2>3. Legal Basis for Processing</h2>
              <p>We process your personal data based on:</p>
              <ul>
                <li><strong>Contractual necessity:</strong> To provide services you have requested</li>
                <li><strong>Legitimate interests:</strong> To improve our services and prevent fraud</li>
                <li><strong>Consent:</strong> When you have given us explicit permission</li>
                <li><strong>Legal obligations:</strong> To comply with applicable laws</li>
              </ul>
            </div>

            <div className={styles.section}>
              <h2>4. Sharing Your Information</h2>
              <p>We may share your information with:</p>
              <ul>
                <li><strong>Service Providers:</strong> Third-party vendors who help us operate our services</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale</li>
                <li><strong>With Your Consent:</strong> When you explicitly authorize disclosure</li>
              </ul>
            </div>

            <div className={styles.section}>
              <h2>5. Data Retention</h2>
              <p>
                We will retain your personal information only for as long as is necessary for 
                the purposes set out in this privacy policy. We will retain and use your 
                information to the extent necessary to comply with our legal obligations, 
                resolve disputes, and enforce our policies.
              </p>
            </div>

            <div className={styles.section}>
              <h2>6. Your Data Protection Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li><strong>Access:</strong> Request copies of your personal data</li>
                <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Restrict Processing:</strong> Request restriction of processing your data</li>
                <li><strong>Data Portability:</strong> Request transfer of your data to another party</li>
                <li><strong>Object:</strong> Object to processing of your personal data</li>
              </ul>
            </div>

            <div className={styles.section}>
              <h2>7. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our website 
                and store certain information. You can instruct your browser to refuse all cookies 
                or to indicate when a cookie is being sent.
              </p>
              <p>We use cookies for:</p>
              <ul>
                <li>Session management and authentication</li>
                <li>Analytics and performance measurement</li>
                <li>Personalization and preferences</li>
                <li>Security and fraud prevention</li>
              </ul>
            </div>

            <div className={styles.section}>
              <h2>8. Security of Your Information</h2>
              <p>
                We use appropriate technical and organizational measures to protect the security 
                of your personal information. However, no method of transmission over the Internet 
                or method of electronic storage is 100% secure.
              </p>
            </div>

            <div className={styles.section}>
              <h2>9. International Transfers</h2>
              <p>
                Your information may be transferred to and maintained on computers located outside 
                of your state, province, country, or other governmental jurisdiction where the data 
                protection laws may differ from those of your jurisdiction.
              </p>
            </div>

            <div className={styles.section}>
              <h2>10. Children's Privacy</h2>
              <p>
                Our service does not address anyone under the age of 13. We do not knowingly collect 
                personal information from children under 13. If you are a parent or guardian and you 
                are aware that your child has provided us with personal information, please contact us.
              </p>
            </div>

            <div className={styles.section}>
              <h2>11. Third-Party Services</h2>
              <p>
                Our website may contain links to other websites that are not operated by us. If you 
                click on a third-party link, you will be directed to that third party's site. We 
                strongly advise you to review the privacy policy of every site you visit.
              </p>
            </div>

            <div className={styles.section}>
              <h2>12. Changes to This Privacy Policy</h2>
              <p>
                We may update our privacy policy from time to time. We will notify you of any changes 
                by posting the new privacy policy on this page and updating the "Last updated" date.
              </p>
            </div>

            <div className={styles.section}>
              <h2>13. Contact Us</h2>
              <p>
                If you have any questions about this privacy policy, please contact us:
              </p>
              <p>
                <strong>Email:</strong> privacy@threegame.com<br />
                <strong>Address:</strong> ThreeGame Privacy Department, 123 Game Street, 
                Tech City, TC 12345
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default PrivacyPage