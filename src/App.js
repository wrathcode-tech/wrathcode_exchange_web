import './App.css';
import Routing from './Routing'
import Loading from './customComponents/Loading';
import LoaderHelper from './customComponents/Loading/LoaderHelper';
import { ProfileProvider } from './context/ProfileProvider';
import { ToastContainer } from 'react-toastify';
import SocketContextProvider from './customComponents/SocketContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
function App() {
  return (

    <GoogleOAuthProvider clientId="181209853085-4biots3iul9k7ag9qudhirgj3olapj4n.apps.googleusercontent.com">

      <ProfileProvider>
        <SocketContextProvider>
          <Routing />
          <Loading ref={ref => LoaderHelper.setLoader(ref)} />
        </SocketContextProvider>
        <ToastContainer />
      </ProfileProvider>

    </GoogleOAuthProvider>


  )
};

export default App;