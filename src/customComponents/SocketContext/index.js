import React, { createContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client';
import { ApiConfig } from '../../api/apiConfig/apiConfig';

export const SocketContext = createContext();

const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connectSocket = () => {
    const newSocket = io(`${ApiConfig?.webSocketUrl}`, {
      transports: ['websocket'],
      upgrade: false,
      rejectUnauthorized: false,
      reconnection: false, // we handle reconnection manually
      timeout: 20000, // 20 second connection timeout
    });

    newSocket.on('connect', () => {
      reconnectAttempts.current = 0;
    });

    newSocket.on('disconnect', () => {
      attemptReconnect();
    });

    newSocket.on('connect_error', () => {
      attemptReconnect();
    });

    newSocket.on('error', () => {
      // Silent error handling
    });

    setSocket(newSocket);
    return newSocket;
  };

  const attemptReconnect = () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      return;
    }

    const delay = Math.min(2000 * reconnectAttempts.current, 10000); // exponential backoff
    reconnectAttempts.current += 1;

    setTimeout(() => {
      const reconnectedSocket = connectSocket();
      setSocket(reconnectedSocket);
    }, delay);
  };

  useEffect(() => {
    const activeSocket = connectSocket();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (!activeSocket.connected) {
          attemptReconnect();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      activeSocket.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // All your slider settings
  const settings = {
    centerMode: true,
    centerPadding: "30px",
    dots: false,
    infinite: true,
    autoplay: true,
    speed: 4000,
    autoplaySpeed: 0,
    arrows: false,
    cssEase: "linear",
    slidesToShow: 6,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 768, settings: { centerPadding: '2px', slidesToShow: 3, slidesToScroll: 'auto' } },
      { breakpoint: 1199, settings: { slidesToShow: 4, slidesToScroll: 'auto' } },
    ],
  };

  const settingstwo = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 600,
    autoplaySpeed: 2000,
    arrows: false,
    slidesToShow: 3,
    slidesToScroll: 3,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 3, dots: true } },
      { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 2, initialSlide: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 2, slidesToScroll: 2 } },
    ]
  };

  const Sliderpartners = {
    dots: false,
    infinite: true,
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,
    speed: 600,
    autoplaySpeed: 2000,
    arrows: false,
    responsive: [
      { breakpoint: 768, settings: { slidesToShow: 4, slidesToScroll: 1 } },
      { breakpoint: 480, settings: { slidesToShow: 2, slidesToScroll: 1 } },
    ],
  };

  const Sliderpartners2 = {
    dots: false,
    infinite: true,
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    arrows: false,
    speed: 8000,
    pauseOnHover: false,
    cssEase: "linear",
    rtl: true,
    responsive: [
      { breakpoint: 768, settings: { slidesToShow: 4, slidesToScroll: 1 } },
      { breakpoint: 480, settings: { slidesToShow: 2, slidesToScroll: 1 } },
    ],
  };

  return (
    <SocketContext.Provider value={{ socket, settings, Sliderpartners, Sliderpartners2, settingstwo }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContextProvider;
