async function changeBackgroundImages() {
    const images = await import('./images-folder/images.js');

    let currentImageIndex = 0;
    const backgroundElement = document.createElement('div');
    backgroundElement.classList.add('background');
    document.body.appendChild(backgroundElement);
    backgroundElement.style.backgroundImage = `url(${images[currentImageIndex]})`;

    function changeBackgroundImage() {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        backgroundElement.style.backgroundImage = `url(${images[currentImageIndex]})`;
    }

    setInterval(changeBackgroundImage, 5000); // Change image every 5 seconds
}

changeBackgroundImages();




