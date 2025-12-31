
const notEqualsZero = value => {
  if (value) {
    if (value.length !== 0) return true;
    else return false;
  } else return false;
};

const email = value =>
  value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
    ? 'Invalid email address'
    : undefined;

const phoneNumber = value =>
  value && !/^[0-9]{10}$/i.test(value)
    ? 'Invalid mobile number'
    : undefined;





const validateEmail = text => {
  let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return reg.test(text) === false
    ? 'Please enter a valid email address'
    : undefined;
};

const validationText = value => {
  if (value && value.trim().length > 0) {
    return /[^a-zA-Z0-9 ]{3,30}$/i.test(value)
      ? 'Please fill the field'
      : undefined;
  } else {
    return 'Please fill the field';
  }
};
const phoneNumberValidation = value => {
  // if (value && value.length < 10) {
  //   if (value && value.length > 0) {
  //     return 'Maximum 10 numbers only';
  //   }
  return value && !/^[0-9]{8,12}$/.test(value)
    ? 'Contact No must be between 8-12 digit'
    : undefined;
  // } else {
  //   return undefined;
  // }
};

const numberValidation = value =>
  value && !/^[0-9]{1,3}$/.test(value) ? 'Maximum 3 character only' : undefined;


const isNumeric = value => {
  return /^[0-9]+$/.test(value) ? undefined : 'Please enter valid number';
};

const accountNumber = value => {
  return value && !/^[0-9]+$/.test(value)
    ? 'Please enter valid Account Number '
    : undefined;
};

const ifsccode = value => {
  return value && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)
    ? 'Please enter valid IFSC Code '
    : undefined;
};

const postCode = value => {
  return value && !/^.{4,6}$/.test(value)
    ? 'Please enter valid Pin Code '
    : undefined;
};

const panCardNum = value => {
  return value && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)
    ? 'Please enter valid Pan Card Number '
    : undefined;
};

const aadharNum = value => {
  return value && !/^[0-9]{4}[ -]?[0-9]{4}[ -]?[0-9]{4}$/.test(value)
    ? 'Please enter valid Aadhar Number '
    : undefined;
};
const passport = value => {
  return value && !/^.{4,16}$/.test(value)
    ? 'Please enter valid Passport Number '
    : undefined;
};

const validAccountno = value =>
  value && !/^[0-9]{7,16}$/.test(value)
    ? 'Please enter valid Account Number.'
    : undefined;

const validPassword = (value) =>
  value && !/^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})[a-zA-Z0-9!@#$%^&*]+$/.test(value)
    ? 'Password should contain at least one number, one special character, and be at least 8 characters long.'
    : undefined;

const matchPassword = (value, value1) =>
  value !== value1
    ? 'Password does not Match.'
    : value && value1 && undefined;

const validateNumber = value =>
  value && !/^[0-9]{0,10}$/i.test(value)
    ? <span style={{ color: 'red', fontWeight: '600' }}>Number should be min 10 character</span>
    : undefined;

const validatePanCard = value =>
  value && !/^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/i.test(value)
    ? 'Please enter valid pan card number'
    : undefined;

const matchPanCard = (value, value1) =>
  value !== value1
    ? 'Pancard Number does not Match.'
    : value && value1 && <span style={{ color: 'green' }}>PanCard Number Match</span>;

const matchCard = (value, value1) =>
  value !== value1
    ? 'DL/Passport Number does not Match.'
    : value && value1 && <span style={{ color: 'green' }}>DL/Passport Number Match</span>;

const validIfscCode = value =>
  value && !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(value)
    ? 'Please enter valid Ifsc Code Number'
    : undefined;

const drivingLicense = value => {
  return value && !/^(([A-Z]{2}[0-9]{2})( )|([A-Z]{2}[0-9]{2}))((19|20)[0-9][0-9])[0-9]{7}$/.test(value)
    ? 'Please enter valid Driving License Number '
    : undefined;
};

const documentNum = value => {
  return value && !/^.{4,16}$/.test(value)
    ? 'Please enter valid Document Number '
    : undefined;
};



const isGlobalEmailDomain = (email) => {
  const globalEmailDomains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "icloud.com",
  ];
  const emailDomain = email.split('@')[1]?.toLowerCase();
  return globalEmailDomains.includes(emailDomain);
};

export {
  passport,
  notEqualsZero,
  email,
  phoneNumber,
  validPassword,
  validationText,
  numberValidation,
  phoneNumberValidation,
  isNumeric,
  validateEmail,
  accountNumber,
  ifsccode,
  postCode,
  panCardNum,
  aadharNum,
  validAccountno,
  matchPassword,
  validateNumber,
  validatePanCard,
  matchPanCard,
  validIfscCode,
  drivingLicense,
  documentNum,
  matchCard,
  isGlobalEmailDomain,
};