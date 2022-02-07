const CLIENT_ID = '136433871779-jsj2rtef16h624fvm5746slvevgbl6ks.apps.googleusercontent.com';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/youtube.readonly";
const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');
const content = document.getElementById('content');
const channelForm = document.getElementById('channel-form');
const channelInput = document.getElementById('channel-input');
const videoContainer = document.getElementById('video-container');
const defaultChannel = 'youtube'

channelForm.addEventListener('submit', e=> {
    e.preventDefault();

    const channel = channelInput.value;

    getChannel(channel);
})


function handleClientLoad(){
    gapi.load('client:auth2', initClient);
}


function initClient() {
    gapi.client.init({
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(function () {
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      authorizeButton.onclick = handleAuthClick;
      signoutButton.onclick = handleSignoutClick;
    });
  }

function updateSigninStatus(isSignedIn){

    if(isSignedIn) {
        authorizeButton.style.display ='none';
        signoutButton.style.display ='block';
        content.style.display ='block';
        videoContainer.style.display ='block'
        getChannel(defaultChannel);
    }

    else{
        authorizeButton.style.display ='block';
        signoutButton.style.display ='none';
        content.style.display ='none';
        videoContainer.style.display ='none'
    }
}


function handleAuthClick(){

    gapi.auth2.getAuthInstance().signIn();

}

function handleSignoutClick(){

    gapi.auth2.getAuthInstance().signOut();

}

function showChannelData(data){

    const channelData = document.getElementById('channel-data');
    channelData.innerHTML = data;
}

function getChannel(channel) {
    gapi.client.youtube.channels.list({

        part:'snippet,contentDetails,statistics',
        forUsername: channel
    })
        .then(response => {
            console.log(response);
            const channel = response.result.items[0];
            const output = `
            
                <ul class ="list-group m-3">
                    <li class="list-group-item list-group-item-primary">Title : ${channel.snippet.title} </li>
                    <li class="list-group-item list-group-item-primary">ID : ${channel.id} </li>
                    <li class="list-group-item list-group-item-primary">Subscribers : ${numberWithCommas(channel.statistics.subscriberCount)}</li>
                    <li class="list-group-item list-group-item-primary">Views : ${numberWithCommas(channel.statistics.viewCount)} </li>
                    <li class="list-group-item list-group-item-primary">Videos : ${numberWithCommas(channel.statistics.videoCount)} </li>
                    <li class="list-group-item list-group-item-primary">Description : ${channel.snippet.description} </li>
                    <a class ="list-group-item list-group-item-success btn btn-dark" target ="_blank" href ="https://youtube.com/${channel.snippet.customUrl}">Visit Channel</a>
                </ul>    
            `;
            showChannelData(output);

            const playlistId = channel.contentDetails.relatedPlaylists.uploads;
            requestVideoPlaylist(playlistId);
        })
        .catch(err => alert('Could not find the channel.'));
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function requestVideoPlaylist(playlistId){

    const requestOptions = {
        playListId: playlistId,
        part:'snippet',
        maxResults:12
    }

    const request = gapi.client.youtube.playlistItems.list(requestOptions);
    
    request.execute(response => {
        console.log(response);

        const playlistItems = response.result.items;

        if(playlistItems){

            let output = '<h4>Latest Videos</h4>';

            playlistItems.forEach(item => {

                const videoId = item.snippet.resourceId.videoId;
                output += `
                    <div class="col">
                        <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>           
                    </div>
                
                `;
            });
            videoContainer.innerHTML = output;
        }
        else{
            videoContainer.innerHTML = "There is no videos."

        }
    });
}


