const images = [
    'landing/16.jpeg',
    'landing/17.jpeg',
    'landing/18.webp',
    'landing/19.jpg',
    'landing/20.webp', // Ajoutez autant d'images que nécessaire
];

let currentIndex = 0;

function changeBackgroundImage() {
    const backgroundDiv = document.getElementById('container');
    backgroundDiv.style.backgroundImage = `url('${images[currentIndex]}')`;
    currentIndex = (currentIndex + 1) % images.length; // Boucle au début
}

changeBackgroundImage(); // Changer d'image immédiatement
setInterval(changeBackgroundImage, 5000); // Changer d'image toutes les 10 secondes
$("#startGameButton").on("click", () => {
    window.location.href = "/Login.html"
})


