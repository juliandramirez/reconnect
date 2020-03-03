import React, {useState, useEffect} from 'react';

const useOnboarding = nextPage => {
  const [tab, setTab] = useState(0);
  const [buttonText, setButtonText] = useState('Get Started');

  useEffect(() => {
    let text = 'Get Started';
    switch (tab) {
      case 0:
        text = 'Get Started';
        break;
      case 1:
      case 2:
        text = 'Next';
        break;
      case 3:
        text = 'Add Person';
        break;
      default:
        break;
    }
    setButtonText(text);
  }, [tab]);

  const onPress = () => {
    console.log('tab', tab);
    if (tab < 3) {
      setTab(tab + 1);
    } else {
      nextPage();
    }
  };

  const swiped = i => {
    // console.log('swiped', i);
    // if (tab !== i) {
    //   setTab(i);
    // }
  };

  return {
    tab,
    onPress,
    swiped,
    buttonText,
  };
};

export default useOnboarding;
