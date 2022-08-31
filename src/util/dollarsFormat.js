// jshint esversion: 9

const dollarsWhole = new Intl.NumberFormat("en-US", { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0, 
    minimumFractionDigits: 0, 
  });

  const dollarsDec = new Intl.NumberFormat("en-US", { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 2, 
    minimumFractionDigits: 0, 
  });

  export {dollarsWhole, dollarsDec};