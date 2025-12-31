import React from 'react'

function EarningCalculator() {


  return (
    <>
      <div className='earning_calculator_section'>
        <div className='calculator_top_cnt'>
          <div className='container'>
            <h1>EARNING <span>CALCULATOR</span></h1>
            <p>Unlock Your Profit Potential by Estimating Your Earnings and Crunch the Numbers with Our Earnings Calculator</p>
          </div>
        </div>
        <div className='container'>
          <div className='earining_calculator_form'>
            <h2>EARNING CALCULATOR</h2>
            <form>
              <div className='row'>
                <div className='col-sm-6'>
                  <div className='form_input'>
                    <label>Currency</label>
                    <input type='text' placeholder='USDT'></input>
                  </div>
                </div>
                <div className='col-sm-6'>
                  <div className='form_input'>
                    <label>Subscription Amount</label>
                    <input type='text' placeholder='1000'></input>
                  </div>
                </div>
                <div className='col-sm-6'>
                  <div className='form_input'>
                    <label>Staking Bonus (%)</label>
                    <input type='text' placeholder='0.13333333'></input>
                  </div>
                </div>
                <div className='col-sm-6'>
                  <div className='form_input'>
                    <label>Choose Period</label>
                    <input type='text' placeholder='Daily'></input>
                  </div>
                </div>
                <div className='col-sm-6'>
                  <div className='form_input'>
                    <label>Auto Subscription</label>
                    <select>
                      <option>Enble</option>
                      <option>Enble</option>
                    </select>
                  </div>
                </div>
                <div className='col-sm-6'>
                  <div className='form_input'>
                    <label>Days</label>
                    <input type='text' placeholder='360'></input>
                  </div>
                </div>

                <div className='col-sm-6'>
                  <div className='form_input'>
                    <label>Start Date</label>
                    <input type='date' placeholder='05/29/2025'></input>
                  </div>
                </div>
                <div className='col-sm-6'>
                  <div className='form_input'>
                    <label>Daily Staking Rate(%)</label>
                    <input type='text' placeholder='100'></input>
                  </div>
                </div>

                <div className='col-sm-12'>
                  <div className='note_text'>
                    <label>*Note : include all days of week </label>
                  </div>
                </div>

                <div className='col-sm-12'>
                  <div className='buttonform'>
                    <button className='btn_submit'>Calculataor</button>
                  </div>
                </div>


              </div>
            </form>
          </div>
          <div className="dashboard_recent_s earningrecent">
            <div className="user_list_top">
              <div className="user_list_l earning_section_cate ">
                <h4>Earnings <i className="ri-arrow-right-s-line"></i></h4>
              </div>
              <div className="user_search">
                <form className='searchinput'>
                  <button><i className="ri-search-line"></i></button>
                  <input type="text" placeholder="Search" />
                </form>
              </div>
            </div>
            <div className='table-responsive'>
              <table>
                <thead>
                  <tr>
                    <th>S.No 2</th>
                    <th>Date</th>
                    <th>Earn</th>
                    <th>Total Earn</th>
                    <th>Amount</th>
                  </tr>
                </thead>
              </table>
              <div className='no_data'>
                <img src="/images/no_data_vector.svg" className="img-fluid" alt="no-found" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ >
  )
}

export default EarningCalculator
