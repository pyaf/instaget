
$('#submit').click( function(e) {
    e.preventDefault();
    var post_link = $('#post_link').val();
    $('.alert').hide();
    $('#results').html('');
    $('#download').hide();
    console.log(post_link);
    $.ajax({
        url: 'https://api.instagram.com/oembed/?callback=&url=' + post_link,
        type: 'GET',
        crossDomain: true,
        dataType:'jsonp',
        success: function(data) {
            console.log(data);
            $('#results').html('');
            $('#download').attr('href',data['thumbnail_url']);
            $('#download').show();
            $('#results').html(data['html']);
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
}); 

function closeAlert(){
    $('.alert').hide();
    $('#error-msg').html('');
}