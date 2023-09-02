/* Import des bibliothèques nécessaires */
const express = require('express');
const axios = require('axios');
const fs = require('fs');

/* Initialisation de l'application Express */
const app = express();

/* Définition de l'emplacement des fichiers statiques (css, images, etc.) */
app.use(express.static(__dirname + '/public'));

/* Configuration pour traiter les données envoyées par le client */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Configuration du moteur de rendu des vues */
app.set('view engine', 'ejs');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

/* Identification client pour l'accès à l'API Spotify */
const clientId = config.clientId;
const clientSecret = config.clientSecret;

/* Récupération du jeton d'accès à l'API */
let accessToken;

async function getAccessToken() {
  /* Encodage des identifiants client */
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  /* Tentative de récupération du jeton d'accès */
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
  
    /* Renvoi du jeton d'accès */
    return response.data.access_token;
  } catch (error) {
    /* En cas d'erreur, affichage de l'erreur dans la console */
    console.error(error);
    return error;
  }
}

/* Récupération du jeton d'accès */
getAccessToken().then(token => {
  accessToken = token;
});

/* ID de la playlist à parcourir */
//le caca de noé: 4YMz7Vl9H9vPvU1lJe0G2v
let playlistId = '37i9dQZF1DX7iB3RCnBnN4';

/* Variables pour stocker les informations sur les morceaux */
let nombreMorceaux = 0;
let cpt = 0;
let resultat = [];
let bool = true;
/*On defini les variables ici car on les reutilise dans plusieurs appels*/
let nomArtiste;
let nomAlbum
let cover;
let nomTrack;
let preview;
let genres;
let boolResults = true;
let results = [];

app.get('/', async (req, res) => {
  try{
    /*---------- Etape 1: On charge l'ensemble des morceaux de la playlist dans un tableau ---------*/
    /*Dans un premier temps on enregistre le nombre de morceaux de la playlist*/
    axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    .then(async (response) => {
      if(bool) {

        const playlist = response.data;
        const totalTracks = playlist.tracks.total;
        console.log(`La playlist contient ${totalTracks} morceaux.`);
        /*Puis on stocke les morceaux dans le tableau resultat*/
        /*L'ensemble des manipulations sont notamment du au fait que l'api de spotify permet d'envoyer max 100 morceaux a la fois
        Pour cela on incremente l'offset a 0 à nombre total de morceaux - 100*/
        //On cree une variable temp que l'on va decrementer
        let totalTracksTemp = totalTracks;
        //On prends en compte que l'offset commence a 0 et non a 100
        let totalTracksWhile = totalTracks - 100;
        //On verifie que le nombre de morceaux traités (offset en cours) est inferieux au nombre de morceaux - 100
        while ((nombreMorceaux <= totalTracksWhile) && (bool)) {
          //On appel l'api spotify pour avoir les 100 morceaux a partir de l'offset
          const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${nombreMorceaux}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          //On stock le resultat
          const playlist = response.data;
          /*Dans notre cas on s'interesse uniquement au morceaux avec une preview hors tous les morceaux spotify n'ont pas cette preview
          Pour cela on parcours tous les morceaux et s'il ont une preview alors on stock le morceaux dans resultat*/
          for (let i = 0; i < 100; i++) {
            const titre = playlist['items'][i]['track'];
            const verifPreview = titre['preview_url'];
            //On verifie qu'il y a bien une preview
            if (verifPreview != null) {
              resultat.push(titre);
            }
          }
          console.log("totalTrackTemp = "+totalTracksTemp);
          console.log("nombreMorceaux = "+nombreMorceaux);
          /*Alors la c'est un peu technique*/
          /*En gros tant que il reste encore plus de 100 morceaux a traités on va dans le else
          Dans le else: 
            - on incremente le nombre de morceaux traités de 100
            - on decremente le nombre de morceaux restant de 100
          S'il y a moins de 100 morceaux: 
            - On verifie qu'il reste moins de 100 morceaux
            - Et on rajoute sur le nombre de morceaux traités le reste (le mod de 100 du coup)*/
          if (((totalTracksTemp / 100)-1 < 1) && ((totalTracksTemp / 100)-1 > 0)) {
            nombreMorceaux += totalTracks % 100;
          } else {
            nombreMorceaux += 100;
            totalTracksTemp -= 100;
          }
        }
      }
      
      /*On passe le bool a false car il faut traités tous ce qu'une seule fois*/
      bool = false;
      
      /*------- Etape 2: On choisit un artiste au hasard dans le tableau---------*/
      cpt = resultat.length; //taille
      let chiffreRand = Math.floor(Math.random() * cpt); //nbre Random entre 0 et taille
      //On rentre les infos de la musique
      nomArtiste = resultat[chiffreRand]['artists'][0]['name'];
      cover = resultat[chiffreRand]['album']['images'][1]['url'];
      preview = resultat[chiffreRand]['preview_url'];
      nomTrack = resultat[chiffreRand]['name'];
      nomAlbum = resultat[chiffreRand]['album']['name'];
      //Pour le genre on a besoin de partir de l'artiste
      const artiste = await axios.get(`https://api.spotify.com/v1/search?q=${nomArtiste}&type=artist`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      genres = artiste['data']['artists']['items'][0]['genres'];
      //On envoie tous ces infos sur l'index.ejs
      res.render('index', {nomArtiste, cover, preview, nomTrack, nomAlbum, genres});
      boolResults = true;

      /*--------- Etape 3: verification des resultat de la saisie de l'utilisateur ---------*/
      app.post('/checkAnswers', (req, res) => {

        if(boolResults) {
          results = [];
          boolResults = false;
        }

        const nomTrackL = req.body.nomTrack;
        const nomArtisteL = req.body.nomArtiste;
        const genresL = req.body.genres;
        const nomTrackS= req.body.nomTrackSys;
        const nomArtisteS = req.body.nomArtisteSys;
        const genreChaine = req.body.genreSys;
        const coverS = req.body.coverSys;        
        let genreTableau = genreChaine.split(',');
        results.push({ artiste: nomArtisteL, color: nomArtisteL === nomArtisteS ? 'green' : 'red' });
        results.push({ track: nomTrackL, color: nomTrackL.toLowerCase() === nomTrackS.toLowerCase() ? 'green' : 'red' });
        results.push({ genre: genresL, color: genreTableau.includes(genresL) ? 'green' : 'red' });
        res.render('index', { results, nomArtiste, cover, preview, nomTrack,nomAlbum, genres, nomTrackS, nomArtisteS, genreChaine, coverS});

      });
    })
    .catch(error => {
      console.error('Une erreur s\'est produite lors de la récupération des informations de la playlist:', error);
    });

    
  }catch(error){
      console.log(error)
  }
});



/*------------ Ensemble des fonctions pour avoir les suggestions -----------*/
/*Artistes*/
app.get('/searchArtiste', async (req, res) => {
    const query = req.query.q;
    if (!query) {
      return res.status(400).send({ error: 'Aucun terme de recherche n\'a été fourni' });
    }
    const response = await axios.get(`https://api.spotify.com/v1/search?q=${query}&type=artist`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    res.send(response.data.artists.items);
  });

/*Morceaux*/
app.get('/searchTracks', async (req, res) => {
  const query = req.query.q;
  if (!query) {
      return res.status(400).send({ error: 'Aucun terme de recherche n\'a été fourni' });
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
  //On utilise pas l'api spotify cette fois mais le fichier genre.json qui contient tous les genre dispo sur spotify
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

/*Fontion pour extraire la partie qui nous interesse dans l'url */
function extractPlaylistIdFromLink(link) {
  const regex = /^https:\/\/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)\?.*$/;
  const match = link.match(regex);
  
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}


/*Pour changer la playlist*/
app.post('/changePlaylist', async (req, res) => {
  const newPlaylistId = req.body.playlistId;

  // Vérification de la validité du lien de playlist
  if (!newPlaylistId) {
    return res.status(400).send({ error: 'lien de playlist invalide' });
  }

  // Mise à jour de l'ID de la playlist
  playlistId = extractPlaylistIdFromLink(newPlaylistId);
  /*On reset les variables*/
  nombreMorceaux = 0;
  resultat = [];
  bool = true;
  /*On renvoie vers la page principal avec la nouvelle playlist*/
  res.redirect('/');

});

/* ------------- Enfin: On lance le serveur -----------*/
app.listen(3000, () => {
    console.log("Server started on port 3000");
});
