var bufferArray = [];
var count = 0;

function ajaxFile(url, arr, total){
    var oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";
    oReq.onload = function (oEvent) {
        var arrayBuffer = oReq.response; // Note: not oReq.responseText
        console.log(url, arrayBuffer);
        if (arrayBuffer) {
            arr.push(arrayBuffer);
            count++;
            if(count==total){
                loadEnd();
            }
        }
    };
    oReq.send(null);
};

function loadEnd(){
    var zip = new JSZip();
    console.log(bufferArray);
    $.each(selected_media, function(i,n) {
        var filename = getFileName(selected_media[i]);
        console.log(selected_media[i], bufferArray[i], filename);
        zip.folder("instagram").file(filename, bufferArray[i]);
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
    console.log('Downloading zip');
    if(selected_media.length <= 0)
    {
        alert('No media selected!');
        return false;
    }
    var count =selected_media.length;
    $.each(selected_media, function (i, n) {
        console.log(selected_media[i]);
        ajaxFile(selected_media[i], bufferArray, count);
    });
}
