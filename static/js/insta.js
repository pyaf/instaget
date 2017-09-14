var users_posts_dict = {}; // dict of dict, so as insertion, search and deltetion is of O(1) complexity
var selected_media = [];
var requests = false; // helps in reseting all parameters in re-search
var selected_media_set = false;

// Embed all posts using IG oembed endpoint
function IGembed(shortcode){
    var post_link = 'https://instagram.com/p/' + shortcode;
    $.ajax({
        url: 'https://api.instagram.com/oembed/?url=' + post_link,
        type: 'GET',
        crossDomain: true,
        dataType:'jsonp',
        async: false,
        success: function(data) {
            //console.log(data);
            if(users_posts_dict[data['author_name']] == undefined){
                users_posts_dict[data['author_name']] = {};
            }
            users_posts_dict[data['author_name']][shortcode] = 1;
            var html = `<div class="card">`
                        + data['html'].replace('data-instgrm-captioned','')
                    + `</div>`;
            $('#results').append(html);
            window.instgrm.Embeds.process() // Note: no semi colon
        },
        error: function(request, status, error){
          //console.log(request['status']);
          if(request['status']==500){
            $('#error-msg').html(gettext('Internal Server Error! please try after some time.'));
          }else{
          $('#error-msg').append(post_link + gettext(' link not found') + '!.<br>'); // append as there may be many unfound posts
          }
          $('.alert').show();
        }

    });

}


function setMediaLinks(){
    // console.log("lol");
    $.ajax({
        url: '/getMultiPosts/',
        type: 'POST',
        data: {'users_posts_dict': JSON.stringify(users_posts_dict),
                csrfmiddlewaretoken: csrf_token },
        success: function(posts) {
            console.log("Got ajax response from views", posts);
            if(posts.length==0){
                return logErr(gettext('Posts not found!'));
            }else{
                var carousel, tmp;
                for(var i in posts){ // i is shortcode
                    // console.log(posts[i]['type']);
                    if (posts[i]['type']=="image"){
                        selected_media.push(posts[i]['images']['standard_resolution']['url']);
                    }else if(posts[i]['type']=='video'){
                        selected_media.push(posts[i]['videos']['standard_resolution']['url']);
                    }else {//carousel
                        carousel = posts[i]['carousel_media'];
                        for(var j in carousel){
                            // console.log(carousel[j]['type']);
                            if(carousel[j]['type']=='image'){
                                // console.log(carousel[j]['images']['standard_resolution']['url']);
                                tmp = carousel[j]['images']['standard_resolution']['url'];
                            }else{
                                tmp = carousel[j]['videos']['standard_resolution']['url'];
                                // console.log(carousel[j]['videos']['standard_resolution']['url']);
                            }
                            // console.log(tmp);
                            selected_media.push(tmp);
                        }
                    }
                }
            }
            //below 2 lines useful only for initial search
            $('#loader').remove();
            $('.card').css('opacity',1);
            if(selected_media.length==0){
                return logErr(gettext('No media found!'));
            }
            $('#downloadButton').show();
        },
        error: function(request, status, error){
          //console.log(request['status']);
            if(request['status']==500){
                logErr(gettext('Internal Server Error! please try after some time.'));
            }else{
                logErr(gettext('Posts not found!, please enter a valid username.'));
            }
          $('#submit').removeAttr('disabled');
          $('#submit').html(gettext("Search again!"));
        },
    });

}

// when all ajax functions are done then.
$(document).ajaxStop(function () {
    if(!selected_media_set){
        setMediaLinks();
        selected_media_set = true;
    }
    // console.log('ajaxStop');
    return;
});

$(document).ready(function(){
    IGembed(shortcode);
});


