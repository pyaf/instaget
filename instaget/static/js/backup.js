
var total_posts = {};
var requests = 0;

function embed(link, post){
    var date = new Date(post['created_time'] * 1000);
    var type = link.slice(-3);
    var html = `<div class="card" link="`+link+`" type="`+type+`" "style="max-width: 20rem;" onclick="toggleCardSelection(this)" >`
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
            <span><i class="fa fa-comment"></i> `+post['comments']['count']+` comments</span>
            <p class="card-text">`+ post['caption']['text']+`</p>
            Created at `+ date.toLocaleString()+`
        </div>
        <div class="ticks">
            <i class="fa fa-check"></i>
        </div>
        </div>`
    $('#results').append(html);
}

$('#submit').click( function(e) {
    e.preventDefault();
    $('#results').html('');
    var username = $('#username').val();
    console.log(username);
    $.ajax({
        url: '/getUserData/',
        type: 'POST',
        data: {'username': username,
                'max_id': 'none',
                csrfmiddlewaretoken: csrf_token },
        success: function(data) {
            console.log("Success");
            total_posts[requests] = data['posts'];
            requests++;
            console.log(data);
            var posts = data['posts'];
            var link, corousel;
            for(var i in posts){
                // console.log(posts[i]);
                console.log(posts[i]['type']);
                if (posts[i]['type']=="image"){
                    link = posts[i]['images']['low_resolution']['url'];
                }else if(posts[i]['type']=='video'){
                    link = posts[i]['videos']['low_resolution']['url'];
                }else {//corousel
                    corousel = posts[i]['corousel_media'];
                    for(var j in corousel){
                        if(corousel[j]['type']=='image'){
                            link = corousel[j]['images']['low_resolution']['url'];
                        }else{
                            link = corousel[j]['videos']['low_resolution']['url'];
                        }
                    }
                }
            console.log(link);
            embed(link, posts[i]);
            }
            console.log("Done");
            $('#function-buttons').css('display','block');

            // console.log("requests: " + requests.toString());
        }
    });
});

var selected_media = [];

function toggleCardSelection(card){
    // console.log('Toggling card');
    var link = $(card).attr('link');
    if($(card).hasClass('active')){
        $(card).removeClass('active');
        $(card).children('div.ticks').children('i.fa-check').removeClass('active');
        selected_media.splice( $.inArray(link, selected_media), 1 );
        //removed link from selected_media
    }
    else{
        $(card).addClass('active');
        $(card).children('div.ticks').children('i.fa-check').addClass('active');
        selected_media.push(link);
    }
    // console.log('Toggled');
 }

function toggleAllCards(button, media_type){
    var cards = $('.card');
    for(var i=0; i<cards.length; i++){
        var type = $(cards[i]).attr('type');
        if(type==media_type){
            toggleCardSelection(cards[i]);
        }
    }
}

