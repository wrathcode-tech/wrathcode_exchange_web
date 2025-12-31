
import React from "react";
import { Link } from "react-router-dom";

const RandomErrorPage = () => {
  return (
    <section className="ptb-120">
      <div className="container">
        <div className="not-found-inner">
          <div className="row align-items-cente">
            <div className="col-md-5 mb-5">
              <img src="/images/404/404.png" alt="not found page" className="img-fluid" />
            </div>
            <div className="col-md-7">
              <div className="not-found-content">
                <h1 className="title">Opps...! <br />
                  Page not found</h1>
                <p>You seem can’t to find the page {/* <br /> */} you’re looking for.</p>
                <Link to="/" className="btn custom-btn btn-xl"><span>Back To Home</span></Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RandomErrorPage;
