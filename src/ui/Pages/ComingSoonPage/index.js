import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

const ComingSoonPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.style.overflow = 'hidden'; // Disable scroll on body

    return () => {
      document.body.style.overflow = 'auto'; // Restore scroll on unmount
    };
  }, []);
  return (
    <div className="container ..." style={{ zIndex: 1 }}>
      <Link to="/" className="btn custom-btn btn-xl">
        <i className="ri-home-7-line me-3"></i> Back to Home
      </Link>
      <section className="section-padding pc_bg login_sec" style={{ height: "100vh", overflow: "hidden" }}>
        <div className="section-overlay"></div>
        <div className="container h-100 d-flex justify-content-center align-items-center position-relative" style={{ zIndex: 1 }}>
          <div className="coming_soon text-center">
            <img src="/images/coming_soon_dark.svg" className="img-fluid mb-5 show_dark" alt="Coming Soon" />
          </div>
        </div>
      </section>
    </div>

  )
}

export default ComingSoonPage
