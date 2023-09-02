/* Import necessary libraries */
const express = require('express');
const axios = require('axios');
const fs = require('fs');

/* Initialize the Express application */
const app = express();

/* Define the location of static files (css, images, etc.) */
app.use(express.static(__dirname + '/public'));

/* Configuration to handle data sent by the client */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Configuration of the view rendering engine */
app.set('view engine', 'ejs');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

/* Client identification for accessing the Spotify API */
const clientId = config.clientId;
const clientSecret = config.clientSecret;

/* Retrieve the access token for the API */
let accessToken;

async function getAccessToken() {
  /* Encode client credentials */
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  /* Attempt to retrieve the access token */
  try {
    const response = await axios({
      url: 'https://accounts.spotify.com/api/token',
      method: 'post',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: 'grant_type=client_credentials',
    });
  
    /* Return the access token */
    return response.data.access_token;
  } catch (error) {
    /* In case of an error, display the error in the console */
    console.error(error);
    return error;
  }
}

/* Retrieve the access token */
getAccessToken().then(token => {
  accessToken = token;
});

/* ID of the playlist to traverse */
// Noah's poop: 4YMz7Vl9H9vPvU1lJe0G2v
let playlistId = '37i9dQZF1DX7iB3RCnBnN4';

/* Variables to store information about the tracks */
let numberOfTracks = 0;
let count = 0;
let result = [];
let bool = true;
/* Define variables here because they are reused in multiple calls */
let artistName;
let albumName;
let cover;
let trackName;
let preview;
let genres;
let boolResults = true;
let results = [];

app.get('/', async (req, res) => {
  try{
    /*---------- Step 1: Load all the tracks from the playlist into an array ---------*/
    /*First, record the number of tracks in the playlist*/
    axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    .then(async (response) => {
      if(bool) {

        const playlist = response.data;
        const totalTracks = playlist.tracks.total;
        console.log(`The playlist contains ${totalTracks} tracks.`);
        /*Then store the tracks in the result array*/
        /*All these manipulations are mainly due to the fact that the Spotify API allows sending a maximum of 100 tracks at a time
        To do this, we increment the offset from 0 to the total number of tracks - 100 */
        //Create a temporary variable to decrement
        let totalTracksTemp = totalTracks;
        //Take into account that the offset starts at 0 and not 100
        let totalTracksWhile = totalTracks - 100;
        //Check if the number of processed tracks (current offset) is less than the number of tracks - 100
        while ((numberOfTracks <= totalTracksWhile) && (bool)) {
          //Call the Spotify API to get the 100 tracks starting from the offset
          const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${numberOfTracks}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          //Store the result
          const playlist = response.data;
          /*In our case, we are only interested in tracks with a preview, but not all Spotify tracks have this preview
          So, we loop through all the tracks, and if they have a preview, we store the track in the result array*/
          for (let i = 0; i < 100; i++) {
            const track = playlist['items'][i]['track'];
            const verifyPreview = track['preview_url'];
            //Check if there is a preview
            if (verifyPreview != null) {
              result.push(track);
            }
          }
          console.log("totalTracksTemp = "+totalTracksTemp);
          console.log("numberOfTracks = "+numberOfTracks);
          /*Now this is a bit technical*/
          /*Basically, as long as there are still more than 100 tracks to be processed, we go into the 'else' part
          In the 'else' part:
            - we increment the number of processed tracks by 100
            - we decrement the remaining number of tracks by 100
          If there are less than 100 tracks left:
            - We check if there are fewer than 100 tracks left
            - And we add the remainder (the modulo 100) to the number of processed tracks*/
          if (((totalTracksTemp / 100)-1 < 1) && ((totalTracksTemp / 100)-1 > 0)) {
            numberOfTracks += totalTracks % 100;
          } else {
            numberOfTracks += 100;
            totalTracksTemp -= 100;
          }
        }
      }
      
      /*Set bool to false because it needs to be processed only once*/
      bool = false;
      
      /*------- Step 2: Choose a random artist from the array ---------*/
      count = result.length; //size
      let randomNumber = Math.floor(Math.random() * count); //random number between 0 and size
      //Enter the music information
      artistName = result[randomNumber]['artists'][0]['name'];
      cover = result[randomNumber]['album']['images'][1]['url'];
      preview = result[randomNumber]['preview_url'];
      trackName = result[randomNumber]['name'];
      albumName = result[randomNumber]['album']['name'];
      //For the genre, we need to start from the artist
      const artist = await axios.get(`https://api.spotify.com/v1/search?q=${artistName}&type=artist`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      genres = artist['data']['artists']['items'][0]['genres'];
      //Send all this information to index.ejs
      res.render('index', {artistName, cover, preview, trackName, albumName, genres});
      boolResults = true;

      /*--------- Step 3: Check the user's input results ---------*/
      app.post('/checkAnswers', (req, res) => {

        if(boolResults) {
          results = [];
          boolResults = false;
        }

        const trackNameL = req.body.trackName;
        const artistNameL = req.body.artistName;
        const genresL = req.body.genres;
        const trackNameS= req.body.trackNameSys;
        const artistNameS = req.body.artistNameSys;
        const genreString = req.body.genreSys;
        const coverS = req.body.coverSys;        
        let genreArray = genreString.split(',');
        results.push({ artist: artistNameL, color: artistNameL === artistNameS ? 'green' : 'red' });
        results.push({ track: trackNameL, color: trackNameL.toLowerCase() === trackNameS.toLowerCase() ? 'green' : 'red' });
        results.push({ genre: genresL, color: genreArray.includes(genresL) ? 'green' : 'red' });
        res.render('index', { results, artistName, cover, preview, trackName, albumName, genres, trackNameS, artistNameS, genreString, coverS});

      });
    })
    .catch(error => {
      console.error('An error occurred while retrieving playlist information:', error);
    });

    
  }catch(error){
      console.log(error)
  }
});



/*------------ Set of functions to get suggestions -----------*/
/*Artists*/
app.get('/searchArtist', async (req, res) => {
    const query = req.query.q;
    if (!query) {
      return res.status(400).send({ error: 'No search term provided' });
    }
    const response = await axios.get(`https://api.spotify.com/v1/search?q=${query}&type=artist`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    res.send(response.data.artists.items);
  });

/*Tracks*/
app.get('/searchTracks', async (req, res) => {
  const query = req.query.q;
  if (!query) {
      return res.status(400).send({ error: 'No search term provided' });
  }
  const response = await axios.get(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  res.send(response.data.tracks.items);
});


/*Genre*/
app.get('/searchGenre', async (req, res) => {
  const query = req.query.q;
  //This time we don't use the Spotify API, but the genre.json file which contains all the genres available on Spotify
  fs.readFile('genre.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }

    try {
      const genreData = JSON.parse(data);
      const suggestions = genreData.genres.filter(genre => genre.toLowerCase().startsWith(query.toLowerCase()));
      res.send(suggestions);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });
});

/*Function to extract the relevant part from the URL*/
function extractPlaylistIdFromLink(link) {
  const regex = /^https:\/\/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)\?.*$/;
  const match = link.match(regex);
  
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}


/*To change the playlist*/
app.post('/changePlaylist', async (req, res) => {
  const newPlaylistId = req.body.playlistId;

  // Check the validity of the playlist link
  if (!newPlaylistId) {
    return res.status(400).send({ error: 'Invalid playlist link' });
  }

  // Update the playlist ID
  playlistId = extractPlaylistIdFromLink(newPlaylistId);
  /*Reset variables*/
  numberOfTracks = 0;
  result = [];
  bool = true;
  /*Redirect to the main page with the new playlist*/
  res.redirect('/');

});

/* ------------- Finally: Start the server -----------*/
app.listen(3000, () => {
    console.log("Server started on port 3000");
});
