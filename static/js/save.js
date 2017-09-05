var bufferArray = {};
var count = 0;
var selected_media = [];

function ajaxFile(url, arr, total){
    // console.log('Inside ajaxFile');
    // console.log(url, arr)
    var oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";
    oReq.onload = function (oEvent) {
        var arrayBuffer = oReq.response; // Note: not oReq.responseText
        // console.log(url, arrayBuffer);
        if (arrayBuffer) {
            arr[url] = arrayBuffer;
            count++;
            updateProgressBar(count, total);
            if(count==total){
                loadEnd();
            }
        }
    };
    oReq.send(null);
};

function loadEnd(){
    $('#progress-bar').html('100%');
    $('#progress-bar').css('width', '100%'); 
    var zip = new JSZip();
    // console.log('inside loadEnd');
    // console.log(selected_media);
    // console.log(bufferArray);
    $.each(selected_media, function(i,n) {
        var filename = getFileName(selected_media[i]);
        // console.log(selected_media[i], bufferArray[selected_media[i]], filename);
        zip.folder("instagram").file(filename, bufferArray[selected_media[i]]);
    });

    zip.generateAsync({type:"blob"}).then(function(content) {
        // console.log(content);
        saveAs(content, "instagram_" + new Date().getTime() + ".zip");
        count = 0;
        bufferArr = [];
    });
    // console.log('loadend done');
    $('#progress-bar').html('0%');
    $('#progress-bar').css('width', '0%');
    $('#progress-bar').hide();
}

function getFileName(link)
{   
    //console.log(link);
    var link  = link.split("/");
    return link[link.length - 1];
}

function downloadZIP(){
    // console.log('Downloading zip');
    // console.log(selected_media);
    $('#progress-bar').show();
    var count = selected_media.length;
    $.each(selected_media, function (i, n) {
        ajaxFile(selected_media[i], bufferArray, count);
    });
}


function singleDownload(){
    //console.log('single download');
    // $('#downloadButton').html("<img src='/static/images/ajax-loader.gif'> wait..")
    // $('#downloadButton').attr('disabled','disabled');
    var link = document.createElement("a");
    link.download = 'instagram';
    link.href = selected_media[0];
    link.click(); // it's async
    // $('#downloadButton').html("Download");
    // $('#downloadButton').removeAttr('disabled');
}

function downloadUserMedia(){
    // console.log('downloadUserMedia calleed');
    $('#progress-bar').html('0%'); // reset in case of load more and then re download
    $('#progress-bar').css('width', '0%'); 
    selected_media = []; // reinitialisation is imp!..
    for (var i in selected_cards){
        for (var j in card_data[selected_cards[i]]){
            selected_media.push(card_data[selected_cards[i]][j]);
        }
    }
    // console.log('length of selected_media', selected_media.length);
    if(selected_media.length==0){
        alert("No media selected!");
        return;
    }else if(selected_media.length==1){
        singleDownload();
    }else{
        downloadZIP();
    }
}

function downloadMultiMedia(){
    if(selected_media.length == 1){
        singleDownload();
    }else{
        downloadZIP();
    }
}

function updateProgressBar(count, total){
    progress_bar = $('#progress-bar');
    current = progress_bar.text().split('%')[0];
    current = parseInt(current);
    new_per = (count / total) * 100;
    for(var i=current; i<new_per; i++){
        progress_bar.html(i+'%');
        progress_bar.css('width', i + '%');
    }
}

function downloadUserStory(){
    $('#progress-bar').html('0%'); // reset in case of load more and then re download
    $('#progress-bar').css('width', '0%'); 
    selected_media = []; // reinitialisation is imp!..
    for (var i in selected_cards){       
        selected_media.push(card_data[selected_cards[i]]);
    }
    // console.log('length of selected_media', selected_media.length);
    if(selected_media.length==0){
        alert(gettext("No media selected!"));
        return;
    }else if(selected_media.length==1){
        singleDownload();
    }else{
        downloadZIP();
    }  
}

$('#downloadButton').on('touchstart click', function(){
    // console.log($(this).attr('type'));
    window[$(this).attr('type')](); // call function with name as string
})

