import React from 'react'

function CryptoCalculator() {


  return (
    <>
      <div className='earning_calculator_section'>
        <div className='calculator_top_cnt'>
          <div className='container'>
            <h1>CRYPTO  <span>CALCULATOR</span></h1>
            <p>Enterprise-grade security is at the core of everything we build.</p>
          </div>
        </div>
        <div className='container'>
          <div className='earining_calculator_form convertorusd_outer'>
            <h2>Fipcoin to USDT Convertor</h2>

            <div className='convertor_top_price'>
              <h3><span className='text-green'>1.0000000</span>Fipcoin =</h3>
              <div className='usdconvertor'><h3><span className='text-green'>773.89863395</span> USDT ≈ ₹ 773.89863395</h3></div>
            </div>

            <form>
              <div className='row'>
                <div className='col-sm-12'>
                  <div className='form_input'>
                    <div className="select_currency_s">
                      <div className="currency_option">
                        <div className="custom-select">
                          <span className="arrow"><i className="ri-arrow-down-s-line"></i></span>
                          <div className="selected-option">
                            <img src="/images/bitcoin_icon.png" alt="bitcoin" /> Option 3
                          </div>
                          <div className="options">
                            <div className="option">
                              <img src="/images/bitcoin_icon.png" alt="bitcoin" /> Option 1
                            </div>
                            <div className="option">
                              <img src="/images/bitcoin_icon.png" alt="bitcoin" /> Option 2
                            </div>
                            <div className="option">
                              <img src="/images/bitcoin_icon.png" alt="bitcoin" /> Option 3
                            </div>
                          </div>
                        </div>
                      </div>
                      <input type='text' placeholder='1.00000000'></input>

                    </div>

                    <div className='form_vector'>
                      <img src='/images/wallet_icon2.png' alt='vector'></img>
                    </div>

                    <div className="select_currency_s">
                      <div className="currency_option">
                        <div className="custom-select">
                          <span className="arrow"><i className="ri-arrow-down-s-line"></i></span>
                          <div className="selected-option">
                            <img src="/images/bitcoin_icon.png" alt="bitcoin" /> Option 3
                          </div>
                          <div className="options">
                            <div className="option">
                              <img src="/images/bitcoin_icon.png" alt="bitcoin" /> Option 1
                            </div>
                            <div className="option">
                              <img src="/images/bitcoin_icon.png" alt="bitcoin" /> Option 2
                            </div>
                            <div className="option">
                              <img src="/images/bitcoin_icon.png" alt="bitcoin" /> Option 3
                            </div>
                          </div>
                        </div>
                      </div>
                      <input type='text' placeholder='1.00000000'></input>

                    </div>


                  </div>
                </div>



                <div className='col-sm-12'>
                  <div className='buttonform'>
                    <button className='btn_submit'>Swap Now</button>
                  </div>
                </div>


              </div>
            </form>
          </div>

        </div>
      </div>
    </ >
  )
}

export default CryptoCalculator
