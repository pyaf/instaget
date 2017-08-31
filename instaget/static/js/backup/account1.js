
var total_posts = {};
var requests = 0;
var max_id = null;
var username;
var selected_media = [];

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

function getUserMedia(username){
    console.log("Getting user media");
    $('#submit').attr('disabled','disabled');
    $('#submit').html("<img src='/static/ajax-loader.gif'> Go");

    $.ajax({
        url: '/getUserData/',
        type: 'POST',
        data: {'username': username,
                'max_id': max_id,
                csrfmiddlewaretoken: csrf_token },
        success: function(data) {
            console.log("Success");
            total_posts[requests] = data['posts'];
            console.log(total_posts[0].length)
            if(total_posts[0].length==0){
                $('#error-msg').html('User has not uploaded any media!');
                $('.alert').show();
            }else{
                requests++;
                console.log(data);
                var posts = data['posts'];
                var link, corousel;
                for(var i in posts){
                    max_id = posts[i]['id'];
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
                if(data['more_available']==true){
                    $('#loadMoreButtonDiv').css('display','block');
                }else{ // if loaded more than one time, then it needs to be hidden false condn
                    $('#loadMoreButtonDiv').css('display', 'none');
                }
            }
            //below 2 lines useful only for initial search
            $('#submit').removeAttr('disabled');
            $('#submit').html("Go");
            //below 2 lines useful only after 1st time load more.
            $('#loadMoreButton').removeAttr('disabled');
            $('#loadMoreButton').html("Load More");
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
    }
    $('.alert').hide(); // there may be some initial alert, even though requests!=0
    username = $('#username').val();
    getUserMedia(username);
    return;
});


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

function loadMore(){
    $('#loadMoreButton').attr('disabled','disabled');
    $('#loadMoreButton').html("<img src='/static/ajax-loader.gif'> Loading");
    console.log("loading more")
    getUserMedia(username);

}