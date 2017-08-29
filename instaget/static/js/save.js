var bufferArray = {};
var count = 0;

function ajaxFile(url, arr, total){
    console.log('Inside ajaxFile');
    console.log(url, arr)
    var oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";
    oReq.onload = function (oEvent) {
        var arrayBuffer = oReq.response; // Note: not oReq.responseText
        console.log(url, arrayBuffer);
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

    var zip = new JSZip();
    console.log('inside loadEnd');
    console.log(selected_media);
    console.log(bufferArray);
    $.each(selected_media, function(i,n) {
        var filename = getFileName(selected_media[i]);
        console.log(selected_media[i], bufferArray[selected_media[i]], filename);
        zip.folder("instagram").file(filename, bufferArray[selected_media[i]]);
    });

    zip.generateAsync({type:"blob"}).then(function(content) {
        console.log(content);
        saveAs(content, "instagram_" + new Date().getTime() + ".zip");
        count = 0;
        bufferArr = [];
    });
}

function getFileName(link)
{
    var link  = link.split("/");
    return link[link.length - 1];
}

function downloadZIP(){
    $('#progress-bar').show();
    console.log('Downloading zip');
    if(selected_media.length <= 0)
    {
        alert('No media selected!');
        return false;
    }
    var count =selected_media.length;
    console.log('selected_media', selected_media);
    $.each(selected_media, function (i, n) {
        console.log(i, selected_media[i]);
        ajaxFile(selected_media[i], bufferArray, count);
    });
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