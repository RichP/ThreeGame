import React from 'react'
import MainLayout from '../components/MainLayout'
import ApiExample from '../components/examples/ApiExample'
import TestUtils from '../components/examples/TestUtils'
import styles from './test.module.css'

const TestPage: React.FC = () => {
  return (
    <MainLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>ThreeGame API & Error Handling Test Suite</h1>
          <p className={styles.subtitle}>
            Comprehensive testing interface for the API integration layer and error handling system
          </p>
        </div>

        <div className={styles.testSections}>
          <div className={styles.section}>
            <h2>🔧 Interactive Test Utilities</h2>
            <p>Use these tools to test all aspects of the error handling and notification system:</p>
            <TestUtils />
          </div>

          <div className={styles.section}>
            <h2>🌐 API Integration Examples</h2>
            <p>Real-world examples of API calls with proper error handling and user feedback:</p>
            <ApiExample />
          </div>

          <div className={styles.section}>
            <h2>📋 Quick Test Checklist</h2>
            <div className={styles.checklist}>
              <div className={styles.checklistItem}>
                <h3>✅ Toast Notifications</h3>
                <ul>
                  <li>Test all toast types (success, error, warning, info)</li>
                  <li>Verify auto-dismissal timing</li>
                  <li>Test multiple toasts stacking</li>
                  <li>Check keyboard accessibility</li>
                </ul>
              </div>

              <div className={styles.checklistItem}>
                <h3>✅ Error Handling</h3>
                <ul>
                  <li>Test API error scenarios</li>
                  <li>Test validation errors</li>
                  <li>Test loading states</li>
                  <li>Verify error boundary catches component errors</li>
                </ul>
              </div>

              <div className={styles.checklistItem}>
                <h3>✅ API Integration</h3>
                <ul>
                  <li>Test authentication flow</li>
                  <li>Test data fetching operations</li>
                  <li>Test error responses</li>
                  <li>Verify token management</li>
                </ul>
              </div>

              <div className={styles.checklistItem}>
                <h3>✅ Accessibility</h3>
                <ul>
                  <li>Test screen reader compatibility</li>
                  <li>Verify keyboard navigation</li>
                  <li>Check high contrast mode</li>
                  <li>Test reduced motion preferences</li>
                </ul>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2>🚀 How to Test</h2>
            <div className={styles.testingSteps}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Start Here</h4>
                  <p>Begin with the Interactive Test Utilities section to get familiar with the system.</p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Test Core Features</h4>
                  <p>Use the API Integration Examples to test real-world scenarios.</p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>Verify Edge Cases</h4>
                  <p>Test error scenarios, network issues, and accessibility features.</p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h4>Check Browser Tools</h4>
                  <p>Open browser developer tools to monitor network requests and console logs.</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2>📚 Additional Resources</h2>
            <div className={styles.resources}>
              <div className={styles.resourceCard}>
                <h3>📖 API Integration Guide</h3>
                <p>Comprehensive documentation on using the API service layer.</p>
                <a href="/docs/API_INTEGRATION.md" target="_blank" rel="noopener noreferrer">
                  Read Documentation
                </a>
              </div>

              <div className={styles.resourceCard}>
                <h3>🧪 Testing Guide</h3>
                <p>Detailed testing procedures and best practices.</p>
                <a href="/docs/TESTING_GUIDE.md" target="_blank" rel="noopener noreferrer">
                  View Testing Guide
                </a>
              </div>

              <div className={styles.resourceCard}>
                <h3>🔧 Developer Tools</h3>
                <p>Use browser developer tools for advanced testing and debugging.</p>
                <ul>
                  <li><strong>Network Tab:</strong> Monitor API requests</li>
                  <li><strong>Console Tab:</strong> Check for errors</li>
                  <li><strong>Application Tab:</strong> Inspect localStorage</li>
                  <li><strong>Elements Tab:</strong> Inspect DOM structure</li>
                </ul>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2>⚠️ Important Notes</h2>
            <div className={styles.notes}>
              <div className={styles.note}>
                <h4>🌐 Backend Required</h4>
                <p>For full API testing, you'll need a running backend server. The examples use mock endpoints that may not work without a real API.</p>
              </div>

              <div className={styles.note}>
                <h4>🔒 Authentication</h4>
                <p>Some features require authentication. Use the registration and login forms to create test accounts.</p>
              </div>

              <div className={styles.note}>
                <h4>📱 Mobile Testing</h4>
                <p>Test on different screen sizes to ensure responsive design works correctly.</p>
              </div>

              <div className={styles.note}>
                <h4>♿ Accessibility</h4>
                <p>Verify all features work with screen readers and keyboard navigation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default TestPage