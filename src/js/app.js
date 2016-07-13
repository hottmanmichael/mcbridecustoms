'use strict';
var Flickity = require('flickity');
var Draggabilly = require('draggabilly');
var Packery = require('packery');
var Ajax = require('./global/ajax').Ajax;
// var Gallery = require('./admin-gallery');
var Notification = require('./global/notification');
var Modal = require('./global/modal');


var menuButton = document.querySelector('.mobile-menu.button');
var mobileMenu = document.querySelector('.mobile-menu.menu');
var menuItems = document.querySelectorAll('.menu-item');
    if (menuButton) {
        console.log("menuButton: ", menuButton);
        menuButton.addEventListener('click', function(e) {
            mobileMenu.classList.toggle('open');
        });
    }
    // if (menuItems) {
    //     for (var i = 0; i < menuItems.length; i++) {
    //         menuItems[i].addEventListener('click', function() {
    //             //close menu when item is clicked in menu
    //             console.log("menuItems: ", menuItems[i]);
    //             mobileMenu.classList.remove('open');
    //         });
    //     }
    // }



var ms_selector = document.querySelector('.ms-grid');
var mason;
var carousel = document.querySelector('.main-carousel');
var flick;

if (ms_selector) {
    initPackery();
}

if (carousel) {
    initFlickity();
}


function initPackery() {
    mason = new Packery( ms_selector, {
        itemSelector: '.ms-grid-item',
        columnWidth: 270,
        percentPosition: true,
        gutter: 20
    });

    var order = [];
    mason.getItemElements().forEach( function( itemElem ) {
        order.push(itemElem);
        var draggie = new Draggabilly( itemElem, {
          handle: '.handle'
        });
        mason.bindDraggabillyEvents( draggie );
    });

    mason.on( 'dragItemPositioned', function( draggedItem ) {
        order = [];
        mason.getItemElements().forEach( function( itemElem ) {
            order.push(itemElem);
        });
    });

    var save_order_button = document.getElementById('save-image-order');
        var save_btn_initial_html = save_order_button.innerHTML;
        console.log("save_btn_initial_html: ",save_btn_initial_html);
    if (save_order_button) {
        save_order_button.addEventListener('click', function(e) {
            e.preventDefault();
            save_order_button.innerHTML = '<i class="loading-spinner fa fa-spinner fa-pulse fa-3x fa-fw"></i>';
            var currOrder = {
                images: []
            };
            order.forEach(function(image, index) {
                var img = {
                    slug: image.id,
                    order: index
                };
                currOrder.images.push(img);
                console.log("image: ", image.id, index);
            });
            var path = window.location.href + '/edit/order';
            Ajax(path, currOrder, function(res) {
                if (res.status && res.status === 'success') {
                    save_order_button.innerHTML = '<i class="loading-spinner fa fa-check"></i>Saved';
                } else {
                    save_order_button.innerHTML = '<i class="loading-spinner fa fa-times"></i>Not Saved';
                }
                setTimeout(function() {
                    save_order_button.innerHTML = save_btn_initial_html;
                }, 1000);
            });
        });
    }

}


function initFlickity() {

    flick = new Flickity( carousel, {
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
        flick.playPlayer();
    });
}



var upload_new_button = document.getElementById('upload-new-button');
    if (upload_new_button) {
        upload_new_button.addEventListener('click', function(e) {
            upload_new_button.innerHTML = '<i class="loading-spinner fa fa-spinner fa-pulse fa-3x fa-fw"></i>';
        });
    }



var mobile_menu_button = document.getElementById('mobile-menu-icon');
    if (mobile_menu_button) {
        mobile_menu_button.addEventListener('click', function(e) {
            e.target.classList.toggle('open')
        });
    }



var add_to_featured_buttons = document.querySelectorAll('.add-to-featured');
var remove_from_featured_buttons = document.querySelectorAll('.remove-from-featured');
var delete_image_buttons = document.querySelectorAll('.delete-image');

console.log("delete_image_buttons: ", delete_image_buttons.length);


if (add_to_featured_buttons && add_to_featured_buttons.length > 0) {
    for (var i = 0; i < add_to_featured_buttons.length; i++) {
        add_to_featured_buttons[i].addEventListener('click', handleAddToFeatured);
    }
}
if (remove_from_featured_buttons && remove_from_featured_buttons.length > 0) {
    for (var i = 0; i < remove_from_featured_buttons.length; i++) {
        remove_from_featured_buttons[i].addEventListener('click', handleRemoveFromFeatured);
    }
}

if (delete_image_buttons.length > 0) {
    for (var i = 0; i < delete_image_buttons.length; i++) {
        delete_image_buttons[i].addEventListener('click', showDeleteImagePrompt);
    }
}

function addToCarousel(image) {
    var cell = document.createElement('div');
        cell.className = 'carousel-cell';
        cell.id = "cell-"+image.slug;
    var form = document.createElement('form');
        form.className = "remove-from-featured";
        // /admin/gallery/edit/isfeatured?slug=<%=image.slug%>&action=remove&_method=put
        form.action = "/admin/gallery/edit/isfeatured?slug="+image.slug+"&action=remove&_method=put";
        form.addEventListener('click', handleRemoveFromFeatured);
    var btn = document.createElement('button');
        btn.className = 'btn btn-danger btn-sm';
    var icon = document.createElement('i');
        icon.className = 'remove fa fa-minus-square';
    btn.appendChild(icon);
    var text = document.createTextNode('Remove From Featured');
        btn.appendChild(text);
    var img = image.tag;

    cell.innerHTML = img;
    form.appendChild(btn);
    cell.appendChild(form);

    console.log("cell", cell);

    flick.append(cell);

}

function removeFromCarousel(image) {
    var elem = document.getElementById('cell-'+image.slug);
    flick.remove(elem);
}

function handleRemoveFromFeatured(e) {
    e.preventDefault();
    var url = e.target.parentElement.action;
    var data = {};
    Ajax(url, data, function(res) {
        if (res.status === 'success') {
            removeFromCarousel(res);
        }
        new Notification(res.status, res.message, 3000);
    });
}


function handleAddToFeatured(e) {
    e.preventDefault();
    var url = e.target.parentElement.action;
    var data = {};
    Ajax(url, data, function(res) {
        if (res.status === 'success') {
            console.log("image: ", res);
            addToCarousel(res);
        }
        new Notification(res.status, res.message, 3000);
    });
}


function showDeleteImagePrompt(e) {
    e.preventDefault();
    var url = e.target.parentElement.action;
    var data = {};

    var modal;

    var div = document.createElement('div');
        div.className = "prompt";

    var prompt = document.createElement('h3');
        prompt.innerHTML = 'Are you sure you want to delete this image?';

    var cancel = document.createElement('button');
        cancel.className = "btn btn-primary btn-lg";
        cancel.innerHTML = 'Cancel';

    var del = document.createElement('button');
        del.className = 'btn btn-danger btn-lg';
        del.innerHTML = 'Delete';

    div.appendChild(prompt);
    div.appendChild(cancel);
    div.appendChild(del);

    modal = new Modal(div);
    modal.show();
    cancel.addEventListener('click', function(e) {
        modal.unmount();
    });
    del.addEventListener('click', function(e) {
        handleDeleteImage(url, data);
        modal.unmount();
    });
}


function handleDeleteImage(url, data) {
    Ajax(url, data, function(res) {
        if (res.status === 'success') {
            var ms_elem = document.getElementById('mason-'+res.slug);
            var fl_elem = document.getElementById('cell-'+res.slug);
            mason.remove(ms_elem);
            mason.layout();
            if (fl_elem) {
                flick.remove(fl_elem);
            }
        }
        new Notification(res.status, res.message, 3000);
    });
}

// function buildPrompt() {
//     var
// }



//EMAILER
var emailerForm = document.getElementById('emailer-form');
console.log("emailerForm: ", emailerForm);
    if (emailerForm) {
        emailerForm.addEventListener('submit', handleEmail);
    }

function handleEmail(e) {
    e.preventDefault();
    var url = e.target.action;
    var inputs = {
        name: document.getElementById('name'),
        email: document.getElementById('email'),
        subject: document.getElementById('subject'),
        message: document.querySelector('.contact-message')
    };
    var data = {
        name: inputs.name.value,
        email: inputs.email.value,
        subject: inputs.subject.value,
        message: inputs.message.value
    };
    Ajax(url, data, function(res) {
        console.log("res: ", res);
        if (res.status === 'success') {
            handleSuccessfulEmail(res.message, inputs);
        } else {
            new Notification('error', res.message, 5000);
        }
    });
}

function handleSuccessfulEmail(message, fields) {

    var modal;
    var div = document.createElement('div');
        div.className = "prompt";

    var name = document.createElement('h3');
        name.innerHTML = "Thank you, " + fields.name.value + "!";

    var prompt = document.createElement('h4');
        prompt.innerHTML = message;

    var goHome = document.createElement('a');
        goHome.href = "/";
        goHome.className = 'btn btn-info btn-lg';
        goHome.innerHTML = 'Go To Homepage';

    var goGallery = document.createElement('a');
        goGallery.href = "/gallery";
        goGallery.className = 'btn btn-info btn-lg';
        goGallery.innerHTML = 'Go To Gallery';

    div.appendChild(name);
    div.appendChild(prompt);
    div.appendChild(goHome);
    div.appendChild(goGallery);

    modal = new Modal(div);
    modal.show();

    //clear form fields
    for (var item in fields) {
        if (fields.hasOwnProperty(item)) {
            fields[item].value = null;
        }
    }
}
