import React from 'react'
import Link from 'next/link'

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">ThreeGame</h3>
            <p className="footer-description">
              The ultimate tactical strategy experience. Join thousands of players 
              in epic turn-based battles.
            </p>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link href="/help">Help Center</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/support">Support</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-heading">Connect</h4>
            <div className="footer-social">
              <a href="#" aria-label="Twitter" className="social-link">Twitter</a>
              <a href="#" aria-label="Discord" className="social-link">Discord</a>
              <a href="#" aria-label="Reddit" className="social-link">Reddit</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} ThreeGame. All rights reserved.
          </p>
          <p className="footer-version">Version 1.0.0</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer