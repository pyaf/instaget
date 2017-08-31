
var total_posts = {};
var requests = 0;
var max_id = null;
var username;
var selected_cards = []; // store selected cards
var card_data = {}; // key is card id i.e., shortcode, value is list of links of that card post


function embed(type, link, post){
    var date = new Date(post['taken_at'] * 1000);
    // var type = link.slice(-3);
    var html = `<div class="card" id="`+post['code']+`" type="`+type+`" "style="max-width: 20rem;" onclick="toggleCardSelection(this)" >`
    if(type == 'mp4'){
        html += `
        <video controls="controls" style="width:325px;">
        <source src="`+link+`" type="video/mp4" />
        </video>
        `
    }else{
        // console.log('type not mp4', post['type'], post)
        html += `<img class="card-img-top" src="`+post['image_versions2']['candidates'][1]['url']+`" alt="Card image cap">`;
    }
    html += `<div class="card-body">`;
    if(post['caption']!=null){
        html+= `<p class="card-text">`+ post['caption']['text']+`</p>`
        }
    html += `Created at `+ date.toLocaleString()+`
        </div>
        <div class="ticks">
            <i class="fa fa-check"></i>
        </div>
        </div>`
    $('#results').append(html);
}

function getUserStory(user_id){
    console.log("Getting user story.");
    $('#submit').attr('disabled','disabled');
    $('#submit').html("<img src='/static/ajax-loader.gif'> wait..");
    $.ajax({
        url: '/getUserStory/',
        type: 'POST',
        data: {'username': username,
                csrfmiddlewaretoken: csrf_token },
        success: function(data) {
            console.log("Success");
            console.log(data);
            if(data['status_code']==404){
                $('#error-msg').html('User not found!, please enter a valid username.');
                $('.alert').show();
                $('#submit').removeAttr('disabled');
                $('#submit').html("Get it!");
                return;
            }
            stories = data['stories']['items'];
            if(stories.length==0){
                $('#error-msg').html('User has not uploaded any Stories!');
                $('.alert').show();
            }else{
                
                for(var i in stories){
                    var links = [];
                    var type = 'jpg'; 
                    // console.log(posts[i]['type']);
                    if (stories[i]['media_type'] == 1){ // image story
                        link = stories[i]['image_versions2']['candidates'][0]['url'];
                    }else{
                        type = 'mp4';
                        link = stories[i]['video_versions'][0]['url'];
                    }
                    link = link.split('?')[0];   
                    card_data[stories[i]['code']] = link;
                    embed(type, link, stories[i]);
                }
                console.log("Done");
                $('#function-buttons').css('display','block');
            }
            //below 2 lines useful only for initial search
            $('#submit').removeAttr('disabled');
            $('#submit').html("Go");
        },
        error: function(request, status, error){
            console.log(request['status']);
            if(request['status']==500){
                $('#error-msg').html('Internal Server Error! please try after some time.');
            }
            $('.alert').show();
            $('#submit').removeAttr('disabled');
            $('#submit').html("Get it!");
        },
    });

}

$('#submit').click( function(e) {
    e.preventDefault();
    if(requests!=0){ // User is re-searching a new username, re-initialize every global var
        requests = 0;
        max_id = null;
        total_posts = {};
        selected_media = [];
        $('#results').html('');
        $('#function-buttons').css('display','none');
        $('#loadMoreButtonDiv').css('display','none'); 
        $('#progress-bar').html('0%');
        $('#progress-bar').css('width', '0%');
        $('#progress-bar').hide();
    }
    $('.alert').hide(); // there may be some initial alert, even though requests!=0
    username = $('#username').val();
    getUserStory(username);
    return;
});


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
 }

function toggleAllCards(button, media_type){
    // console.log($(button).text().split(' '));
    if($(button).hasClass('active')){
        
        $(button).html('Select all ' + $(button).text().split(' ')[2]);
        $(button).removeClass('active');
        var was_active = true;
    }else{
        $(button).addClass('active');
        $(button).html('Unselect all ' + $(button).text().split(' ')[2]);
        var was_active = false;
    }
    var cards = $('.card');
    for(var i=0; i<cards.length; i++){
        var type = $(cards[i]).attr('type');
        var selected = $(cards[i]).hasClass('active');
        if(type==media_type && (was_active == selected)){ // go crack it B) (made a truth table for that :P)
            toggleCardSelection(cards[i]);
        }
    }
}

function closeAlert(){
    $('.alert').hide();
    $('#error-msg').html('');
}





