'use strict';


// var Masonry = require('masonry-layout');
var Flickity = require('flickity');

// var ms_selector = document.querySelector('.ms-grid');
// var mason = new Masonry( ms_selector, {
//   // options
//   itemSelector: '.ms-grid-item',
//   columnWidth: 200
// });


var carousel = document.querySelector('.main-carousel');
var flick = new Flickity( carousel, {
    cellSelector: '.carousel-cell',
    cellPosition: 'center',
    setGallerySize: false,
    lazyLoad: 2,
    autoPlay: 3000,
    wrapAround: true,
    contain: true,
    draggable: false,
    pageDots: false,
    cellAlign: 'left',
    // prevNextButtons:false
});


carousel.addEventListener('mouseleave', function(e) {
    flick.playPlayer()
});
