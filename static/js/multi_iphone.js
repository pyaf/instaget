var users_posts_dict = {}; // dict of dict, so as insertion, search and deltetion is of O(1) complexity
var selected_media = [];
var requests = false; // helps in reseting all parameters in re-search
var selected_media_set = false;

function embed(type, link, post){
    var date = new Date(post['created_time'] * 1000);
    var html = '<div class="card" style="max-width: 20rem;" >';
    if(type == 'mp4'){
        html += '<video controls="controls" style="width:100%;">' +
                '<source src="'+link+'" type="video/mp4" />' +
                '</video>';
    }else{
        html += '<img class="card-img-top" src="'+link+'" alt="Card image cap">';
    }
    html += '<div class="card-body">' +
            '<span><i class="fa fa-heart"></i> '+post['likes']['count']+' likes </span>' +
            '<span><i class="fa fa-comment"></i> '+post['comments']['count']+' comments</span>';
    if(post['caption']!=null){
        html+= '<p class="card-text">'+ post['caption']['text']+'</p>';
        }
    html += 'Created at '+ date.toLocaleString() + '</div> </div>';
    $('#results').append(html);
}

function PrepareUsersPostDict(shortcode){
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
            }
            //below 2 lines useful only for initial search
            $('#submit').removeAttr('disabled');
            $('#submit').html(gettext("Search again!"));
            $('#results').tooltip('show');

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


$('#submit').on('touchstart click', function(e) {
    e.preventDefault();
    if(requests){ // User is re-searching, re-initialize every global var
        requests = false;
        selected_media_set = false;
        users_posts_dict = {};
        $('#results').html('');
        $('#error-msg').html('');
    }
    $('.alert').hide(); // there may be some initial alert, even though requests!=0
    requests = true;
    links = $('#multi_post_links').val();
    shortcodes = getShortCodes(links);
    if(shortcodes.length==0){
        return logErr("Not a valid link!");
    }
    $('#submit').attr('disabled','disabled');
    $('#submit').html("<img src='/static/images/ajax-loader.gif'>"+gettext("Getting posts") +" ..");
    $('#results').html('');
    for (var i in shortcodes){
        PrepareUsersPostDict(shortcodes[i]);
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

