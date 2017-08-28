
function getVideoLink(data){
    console.log("Ajax 2");
    $('#downloadButton').attr('disabled','disabled');
    $('#downloadButton').html("<img src='/static/ajax-loader.gif'> Download");
    $.ajax({
        url: '/getVideoLink/',
        type: 'POST',
        data: { 'media_id': data['media_id'],
                'author_name': data['author_name'],
                csrfmiddlewaretoken: csrf_token,
            },
        success: function(response) {
            console.log(response);
            $('#downloadButton').removeAttr('disabled');
            $('#downloadButton').attr('href', response);
            $('#downloadButton').html("Download Now");

        },

    });
}

$('#submit').click( function(e) {
    e.preventDefault();
    var post_link = $('#post_link').val();
    $.ajax({
        url: 'https://api.instagram.com/oembed/?url=' + post_link,
        type: 'GET',
        crossDomain: true,
        dataType:'jsonp',
        success: function(data) {
            console.log(data);
            $('#results').html(data['html']);
            var download = '<br><a download id="downloadButton" class="btn btn-success"></a>';
            $('#download').html(download);
            getVideoLink(data);
            window.instgrm.Embeds.process()
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
});

function closeAlert(){
    $('.alert').hide();
    $('#error-msg').html('');
}

function getShortcode(post_link){
    var i = post_link.indexOf('/p/') + 3;
    var j = i + post_link.slice(i).indexOf('/');
    return post_link.slice(i,j);
}
