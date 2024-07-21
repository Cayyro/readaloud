const axios = require('axios');

axios.get('https://api.github.com')
    .then(response => {
        console.log('Status:', response.status);
        console.log('Data:', response.data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
