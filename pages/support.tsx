import React, { useState } from 'react'
import MainLayout from '../components/MainLayout'
import styles from './support.module.css'

const SupportPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    issueType: 'general',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    alert('Support request submitted successfully!')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <MainLayout>
      <div className={styles.supportPage}>
        <div className={styles.hero}>
          <h1>Support</h1>
          <p>We're here to help you with any issues or questions you may have</p>
        </div>

        <div className={styles.content}>
          <div className={styles.contactOptions}>
            <div className={styles.option}>
              <div className={styles.icon}>📧</div>
              <h3>Email Support</h3>
              <p>support@threegame.com</p>
              <span className={styles.response}>Response within 24 hours</span>
            </div>

            <div className={styles.option}>
              <div className={styles.icon}>💬</div>
              <h3>Live Chat</h3>
              <p>Available 9 AM - 6 PM UTC</p>
              <span className={styles.response}>Instant response</span>
            </div>

            <div className={styles.option}>
              <div className={styles.icon}>📚</div>
              <h3>Help Center</h3>
              <p>Find answers to common questions</p>
              <span className={styles.response}>24/7 available</span>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Send us a message</h2>
            <form onSubmit={handleSubmit} className={styles.supportForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="issueType">Issue Type</label>
                  <select
                    id="issueType"
                    name="issueType"
                    value={formData.issueType}
                    onChange={handleChange}
                    className={styles.formSelect}
                  >
                    <option value="general">General Question</option>
                    <option value="technical">Technical Issue</option>
                    <option value="account">Account Problem</option>
                    <option value="payment">Payment/Billing</option>
                    <option value="bug">Report a Bug</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className={styles.formTextarea}
                  placeholder="Please describe your issue in detail..."
                ></textarea>
              </div>

              <button type="submit" className={styles.submitBtn}>
                Send Message
              </button>
            </form>
          </div>

          <div className={styles.faqSection}>
            <h2>Frequently Asked Questions</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h3>How do I reset my password?</h3>
                <p>Go to the login page and click "Forgot Password". Follow the instructions sent to your email to reset your password.</p>
              </div>
              <div className={styles.faqItem}>
                <h3>What browsers are supported?</h3>
                <p>We support the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, please use an updated browser.</p>
              </div>
              <div className={styles.faqItem}>
                <h3>How do I report a bug?</h3>
                <p>You can report bugs through our support form or by emailing bugs@threegame.com with detailed information about the issue.</p>
              </div>
              <div className={styles.faqItem}>
                <h3>Can I delete my account?</h3>
                <p>Yes, you can delete your account from your profile settings. Please note that this action cannot be undone.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default SupportPage