
var total_posts = {};
var requests = 0;
var max_id = null;
var username;
var selected_cards = []; // store selected cards
var card_data = {}; // key is card id i.e., shortcode, value is list of links of that card post
var videos_present = false;
var images_present = false;

function embed(type, link, post){
    var date = new Date(post['created_time'] * 1000);
    var html = `<div class="card" style="max-width: 20rem;" >`;
    if(type == 'mp4'){
        html += `
        <video controls="controls" style="width:100%;">
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
        </div>`
    $('#results').append(html);
}

function getUserMedia(username){
    $('#submit').attr('disabled','disabled');
    $('#submit').html("<img src='/static/images/ajax-loader.gif'> " + gettext('Wait'));
    $.ajax({
        url: '/getUserData/',
        type: 'POST',
        data: {'username': username,
                'max_id': max_id,
                csrfmiddlewaretoken: csrf_token },
        success: function(data) {
            // console.log("Success");
            var status = data['status'];
            if (status==404){
                return logErr(gettext('User not found!'));
            }else if(status!=200){
                return logErr('Error occured. Err Code: '+ status);
            }
            total_posts[requests] = data['posts'];
            if(total_posts[0].length==0){
                return logErr(gettext('User has not uploaded any media!'));
            }
            requests++;
            console.log(data);
            var posts = data['posts'];
            var tmp, carousel;
            for(var i in posts){
                var links = [];
                max_id = posts[i]['id'];
                if (posts[i]['type']=="image"){
                	link = posts[i]['images']['standard_resolution']['url'];
	                embed('jpg', link, posts[i]);
                }else if(posts[i]['type']=='video'){
                	link = posts[i]['videos']['standard_resolution']['url'];
	                embed('mp4', link, posts[i]);
                }else {//carousel
                    carousel = posts[i]['carousel_media'];
                    for(var j in carousel){
                        if(carousel[j]['type']=='image'){
                            link = carousel[j]['images']['standard_resolution']['url'];
		                	embed('jpg', link, posts[i]);
                        }else{
                            link = carousel[j]['videos']['standard_resolution']['url'];
	                		embed('mp4', link, posts[i]);
                        }
                    }
                }
            }
            if(data['more_available']==true){
                $('#loadMoreButtonDiv').css('display','block');
            }else{ // if loaded more than one time, then it needs to be hidden false condn
                $('#loadMoreButtonDiv').css('display', 'none');
            }
            //below 2 lines useful only for initial search
            $('#submit').removeAttr('disabled');
            $('#submit').html(gettext("Go"));
            //below 2 lines useful only after 1st time load more.
            $('#loadMoreButton').removeAttr('disabled');
            $('#loadMoreButton').html("Load More");
            // console.log(max_id);
            $('#results').tooltip('show');
        },
        error: function(request, status, error){
            console.log(request['status']);
                if(request['status']==500){
                    logErr('Internal Server Error! please try after some time.');
                }else{
                    logErr('Error occured, Err code: ' + request['status']);
                }
            $('#submit').removeAttr('disabled');
            $('#submit').html("Search again!");
        },
    });
}

$('#submit').on('touchstart click', function(e) {
    e.preventDefault();
    if(requests!=0){ // User is re-searching a new username, re-initialize every global var
        requests = 0;
        max_id = null;
        total_posts = {};
        selected_media = [];
        $('#results').html('');
        $('#loadMoreButtonDiv').css('display','none'); 
    }
    $('.alert').hide(); // there may be some initial alert, even though requests!=0
    username = $('#username').val();
    getUserMedia(username);
    return;
});


function loadMore(){
    $('#loadMoreButton').attr('disabled','disabled');
    $('#loadMoreButton').html("<img src='/static/images/ajax-loader.gif'> " + gettext('loading'));
    // console.log("loading more")
    getUserMedia(username);
}

$('#loadMoreButton').on('touchstart click', loadMore);


