
import React from "react";
import { Link } from "react-router-dom";

const MentinancePage = () => {
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
                <h1 className="title">We are <br />
                  under maintenance</h1>
                <p> We are improving our Website. we'll be back with new cool features!</p>
                {/* <Link to="/" className="btn custom-btn btn-xl"><span>Back To Home</span></Link> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MentinancePage;
