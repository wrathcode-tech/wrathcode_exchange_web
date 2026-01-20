import './App.css';
import Routing from './Routing'
import Loading from './customComponents/Loading';
import LoaderHelper from './customComponents/Loading/LoaderHelper';
import { ProfileProvider } from './context/ProfileProvider';
import { Toaster } from 'react-hot-toast';
import SocketContextProvider from './customComponents/SocketContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
function App() {
  return (

    <GoogleOAuthProvider clientId="181209853085-4biots3iul9k7ag9qudhirgj3olapj4n.apps.googleusercontent.com">

      <ProfileProvider>
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 2500,
            style: {
              background: '#2d2d2d',
              color: '#e0e0e0',
              fontSize: '14px',
            },
          }}
          containerStyle={{
            top: 20,
            right: 20,
            zIndex: 99999999,
          }}
        />

        <SocketContextProvider>
          <Routing />
          <Loading ref={ref => LoaderHelper.setLoader(ref)} />
        </SocketContextProvider>
      </ProfileProvider>

    </GoogleOAuthProvider>


  )
};

export default App;