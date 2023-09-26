const { getRandomImages } = require('./Unsplash_api');

const query = 'watches'; // i want all the random watches

async function getRandomBannerImage() {
  try {
    const photos = await getRandomImages(query);
  
    // Select a random photo from the array  
    const randomIndex = Math.floor(Math.random() * photos.length);
    const randomPhoto = photos[randomIndex];
    // Display the URL of the random image
    console.log(`Random Banner Image: ${randomPhoto.urls.regular}`);

      return randomPhoto.urls.regular;

  } catch (error) {
    console.error('Error fetching images:', error.message);
  }
}



module.exports = getRandomBannerImage;