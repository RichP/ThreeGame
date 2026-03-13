import React from 'react'
import MainLayout from '../components/MainLayout'
import styles from './terms.module.css'

const TermsPage: React.FC = () => {
  return (
    <MainLayout>
      <div className={styles.termsPage}>
        <div className={styles.hero}>
          <h1>Terms of Service</h1>
          <p>Last updated: March 2026</p>
        </div>

        <div className={styles.content}>
          <div className={styles.intro}>
            <p>
              Welcome to ThreeGame! These Terms of Service ("Terms") govern your use of our website 
              and services. Please read these Terms carefully before using our platform.
            </p>
            <p>
              By accessing or using ThreeGame, you agree to be bound by these Terms. If you disagree 
              with any part of the terms, you may not access the service.
            </p>
          </div>

          <div className={styles.sections}>
            <div className={styles.section}>
              <h2>1. Acceptance of Terms</h2>
              <p>
                By using our website and services, you confirm that you accept these Terms and 
                agree to comply with them. You also confirm that you are at least 13 years old 
                or have parental consent to use our services.
              </p>
            </div>

            <div className={styles.section}>
              <h2>2. Changes to Terms</h2>
              <p>
                We may revise and update these Terms from time to time in our sole discretion. 
                All changes are effective immediately when we post them. Your continued use of 
                the website following the posting of revised Terms means that you accept and 
                agree to the changes.
              </p>
            </div>

            <div className={styles.section}>
              <h2>3. Account Registration</h2>
              <p>
                To access certain features, you must register for an account. You agree to:
              </p>
              <ul>
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your information</li>
                <li>Keep your password confidential</li>
                <li>Accept all risks of unauthorized access</li>
              </ul>
            </div>

            <div className={styles.section}>
              <h2>4. User Conduct</h2>
              <p>You agree not to:</p>
              <ul>
                <li>Use the service for any illegal purpose</li>
                <li>Violate any laws in your jurisdiction</li>
                <li>Engage in conduct that is harmful to other users</li>
                <li>Upload or transmit viruses or malicious code</li>
                <li>Attempt to gain unauthorized access to the service</li>
              </ul>
            </div>

            <div className={styles.section}>
              <h2>5. Intellectual Property Rights</h2>
              <p>
                The website and its entire contents, features, and functionality are owned by 
                us and are protected by international copyright, trademark, patent, trade 
                secret, and other intellectual property or proprietary rights laws.
              </p>
            </div>

            <div className={styles.section}>
              <h2>6. User-Generated Content</h2>
              <p>
                You may submit content through our service. By submitting content, you grant 
                us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, 
                and display such content in connection with the service.
              </p>
            </div>

            <div className={styles.section}>
              <h2>7. Prohibited Uses</h2>
              <p>You may not use the website in any way that:</p>
              <ul>
                <li>Violates any applicable federal, state, local, or international law</li>
                <li>Infringes upon or violates our intellectual property rights</li>
                <li>Is harmful, threatening, or abusive</li>
                <li>Interferes with or disrupts the service</li>
                <li>Attempts to interfere with the proper working of the service</li>
              </ul>
            </div>

            <div className={styles.section}>
              <h2>8. Termination</h2>
              <p>
                We may terminate or suspend your account and bar access to the service 
                immediately, without prior notice or liability, under our sole discretion, 
                for any reason whatsoever and without limitation, including but not limited 
                to a breach of the Terms.
              </p>
            </div>

            <div className={styles.section}>
              <h2>9. Disclaimer of Warranties</h2>
              <p>
                The website is provided on an "as is" and "as available" basis without any 
                representations or warranties of any kind. We do not warrant that the website 
                will be uninterrupted, secure, or error-free.
              </p>
            </div>

            <div className={styles.section}>
              <h2>10. Limitation of Liability</h2>
              <p>
                In no event shall we be liable for any indirect, incidental, special, 
                consequential, or punitive damages arising out of or related to your use 
                of the website.
              </p>
            </div>

            <div className={styles.section}>
              <h2>11. Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless us from and against any 
                claims, damages, obligations, losses, liabilities, costs, or debt, and 
                expenses arising from your use of the website.
              </p>
            </div>

            <div className={styles.section}>
              <h2>12. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of 
                your jurisdiction, without regard to its conflict of law provisions.
              </p>
            </div>

            <div className={styles.section}>
              <h2>13. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <p>
                <strong>Email:</strong> legal@threegame.com<br />
                <strong>Address:</strong> ThreeGame Legal Department, 123 Game Street, 
                Tech City, TC 12345
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default TermsPage