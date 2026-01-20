import toast from 'react-hot-toast';

const toastStyle = {
  background: '#2d2d2d',
  color: '#e0e0e0',
  paddingRight: '32px',
};

const closeCss = {
cursor: 'pointer',
paddingLeft: '5px',
fontSize: '18px',
};

const toTitleCase = (str) => {
  if (!str) return str;
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};


function alertErrorMessage(message) {
  toast.error(
    (t) => (
      <>
      <span>
        {toTitleCase(message) || 'Network Error...Please Try Again Later'}
      </span>
       <span style={closeCss} onClick={() => toast.dismiss(t.id)}><i class="ri-close-circle-line"></i></span>
       </>
    ),
    { position: 'top-center', style: toastStyle }
  );
}

function alertSuccessMessage(message) {
  toast.success(
    (t) => (
      <> 
      <span >
        {toTitleCase(message) || 'Success'}
      </span>
        <span style={closeCss} onClick={() => toast.dismiss(t.id)}><i class="ri-close-circle-line"></i></span>
        </>
    ),
    { position: 'top-center', style: toastStyle }
  );
}

function alertWarningMessage(message) {
  toast(
    (t) => (
     <> <span >
        {toTitleCase(message) || 'Oops...Something Went Wrong'}
      </span>
       <span style={closeCss} onClick={() => toast.dismiss(t.id)}><i class="ri-close-circle-line"></i></span>
       </>
    ),
    { position: 'top-center', icon: '⚠️', style: toastStyle }
  );
}

export { alertErrorMessage, alertSuccessMessage, alertWarningMessage };

