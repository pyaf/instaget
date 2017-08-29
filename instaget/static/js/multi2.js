
var total_posts = {};
var requests = 0;
var max_id = null;
var username;
var selected_media = []; // store links of selected cards
var card_data = {}; // key is card id, value is links it contains (more than one in case of carousel)
var users_posts_dict = {}; // dict of dict, so as insertion, search and deltetion is of O(1) complexity


function embed(link, post){
    var date = new Date(post['created_time'] * 1000);
    // if(post['type']=='carousel')
    var type = link.slice(-3);
    var html = `<div class="card" link="`+link+`" type="`+type+`" "style="max-width: 20rem;"  >`
    if(type == 'mp4'){
        html += `
        <video controls="controls" style="width:364px;">
        <source src="`+link+`" type="video/mp4" />
        </video>
        `
    }else{
        html += `<img class="card-img-top" src="`+link+`" alt="Card image cap">`
    }
    html += `
        <div class="card-body">
            <span><i class="fa fa-heart"></i> `+post['likes']['count']+` likes </span>
            <span><i class="fa fa-comment"></i> `+post['comments']['count']+` comments</span>`
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

// Embed all posts using IG oembed endpoint
function IGembed(shortcode){
    post_link = 'https://instagram.com/p/' + shortcode;
    $.ajax({
        url: 'https://api.instagram.com/oembed/?url=' + post_link,
        type: 'GET',
        crossDomain: true,
        dataType:'jsonp',
        async: false,
        success: function(data) {
            console.log(data);
            if(users_posts_dict[data['author_name']] == undefined){
                users_posts_dict[data['author_name']] = {};
            }
            users_posts_dict[data['author_name']][shortcode] = 1;
            var html = `<div class="card" id="`+shortcode+`" style="max-width: 20rem;" onclick="toggleCardSelection(this)">`
                        + data['html']
                        +`<div class="ticks" title="Click to select">
                            <i class="fa fa-check"></i>
                        </div>
                    </div>`;
            $('#results').append(html);
            window.instgrm.Embeds.process() // Note: no semi colon
        },
        error: function(request, status, error){
          console.log(request['status']);
          if(request['status']==500){
            $('#error-msg').html('Internal Server Error! please try after some time.');
          }else{
          $('#error-msg').html('Post not found!, please enter a valid link.');
          }
          $('.alert').show();
        }

    });

}


function prepareCardData(){
    console.log('Preparing card data, calling ajax');
    console.log(users_posts_dict);
    jQuery.ajax({
        // async: false,
        url: '/getMultiPosts/',
        type: 'POST',
        data: {'users_posts_dict': JSON.stringify(users_posts_dict),
                csrfmiddlewaretoken: csrf_token },
        success: function(posts) {
            console.log("Got ajax response from views", posts);
            if(posts.length==0){
                $('#error-msg').html('Posts not found!');
                $('.alert').show();
            }else{
                var carousel, tmp;
                for(var i in posts){ // i is shortcode
                    var links = []
                    max_id = posts[i]['id'];
                    // console.log(posts[i]['type']);
                    if (posts[i]['type']=="image"){
                        links.push(posts[i]['images']['low_resolution']['url']);
                    }else if(posts[i]['type']=='video'){
                        links.push(posts[i]['videos']['low_resolution']['url']);
                    }else {//carousel
                        carousel = posts[i]['carousel_media'];
                        for(var j in carousel){
                            // console.log(carousel[j]['type']);
                            if(carousel[j]['type']=='image'){
                                // console.log(carousel[j]['images']['low_resolution']['url']);
                                tmp = carousel[j]['images']['low_resolution']['url'];
                            }else{
                                tmp = carousel[j]['videos']['low_resolution']['url'];
                                // console.log(carousel[j]['videos']['low_resolution']['url']);
                            }
                            // console.log(tmp);
                            links.push(tmp);
                        }
                    }
                    // console.log(i, links);
                    card_data[i] = links;
                }
                console.log("card_data set");
                console.log(card_data);
                // $('#function-buttons').css('display','block');
            }
            //below 2 lines useful only for initial search
            $('#submit').removeAttr('disabled');
            $('#submit').html("Go");
            console.log(max_id);
        },
        error: function(request, status, error){
          console.log(request['status']);
          if(request['status']==500){
            $('#error-msg').html('Internal Server Error! please try after some time.');
          }else{
          $('#error-msg').html('User not found!, please enter a valid username.');
          }
          $('.alert').show();
          $('#submit').removeAttr('disabled');
          $('#submit').html("Go");
        },
    });

}
function getMultiPosts(shortcodes){
    $('#results').html('');
    var users_posts_dict = {};
    for (var i in shortcodes){
        IGembed(shortcodes[i]);
    }
    prepareCardData();

    // console.log("Getting user media");
    // $('#submit').attr('disabled','disabled');
    // $('#submit').html("<img src='/static/ajax-loader.gif'> Go");
    // var i = 0; // card id

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
    }
    $('.alert').hide(); // there may be some initial alert, even though requests!=0
    links = $('#multi_post_links').val();
    shortcodes = getShortCodes(links);
    console.log(shortcodes);
    getMultiPosts(shortcodes);
    return;
});

function getShortCodes(links){
    links = links.replace(/[\t\f\v]/g, '').split('\n');//remove any white space, split by \n
    // re = new RegExp('/p/(.*)/');
    re = /\/p\/([^\/]+)\//;
    var link_list = [];
    for(var i in links){
        if(links[i].slice(-1)!='/') links[i]+='/';
        if(re.test(links[i])){
            link_list.push(links[i].match(re)[1]);
        }
    }
    return link_list;
}

function toggleCardSelection(card){
    console.log("Got a click");
    // console.log('Toggling card');
    var card_id = $(card).attr('id'); // shortcode
    if($(card).hasClass('active')){
        $(card).removeClass('active');
        $(card).children('div.ticks').children('i.fa-check').removeClass('active');
        selected_media.splice( $.inArray(card_id, selected_media), 1 );
    }
    else{
        $(card).addClass('active');
        $(card).children('div.ticks').children('i.fa-check').addClass('active');
        selected_media.push(card_id);
    }
    // console.log('Toggled');
}
$('.ticks').tipsy();
function toggleAllCards(button, media_type){
    if($(button).hasClass('active')){
        $(button).removeClass('active');
    }else{
        $(button).addClass('active');
    }
    var cards = $('.card');
    for(var i=0; i<cards.length; i++){
        var type = $(cards[i]).attr('type');
        if(type==media_type){
            toggleCardSelection(cards[i]);
        }
    }
}

function closeAlert(){
    $('.alert').hide();
    $('#error-msg').html('');
}
