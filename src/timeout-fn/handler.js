module.exports = {
    main: async function (event, context) {
      let waitTime = 15000; //15sec 
      console.log(`Will wait ${waitTime}ms`);
      let promise = new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(`Hi! Resolved after ${waitTime}!`);
        }, waitTime)
      })
      
      return await promise;
    },
  };
  
  