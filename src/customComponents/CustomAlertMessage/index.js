import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function alertErrorMessage(message) {
  toast.error(message ? message?.toUpperCase() :'Network Error...Please try again later', {
    position: toast.POSITION.TOP_CENTER
  });
}

function alertSuccessMessage(message) {
  toast.success(message ? message?.toUpperCase() : 'Success', {
    position: toast.POSITION.TOP_CENTER
  });
}

function alertInfoMessage(message) {
  toast.info(message, {
    position: toast.POSITION.TOP_CENTER
  });
}

// function alertwWarningMessage(message) {
//   toast.warning(message, {
//     position: toast.POSITION.BOTTOM_LEFT
//   });
// }

function alertWarningMessage(message) {
  toast.info(message ? message?.toUpperCase() :'Oops...Something went wrong',  {
    position: toast.POSITION.TOP_CENTER
  });
}

export { alertErrorMessage, alertSuccessMessage, alertWarningMessage };

