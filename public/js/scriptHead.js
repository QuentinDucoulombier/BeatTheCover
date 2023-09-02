// Fonction pour ajouter la suggestion à l'input en cliquant sur une suggestion
function addSuggestion(inputId, suggestion) {
  const input = document.getElementById(inputId);
  input.value = suggestion;
}

function resetCpt() {
  cpt = 0;
  localStorage.setItem('cpt', cpt);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function reset() {
  window.location = ".";
  resetCpt();
}

function incrementeCpt() {
  cpt ++;
  console.log(cpt);
  localStorage.setItem('cpt', cpt);
  if(cpt > 5) {
    //TODO: regarder pouquoi cette merde ne marche pas
    gameOver();
  }
}

async function congratulation() {
  Swal.fire({
    icon: 'success',
    title: 'Félicitations !',
    text: 'Vous avez trouvé le bon résultat.',
    confirmButtonColor: '#1db954'
  });
  await sleep(1000);
  reset()
}


//TODO: debug cette merde
async function gameOver() {
  return new Promise((resolve) => {
    Swal.fire({
      icon: 'error',
      title: 'Échec',
      text: 'Vous avez dépassé le nombre d\'essais',
      confirmButtonColor: '#1db954',
      confirmButtonText: 'OK',
    }).then((result) => {
      if (result.isConfirmed) {    
        resolve(); // Résoudre la promesse lorsque l'utilisateur clique sur "OK"
      }
    });
  }).then(() => {
    reset(); // Appel à la fonction reset après la résolution de la promesse
  });
}

//window.addEventListener('beforeunload', reset);
          