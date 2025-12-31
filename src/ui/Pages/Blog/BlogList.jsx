import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Slider from "react-slick";

const BlogList = () => {

  let blogContent = [
    {
      title: 'Why Do Crypto Traders Need Trading Journals?',
      description: "Trading cryptocurrencies is like riding a rollercoaster — thrilling, unpredictable, and sometimes downright...",
      image: "/images/logo_light.svg",
      index: "blog1",
      category: "Crypto"
    },
    {
      title: 'Smart Strategies for Thriving Safely in a Booming Market',
      description: "As eco-conscious markets surge and green industries gain momentum, the opportunities for investors, entrepreneurs, and innovat...",
      image: "/images/blogs/blog2.png",
      index: "blog2",
      category: "Analysis"
    },
    {
      title: 'Unlock the Power of Market Movements',
      description: "Trading cryptocurrencies is like riding a rollercoaster — thrilling, unpredictable, and sometimes downright...",
      image: "/images/blogs/blog3.png",
      index: "blog3",
      category: "Analysis"
    },

    {
      title: 'Your Simple Guide to Crypto Basics',
      description: "Cryptocurrency trading can be an exhilarating experience, but it can also be quite daunting for beginne...",
      image: "/images/blogs/blog4.png",
      index: "blog4",
      category: "Crypto"
    },
    {
      title: 'The Benefits of Trading Altcoins: Diversifying Your Portfolio',
      description: "Cryptocurrency has revolutionized the world of finance, with Bitcoin often taking center stage...",
      image: "/images/blogs/blog5.png",
      index: "blog5",
      category: "Events"
    },
    {
      title: 'The Top 5 Crypto Futures Trading Mistakes And How to Avoid Them!',
      description: "Cryptocurrency has revolutionized the world of finance, with Bitcoin often taking center stage...",
      image: "/images/blogs/blog6.png",
      index: "blog6",
      category: "Tips & Tricks"
    },


  ];
  const [blogList, setBlogList] = useState(blogContent);
  const [category, setCategory] = useState(["Tips & Tricks", "Events", "Crypto", "Analysis"]);
  const [showRecentBlog, setShowRecentBlog] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigate = useNavigate();

  // ***** Redirect To Blog Details Page *****//
  const nextPage = (data) => {
    navigate(`/blogdetails?${data}`);
  };



  const scrollToTarget = () => {
    setShowRecentBlog(true)
    targetRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  return (
    <>

      <div className="blog_section_b">
        <section className="inner-page-banner bg-2 bg-image">
          <div className="container">
            <div className="inner">

              <div className="top_heading_cnt">
                <h2>CV Trade Blog</h2>
                <h1 className="title">Learn About Crypto Casually</h1>
              </div>

              <div className="top_right_img">
                <img src="/images/blog_top_bn_img.svg" className='img-fluid' alt="vector" />
              </div>




              {/* <nav className="mt-4">
              <ol className="breadcrumb justify-content-center">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Blog</li>
              </ol>
            </nav> */}
            </div>


            <div className="search_outer_blog">
              <div className="left_hb">
                <ul>
                  {category?.map((item) => {
                    return (

                      <li>{item}</li>
                    )
                  })}

                  {/* <li><a href="#">All</a></li> */}
                </ul>
              </div>

              <div className="search_right">
                {/* <form>
                  <input type="text" placeholder="Search what you want to know"></input>
                  <button><img src="/images/search_icon.svg" className='search_btn' alt="search" /></button>
                </form> */}
              </div>

            </div>


          </div>
        </section>

        {/* <section className="featured_blog">
          <div className="container">

            <h2>Featured</h2>

            <div className="autoplay">
              <Slider {...bannerSettings}>
                <div className="featured_block_bl">

                  <div className="blog_img">
                    <img src="/images/blogs/blog1.webp" alt="images" />
                  </div>

                  <div className="featured_cnt_bl">
                    <h3>Why Do Crypto Traders Need Trading Journals?</h3>
                    <p>Trading cryptocurrencies is like riding a rollercoaster — thrilling, unpredictable, and sometimes downright</p>
                  </div>


                </div>
                <div className="featured_block_bl">

                  <div className="blog_img">
                    <img src="/images/blogs/blog2.webp" alt="images" />
                  </div>

                  <div className="featured_cnt_bl">
                    <h3>Why Do Crypto Traders Need Trading Journals?</h3>
                    <p>Trading cryptocurrencies is like riding a rollercoaster — thrilling, unpredictable, and sometimes downright</p>
                  </div>


                </div>


                <div className="featured_block_bl">

                  <div className="blog_img">
                    <img src="/images/blogs/blog3.webp" alt="images" />
                  </div>

                  <div className="featured_cnt_bl">
                    <h3>Why Do Crypto Traders Need Trading Journals?</h3>
                    <p>Trading cryptocurrencies is like riding a rollercoaster — thrilling, unpredictable, and sometimes downright</p>
                  </div>


                </div>

              </Slider>




            </div>

          </div>
        </section> */}


        <section className="mt-3">
          <div className="container">
            <div className="crypto_cta">
              <div className="row">

                <div className="col-sm-9">
                  <h3 className="mb-3">Trade Smarter. Swap Faster. Welcome to the Future of Crypto Exchange.</h3>
                  <Link to="/signup" className="startbtn ">Start Here</Link>
                </div>

                <div className="col-sm-3">
                  <div className="cta_img">
                    <img src="/images/crypto_cta_img.png" alt="images" />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>



        <section className="hot_articles_s">
          <div className="container">

            <h2>Hot Articles</h2>

            <div className="row mt-2">
              {category?.map((catoegoryItem) => {
                return (
                  <div className="col-sm-4 mt-2 mb-5" >
                    <div className="block_blog">

                      <div className="top_articles_h">
                        <h3><a href="#"><img src="/images/articel_icon.png" alt="images" />{catoegoryItem}</a></h3>
                      </div>
                      {blogList?.filter((blog) => blog?.category === catoegoryItem)?.reverse()?.slice(0, 1)?.map((item) => {
                        function truncateString(str, maxLength) {
                          return str.length > maxLength ? str.substring(0, maxLength) : str;
                        }
                        const truncated = truncateString(item?.title, 80);
                        return (
                          <div className="articles_blog_bl" onClick={() => nextPage(item?.index)}>

                            <a className="thumb cursor-pointer">
                              <img src={item?.image} alt="nft blog" />
                            </a>
                            <h4>{truncated}...</h4>
                            <ul className="meta_date">
                              <li>{catoegoryItem}</li>
                              {/* <li>|</li> */}
                              {/* <li>{moment(item.createdAt).format("YYYY-MM-DD")}</li> */}
                            </ul>

                          </div>
                        )
                      })}






                      <div className="view_allbtn">
                        <a href="#/" onClick={scrollToTarget}>View All</a>
                      </div>


                    </div>

                  </div>
                )
              })}







            </div>

          </div>
        </section>



        <section>
          <div className="container">
            <div className="crypto_cta">
              <div className="row">

                <div className="col-sm-9">
                  <h3>Register On CV Trade Now To Begin Trading</h3>
                  <Link to="/signup" className="startbtn mt-2">Register Now</Link>
                </div>

                <div className="col-sm-3">
                  <div className="cta_img">
                    <img src="/images/cta_vector2.svg" alt="images" />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>



        <section className="hot_articles_s recent_blog">
          <div className="container">

            <div className="recentblog_top">

              <h2 ref={targetRef}>Recent Blogs...</h2>
              {!showRecentBlog && <div className="view_allbtn">
                <span className="cursor_pointer" onClick={() => setShowRecentBlog(true)}>View All</span>
              </div>}


            </div>

            <div className="row" >
              {blogList?.slice(0, showRecentBlog ? blogList?.length : 4)?.map((item) => {
                function truncateString(str, maxLength) {
                  return str.length > maxLength ? str.substring(0, maxLength) : str;
                }
                const truncated = truncateString(item?.title, 50);
                return (
                  <div className="col-sm-3 mb-3" onClick={() => nextPage(item?.index)}>
                    <div className="block_blog">
                      <div className="articles_blog_bl">
                        <a className="thumb cursor-pointer">
                          <img src={item?.image} alt="nft blog" />
                        </a>
                        <h4>{truncated}...</h4>
                        <ul className="meta_date">
                          <li>{item?.category}</li>
                          {/* <li>|</li> */}
                          {/* <li>{moment(item.createdAt).format("YYYY-MM-DD")}</li> */}
                        </ul>

                      </div>
                    </div>

                  </div>
                )
              })}


            </div>

          </div>
        </section>


        <section>
          <div className="container">
            <div className="subscribe_form">
              <div className="row">

                <div className="col-sm-2">
                  <div className="email_icon">
                    <img src="/images/email_icon2.png" alt="email" />
                  </div>
                </div>

                <div className="col-sm-10">
                  <h4>Get The Latest News And Updates From CV Trade </h4>

                  {/* <form>
                    <input type="text" placeholder="Enter your Email address"></input>
                    <button className="submit_btn">Subscribe</button>
                  </form> */}


                </div>

              </div>
            </div>

          </div>
        </section>




        {/* <section className="pt-120 pb-90 blog_list">
        <div className="container">
          <div className="row" >

            <div className="col-xl-8 col-lg-8 " >
              <div className="row">
                {blogContent?.length > 0 ? blogContent?.map((item, index) => {

                  return (
                    <div key={index} className="col-xl-6 col-lg-12 mb-5" onClick={() => { nextPage(item?.index) }}>
                      <div className="single-blog h-100">
                        <a  className="thumb  cursor-pointer">
                          <img src={item?.image} alt="nft blog" />
                        </a>
                        <div className="content">
                          <ul className="meta">
                          </ul>
                          <h4 className="title"><h4>{item?.title}</h4>
                            <small>
                              {item?.description}
                            </small>
                          </h4>
                        </div>
                      </div>
                    </div>
                  )
                }) : <p className="text-center no-data h-100 mb-0" >
                  <img src="/images/no-data.png" className='img-fluid mb-2' alt="no data" width="52" />
                  No blog found
                </p>}
              </div>
            </div>

            <div className="col-xl-4 col-lg-4 " >
              <aside className="sidebar">
                <div className="single-widget recent-post mt-5 ">
                  <h3 className="title">Trending</h3>
                  <div className="inner">
                    <ul className="list_with_img"  >
                      {blogs?.map((item, index) => {
                        return (
                          <li key={index} className="d-flex mt-3 justify-content-between align-items-start" onClick={() => { nextPage(item?.index) }} >
                            <div>
                              <a className="d-block mt-0 cursor-pointer" >{item?.title} </a>
                            </div>
                            <img src="/images/authors/1.jpg" className="img-fluid" width="70" />
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>

              </aside>
            </div>
          </div>
        </div>
      </section> */}
      </div>
    </>
  );
};

export default BlogList;
