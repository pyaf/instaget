function embed(link, post){
    var date = new Date(post['created_time'] * 1000);
    var html = `<div class="card" style="max-width: 20rem;" onclick="getCardActive(this)" >`
    if(link.slice(-3)=='mp4'){
        html += `
        <video controls="controls" style="width:317px;">
        <source src="`+link+`" type="video/mp4" />
        </video>
        `
    }else{
        html += `<img class="card-img-top" src="`+link+`" alt="Card image cap">`
    }

    html += `
        <div class="card-body">
            <span><i class="fa fa-heart"></i> `+post['likes']['count']+` likes </span>
            <span><i class="fa fa-comment"></i> `+post['comments']['count']+` comments</span>
            <p class="card-text">`+ post['caption']['text']+`</p>
            Created at `+ date.toLocaleString()+`
        </div>
        <div class="ticks">
            <i class="fa fa-check"></i>
        </div>
        </div>`
    $('#results').append(html);
}


 function getCardActive(card){
    if($(card).hasClass('active')){
        $(card).removeClass('active');
        $(card).children('div.ticks').children('i.fa-check').removeClass('active');
    }
    else{
        $(card).addClass('active');
        $(card).children('div.ticks').children('i.fa-check').addClass('active');
    }
 }
// onclick="setCardActive(this)"
