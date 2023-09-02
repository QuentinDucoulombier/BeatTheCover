// Function to add a suggestion to the input by clicking on a suggestion
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
    gameOver();
  }
}

async function congratulation() {
  Swal.fire({
    icon: 'success',
    title: 'Congratulations!',
    text: 'You have found the correct result.',
    confirmButtonColor: '#1db954'
  });
  await sleep(1000);
  reset()
}

async function gameOver() {
  return new Promise((resolve) => {
    Swal.fire({
      icon: 'error',
      title: 'Failure',
      text: 'You have exceeded the number of attempts',
      confirmButtonColor: '#1db954',
      confirmButtonText: 'OK',
    }).then((result) => {
      if (result.isConfirmed) {    
        resolve(); // Resolve the promise when the user clicks "OK"
      }
    });
  }).then(() => {
    reset(); // Call the reset function after resolving the promise
  });
}
