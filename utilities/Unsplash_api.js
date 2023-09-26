// unsplash-api.js
const axios = require('axios');


// access key should be in.env folder for security reason
const unsplashAccessKey =process.env.UNPLASH_API_URI;


async function getRandomImages(query) {
  try {
    const apiUrl = `https://api.unsplash.com/search/photos?query=${query}&client_id=${unsplashAccessKey}`;
    const response = await axios.get(apiUrl);
    return response.data.results;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getRandomImages
}