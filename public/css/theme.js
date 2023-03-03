/**
 * Content carousel with extensive options to control behaviour and appearance
 * @requires https://github.com/ganlanyuan/tiny-slider
*/

const carousel = (() => {

  // forEach function
  let forEach = function (array, callback, scope) {
    for (let i = 0; i < array.length; i++) {
      callback.call(scope, i, array[i]); // passes back stuff we need
    }
  };

  // Carousel initialisation
  let carousels = document.querySelectorAll('.tns-carousel .tns-carousel-inner');
  console.log(carousels);
  forEach(carousels, function (index, value) {
    let defaults = {
      container: value,
      controlsText: ['<i class="ci-arrow-left"></i>', '<i class="ci-arrow-right"></i>'],
      navPosition: 'bottom',
      mouseDrag: true,
      speed: 500,
      autoplayHoverPause: true,
      autoplayButtonOutput: false,
      gutter:16
    };
    let userOptions;
    console.log(JSON.parse(value.dataset.carouselOptions));
    if(value.dataset.carouselOptions != undefined) userOptions = JSON.parse(value.dataset.carouselOptions);
    let options = Object.assign({}, defaults, userOptions);
    console.log(options);
    let carousel = tns(options);
  });
})();

/**
   * Animate scroll to top button in/off view
  */


 var scrollTopButton = function () {
  var element = document.querySelector('.btn-scroll-top'),
      scrollOffset = 600;
  if (element == null) return;
  var offsetFromTop = parseInt(scrollOffset, 10);
  window.addEventListener('scroll', function (e) {
    if (e.currentTarget.pageYOffset > offsetFromTop) {
      element.classList.add('show');
    } else {
      element.classList.remove('show');
    }
  });
}();
