var users_posts_dict = {}; // dict of dict, so as insertion, search and deltetion is of O(1) complexity
var selected_media = [];
var requests = false; // helps in reseting all parameters in re-search
var selected_media_set = false;

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
            $('#error-msg').html('Internal Server Error! please try after some time.');
          }else{
          $('#error-msg').html('Post not found!, please enter a valid link.');
          }
          $('.alert').show();
        }

    });

}


function setMediaLinks(){
    //console.log('Preparing selected_media, calling Ajax');
    //console.log(users_posts_dict);
    $.ajax({
        url: '/getMultiPosts/',
        type: 'POST',
        data: {'users_posts_dict': JSON.stringify(users_posts_dict),
                csrfmiddlewaretoken: csrf_token },
        success: function(posts) {
            //console.log("Got ajax response from views", posts);
            if(posts.length==0){
                $('#error-msg').html('Posts not found!');
                $('.alert').show();
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
                //console.log("media links set");
                //console.log(selected_media);
                // $('#function-buttons').css('display','block');
            }
            //below 2 lines useful only for initial search
            $('#submit').removeAttr('disabled');
            $('#submit').html("Go");
            if(selected_media.length==0){
                $('#error-msg').html('No media found!');
                return;
            }else if (selected_media.length==1){
                // dbutton = '<a href="'+selected_media[0]+'" download class="btn btn-default">Download Now</a>';
                // $('#function-buttons').append(dbutton);
                $('#downloadButton').attr('onclick', 'singleDownload()');
                $('#downloadButton').html('Download Now');
                $('#downloadButton').show();
                return;
            }else{
                $('#downloadButton').show();
            }
        },
        error: function(request, status, error){
          //console.log(request['status']);
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

// when all ajax functions are done then.
$(document).ajaxStop(function () {
    if(!selected_media_set){
        setMediaLinks();
        selected_media_set = true;
    }
    // console.log('ajaxStop');
    return;
});


$('#submit').click( function(e) {
    e.preventDefault();
    if(requests){ // User is re-searching, re-initialize every global var
        requests = false;
        links_count = 0;
        selected_media = [];
        selected_media_set = false;
        users_posts_dict = {};
        $('#results').html('');
        $('#downloadButton').hide();
        $('#progress-bar').html('0%');
        $('#progress-bar').hide();

    }
    $('.alert').hide(); // there may be some initial alert, even though requests!=0
    requests = true;
    links = $('#multi_post_links').val();
    shortcodes = getShortCodes(links);
    //console.log(shortcodes);
    $('#submit').attr('disabled','disabled');
    $('#submit').html("<img src='/static/ajax-loader.gif'> Go");
    $('#results').html('');
    for (var i in shortcodes){
        IGembed(shortcodes[i]);
    }
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


function closeAlert(){
    $('.alert').hide();
    $('#error-msg').html('');
}

function singleDownload(){
    //console.log('single download');
    $('#downloadButton').html("<img src='/static/ajax-loader.gif'> Downloading..")
    $('#downloadButton').attr('disabled','disabled');
    var link = document.createElement("a");
    link.download = 'instagram';
    link.href = selected_media[0];
    link.click();
    $('#downloadButton').html("Download");
    $('#downloadButton').removeAttr('disabled');

}
function downloadMulti(){
    downloadZIP();
}
