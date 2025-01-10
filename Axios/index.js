// https://api.thecatapi.com/v1/images/search?breed_ids=${breedId}&limit=6

import * as Carousel from "./Carousel.js";
//import axios from "axios";

//**************************************** */
const breedName = document.querySelector(".breedName");
const breedOrigin = document.querySelector(".breedOrigin");
const breedDescription = document.querySelector(".breedDescription");

//**************************************** */


// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Step 0: Store your API key here for reference and easy access.
const API_KEY = "live_q8HmQ0SZvNU87ZUOLH7qpCZUaeuvuugpwoDE6FOWYId8ivtt2FoSlFClXrQzT1XB";
const API_BASE_URL = 'https://api.thecatapi.com/v1';
//***************************************************************** */

window.addEventListener("load", initialLoad);

async function initialLoad(){
  console.log("Axios initialLoad...");  
  progressBar.style.width = '0%';
  axiosInitiation();  
  const breedData = await getAPIBreedsList();
  fillBreedList(breedData);
}

async function fillBreedList(breedData){
  console.log('Fill Breed List...');
  let option = document.createElement("option");
  option.value = -1;
  option.text = '';    
  breedSelect.appendChild(option);
  if(breedData)
    {
          for(let i=0 ; i< breedData.length ; i++)
            {
              
              let option = document.createElement("option");
              option.value = breedData[i].id;
              option.text = breedData[i].name;    
              breedSelect.appendChild(option);
              
              
            } 
            console.log("Breed Select Element:", breedSelect);
    }
}
//*********************************************************/
function updateProgress(event) {
  console.log(event); 
  if (event.lengthComputable) {
      const percentCompleted = (event.loaded / event.total) * 100;
      progressBar.style.width = `${percentCompleted}%`;
  }
}
//********************************************************/

async function axiosInitiation(){
  axios.defaults.baseURL = API_BASE_URL;
  axios.defaults.headers.common['x-api-key'] = `${API_KEY}`;
  axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
  
//Logging request Time
  axios.interceptors.request.use(request => {
    request.metadata = request.metadata || {};
    request.metadata.startTime = new Date().getTime();
    document.body.style.cursor = 'progress';
    progressBar.style.width = '0%';
    return request;
});

axios.interceptors.response.use(
    (response) => {
        response.config.metadata.endTime = new Date().getTime();
        response.config.metadata.durationInMS = response.config.metadata.endTime - response.config.metadata.startTime;

        console.log(`Request start time ${response.config.metadata.startTime}`);
        console.log(`Request end time ${response.config.metadata.endTime}`);
        console.log(`Request took ${response.config.metadata.durationInMS} milliseconds.`);
        document.body.style.cursor = 'default';
        progressBar.style.width = '100%';
        
        return response;
    },
    (error) => {
        error.config.metadata.endTime = new Date().getTime();
        error.config.metadata.durationInMS = error.config.metadata.endTime - error.config.metadata.startTime;

        console.log(`Request took ${error.config.metadata.durationInMS} milliseconds.`)
        // progressBar.style.width = '100%'; 
        throw error;
});
}
breedSelect.addEventListener("change",(event) =>{
  getAPIBreedByID(breedSelect.value).then(breed =>{
  
  if(breed){
    console.log(breed.name);
      createInformationDump(breed.name,breed.origin,breed.description);
  }
  else
  {
    alert("There is no information about " + breedSelect.value + ".");
  }
})
getAPIBreedImagesByID(breedSelect.value).then(breedImages =>{
  console.log(breedImages);
  Carousel.clear();
  for(let i = 0; i < breedImages.length; i++){
    //console.log(breedImages[i].id);
    addCarousel(breedImages[i].url,'',breedImages[i].id);
  }  
  Carousel.start();
  
})

});

function resetProgressBarAsync() {
  return new Promise(resolve => {
      setTimeout(() => {
          
          if (progressBar) {
              progressBar.style.width = '0%';
          }
          resolve();
      }, 1000);
  });
}

async function getAPIBreedsList(){
  try {
    const res = await axios.get(
      `/breeds?limit=100`,{
        onDownloadProgress: updateProgress,
    });
    const data = res.data;
    console.log(data);
    await resetProgressBarAsync();
    return data;
    
  } catch (err) {
    console.log('bad Request');
    return [];
  }

 }

 async function getAPIBreedByID(breedID){
  console.log(breedID);
try {
  const res = await axios.get(
    `/breeds/${breedID}`,{
      onDownloadProgress: updateProgress,
  });
  const data = res.data;
  console.log('AXIOS DATA =>'+ data);
  await resetProgressBarAsync();
  return data;
} catch (err) {
  console.log('bad Request');
  return [];
}
 }

 async function getAPIBreedImagesByID(breedID){
  console.log(breedID);

try {
  const res = await axios.get(
    `/images/search?limit=6&size=small&breed_ids=${breedID}`,{
      onDownloadProgress: updateProgress,
  });
    
  const data = res.data;
  console.log('AXIOS DATA =>'+ data);
  return data;
} catch (err) {
  console.log('bad Request');
  return [];
}
 }

 function addCarousel(imgSrc, imgAlt, imgId){
  
      let carouselItem = Carousel.createCarouselItem(imgSrc, imgAlt, imgId);
      console.log(carouselItem);
      let newCarousel = Carousel.appendCarousel(carouselItem);

}

function createInformationDump(name, origin, desc){


  // Clear the previous information.
  infoDump.innerHTML = "";
  
  // Create a new paragraph for each piece of information.
  const breedNameTxt = document.createElement("div");
  breedNameTxt.classList.add("breedName");
  breedNameTxt.textContent = `Breed: ${name}`;
  infoDump.appendChild(breedNameTxt);
  
  const breedOriginTxt = document.createElement("div");
  breedOriginTxt.classList.add("breedOrigin");
  breedOriginTxt.textContent = `Origin: ${origin}`;
  infoDump.appendChild(breedOriginTxt);
  
  const breedDescriptionTxt = document.createElement("p");
  breedDescriptionTxt.classList.add("breedDescription");
  breedDescriptionTxt.textContent = `Description: ${desc}`;
  infoDump.appendChild(breedDescriptionTxt);
}

getFavouritesBtn.addEventListener("click",()=> { 
  const breedData = getFavoritesBtn();
  console.log('Favorite Breed' + breedData);
  //const x =  fillBreedList()
}
);


async function addToFavorite(imageID,subID){
  
  try {
        const rawBody = 
        {
          image_id: imageID,
          sub_id: subID
        };

        console.log('Adding to favorite: ' + imageID);
        const response = await axios.post("/favourites",rawBody);
        console.log('Added to favourite:', response.data);
      } 
      catch (err) 
      {
                console.error('Error adding to favourite:',  err.message);
      }
}
 

async function getFavoritesBtn(){
  console.log('Get Favorites Images');
  try {
    //axiosInitiation();
    const res = await axios.get(`/favourites`,
       {headers :{
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY
                  }

      }
    );
    const data = res.data;
    console.log(data);
    return data;
  } catch (err) {
    console.log('bad Request');
    return [];
  }
}
/**
 * 1. Create an async function "initialLoad" that does the following:
 * - Retrieve a list of breeds from the cat API using fetch().
 * - Create new <options> for each of these breeds, and append them to breedSelect.
 *  - Each option should have a value attribute equal to the id of the breed.
 *  - Each option should display text equal to the name of the breed.
 * This function should execute immediately.
 */

/**
 * 2. Create an event handler for breedSelect that does the following:
 * - Retrieve information on the selected breed from the cat API using fetch().
 *  - Make sure your request is receiving multiple array items!
 *  - Check the API documentation if you're only getting a single object.
 * - For each object in the response array, create a new element for the carousel.
 *  - Append each of these new elements to the carousel.
 * - Use the other data you have been given to create an informational section within the infoDump element.
 *  - Be creative with how you create DOM elements and HTML.
 *  - Feel free to edit index.html and styles.css to suit your needs, but be careful!
 *  - Remember that functionality comes first, but user experience and design are important.
 * - Each new selection should clear, re-populate, and restart the Carousel.
 * - Add a call to this function to the end of your initialLoad function above to create the initial carousel.
 */

/**
 * 3. Fork your own sandbox, creating a new one named "JavaScript Axios Lab."
 */
/**
 * 4. Change all of your fetch() functions to axios!
 * - axios has already been imported for you within index.js.
 * - If you've done everything correctly up to this point, this should be simple.
 * - If it is not simple, take a moment to re-evaluate your original code.
 * - Hint: Axios has the ability to set default headers. Use this to your advantage
 *   by setting a default header with your API key so that you do not have to
 *   send it manually with all of your requests! You can also set a default base URL!
 */
/**
 * 5. Add axios interceptors to log the time between request and response to the console.
 * - Hint: you already have access to code that does this!
 * - Add a console.log statement to indicate when requests begin.
 * - As an added challenge, try to do this on your own without referencing the lesson material.
 */

/**
 * 6. Next, we'll create a progress bar to indicate the request is in progress.
 * - The progressBar element has already been created for you.
 *  - You need only to modify its "width" style property to align with the request progress.
 * - In your request interceptor, set the width of the progressBar element to 0%.
 *  - This is to reset the progress with each request.
 * - Research the axios onDownloadProgress config option.
 * - Create a function "updateProgress" that receives a ProgressEvent object.
 *  - Pass this function to the axios onDownloadProgress config option in your event handler.
 * - console.log your ProgressEvent object within updateProgess, and familiarize yourself with its structure.
 *  - Update the progress of the request using the properties you are given.
 * - Note that we are not downloading a lot of data, so onDownloadProgress will likely only fire
 *   once or twice per request to this API. This is still a concept worth familiarizing yourself
 *   with for future projects.
 */

/**
 * 7. As a final element of progress indication, add the following to your axios interceptors:
 * - In your request interceptor, set the body element's cursor style to "progress."
 * - In your response interceptor, remove the progress cursor style from the body element.
 */
/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 * - The skeleton of this function has already been created for you.
 * - This function is used within Carousel.js to add the event listener as items are created.
 *  - This is why we use the export keyword for this function.
 * - Post to the cat API's favourites endpoint with the given ID.
 * - The API documentation gives examples of this functionality using fetch(); use Axios!
 * - Add additional logic to this function such that if the image is already favourited,
 *   you delete that favourite using the API, giving this function "toggle" functionality.
 * - You can call this function by clicking on the heart at the top right of any image.
 */
export async function favourite(imgId) {
  // your code here
  addToFavorite(imgId,"mhobby-00109");
  // alert('Your favourite ' + imgId );
}

/**
 * 9. Test your favourite() function by creating a getFavourites() function.
 * - Use Axios to get all of your favourites from the cat API.
 * - Clear the carousel and display your favourites when the button is clicked.
 *  - You will have to bind this event listener to getFavouritesBtn yourself.
 *  - Hint: you already have all of the logic built for building a carousel.
 *    If that isn't in its own function, maybe it should be so you don't have to
 *    repeat yourself in this section.
 */

/**
 * 10. Test your site, thoroughly!
 * - What happens when you try to load the Malayan breed?
 *  - If this is working, good job! If not, look for the reason why and fix it!
 * - Test other breeds as well. Not every breed has the same data available, so
 *   your code should account for this.
 */
