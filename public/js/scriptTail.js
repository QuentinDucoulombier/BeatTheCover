/*  Script des suggestions  */
const suggestions = document.getElementById('suggestions');
const artInput = document.getElementById('artist-search');
const trackInput = document.getElementById('track-search');
const genreInput = document.getElementById('genre-search');

function suggest(input)
{
  const suggestionElements = document.querySelectorAll('.suggestion');
  suggestionElements.forEach(suggestionElement => {
    suggestionElement.addEventListener('click', function() {
      input.value = this.getAttribute('data-value');
      suggestions.innerHTML = '';
    });
  });
}

artInput.addEventListener('input', async function() {
  const response = await fetch(`/searchArtiste?q=${this.value}`);
  const data = await response.json();

  suggestions.innerHTML = data.map(artist => `<div class="suggestion" data-value="${artist.name}">${artist.name}</div>`).join('');
  
  suggest(artInput);
  
});

trackInput.addEventListener('input', async function() {
  const response = await fetch(`/searchTracks?q=${this.value}`);
  const data = await response.json();

  suggestions.innerHTML = data.map(track => `<div class="suggestion" data-value="${track.name}">${track.name}</div>`).join('');

  suggest(trackInput);
});

genreInput.addEventListener('input', async function() {
  const response = await fetch(`/searchGenre?q=${this.value}`);
  const data = await response.json();

  suggestions.innerHTML = data.map(genre => `<div class="suggestion" data-value="${genre}">${genre}</div>`).join('');

  suggest(genreInput);
});
let cpt = 0;
if (localStorage.getItem('cpt') != null) { 
  cpt = parseInt(localStorage.getItem('cpt')); 
} 


/*script pour bloquer l'audio*/
let maxTime = 0;
switch (cpt) {
  case 0:
    document.getElementById('myAudio').style.display = 'none';
    break;
  case 1:
    maxTime = 5;
    break;
  case 2:
    maxTime = 10;
    break;
  case 3:
    maxTime = 20;
    break;
  case 5:
    gameOver();
  default:
    maxTime = 50;
    break;
}


const audioElement = document.getElementById('myAudio');

audioElement.addEventListener('timeupdate', function() {
  if (audioElement.currentTime >= maxTime) {
    audioElement.pause();
    audioElement.currentTime = 0;
  }
});
