import React, {useState} from 'react';

const useOnboardingSwiper = () => {
  const [phoneNumber, setPhoneNumber] = useState();
  const [name, setName] = useState();
  const [scrolling, setScrolling] = useState(false);

  const validatePhoneNumber = val => {
    setPhoneNumber(val);
  };

  return {
    phoneNumber,
    validatePhoneNumber,
    name,
    setName,
    setScrolling,
    scrolling,
  };
};

export default useOnboardingSwiper;
