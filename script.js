document.addEventListener("DOMContentLoaded", function () {
    const typedElement = document.querySelector('.typed');
    const typedItems = typedElement.getAttribute('data-typed-items').split(',');
    let currentItemIndex = 0;
    let currentText = typedItems[currentItemIndex];
  
    function typeText() {
      if (currentText.length > 0) {
        typedElement.textContent += currentText.charAt(0);
        currentText = currentText.substring(1);
        setTimeout(typeText, 100); // Adjust the typing speed as needed
      } else {
        setTimeout(eraseText, 1000); // Wait for a moment before erasing
      }
    }
  
    function eraseText() {
      if (typedElement.textContent.length > 0) {
        typedElement.textContent = typedElement.textContent.slice(0, -1);
        setTimeout(eraseText, 50); // Adjust the erasing speed as needed
      } else {
        currentItemIndex = (currentItemIndex + 1) % typedItems.length;
        currentText = typedItems[currentItemIndex];
        setTimeout(typeText, 100); // Wait before typing the next item
      }
    }
  
    // Start the typing animation
    typeText();
    window.setTimeout(document.querySelector('svg').classList.add('animated'),1000);


  const btnScrollToTop =document.querySelector("#btnscrolltotop");

    btnScrollToTop.addEventListener('click',function(){
      window.scrollTo(0,0);
          
  });
  document.getElementById("downloadResume").addEventListener("click", function() {
    const resumeURL = './artifacts/AKSHAY_Resume.pdf';
    const resumeName = 'AKSHAY_Resume';
    window.open(resumeURL, '_blank', `title=${resumeName}`);
  });
  });
  
