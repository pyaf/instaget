
function toggleCardSelection(card){
    // console.log('Toggling card');
    var code = $(card).attr('id');
    if($(card).hasClass('active')){
        $(card).removeClass('active');
        $(card).children('div.ticks').children('i.fa-check').removeClass('active');
        selected_cards.splice( $.inArray(code, selected_cards), 1 );
        //removed link from selected_media
    }
    else{
        $(card).addClass('active');
        $(card).children('div.ticks').children('i.fa-check').addClass('active');
        selected_cards.push(code);
    }
    // console.log(selected_cards);
 }

function toggleAllCards(button, media_type){
    if($(button).hasClass('active')){
        // console.log('has class');
        // $(button).html('Select all ' + $(button).text().split(' ')[2]);
        $(button).removeClass('active');
        var was_active = true;
    }else{
        $(button).addClass('active');
        // $(button).html('Unselect all ' + $(button).text().split(' ')[2]);
        var was_active = false;
    }
    var cards = $('.card');
    for(var i=0; i<cards.length; i++){
        var type = $(cards[i]).attr('type');
        var selected = $(cards[i]).hasClass('active');
        // console.log(type, media_type, was_active, selected);
        if(type==media_type && (was_active == selected)){ // go crack it B) (made a truth table for that :P)
            toggleCardSelection(cards[i]);
        }
    }
}

$('#alertCloseButton').on('touchstart click', function(){
    $('.alert').hide();
    $('#error-msg').html('');
});


$('.selectAll').on('touchstart click', function(){
    // console.log('toggling');
    var type = $(this).attr('type');
    toggleAllCards($(this), type); // have to pass args to do like this
    return false;
    // this return false is very imp, otherwise you will get ghostclicks, as it will call 
    // click and touchstart event both. 
});

function logErr(error){
    $('#error-msg').html(error);
    $('.alert').show();
    $('#submit').removeAttr('disabled');
    $('#submit').html(gettext("Go"));
    return; 
}

$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip(); 
});

$(document).on('show.bs.tooltip', function (e) {
  setTimeout(function() {   //calls click event after a certain time
   $('[data-toggle="tooltip"]').tooltip('hide');
}, 5000);
});
