//states that the app can be in
const STATE_LOADING='loading';
const STATE_NEED_AUTH='need-auth';
const STATE_LOAD_ALBUM='load-album';
const STATE_ALBUM_LOADED='album-loaded';

//play states the record can be in
const PLAY_STATE_PLAYING='playing';
const PLAY_STATE_PAUSED='paused';

//the delay we want to use for search timer
const SEARCH_TIMER_DELAY=250

const vinylPadApp = Vue.createApp({
    data() {
        let returnObj = {
            debug:true,         //true to output whatever from log() function to console.
            devToken:null,      //our dev token
            music:null,         //the MusicInstance
            searchQuery:"",     //what the user is typing
            delaySearchTimer:undefined,  //the search timer to delay searching for each keypress
            searchResults:[],   //the results of the search
            loadingSearchResults:false, //true when we're loading search results
            state:STATE_LOADING,    //the state to dictate which screen to show. See computes
            playState: PLAY_STATE_PAUSED,    //the play-pause state. See computes
            loadedAlbumDetails:null,    //the currently playing album details from search results (e.g. artist, name, album art)
        };
        console.log('Waiting for music Kit load.');
        //load music kit
        document.addEventListener('musickitloaded',  async () =>{
            try {
                //get token
                console.log('Loading dev token');
                await fetch('token.json')
                    .then(res => {
                        return res.text()
                    })
                    .then(token=>{
                        this.devToken = token;
                    });
                console.log('Configure MusicKit');
                await MusicKit.configure({
                    developerToken: this.devToken,
                    app: {
                        name: 'vinylPad',
                        build: '0.2',
                    },
                });

            } catch (err) {
                console.error(err);
            }
            // MusicKit instance is available
            console.log('Getting instance');
            this.music = MusicKit.getInstance();
            console.log('Checking if Authorized');
            if(this.music.isAuthorized===true){
                console.log('Is Authorized');
                //skip authorization and go straight to loading an album
                this.state=STATE_LOAD_ALBUM;
            }
            else{
                //need to auth
                console.log('Is NOT Authorized');
                this.state=STATE_NEED_AUTH;
            }
        });
        console.log('booted up');
        return returnObj;
    },
    methods: {
        log(message){
            if(this.debug){
                console.log(message);
            }
        },
        authorize(){
            this.log('authorize called');
            this.music.authorize().then((token)=>{
                if(token===undefined){
                    alert('Failed to authorize.');
                }
                else{
                    this.state=STATE_LOAD_ALBUM;
                }
            });
        },
        play(){
            this.log('play called');
            this.music.play();
            this.playState=PLAY_STATE_PLAYING;
        },
        pause(){
            this.log('pause called');
            this.music.pause();
            this.playState=PLAY_STATE_PAUSED;
        },
        previousTrack(){
            this.log('previousTrack called');
            this.music.skipToPreviousItem();
        },
        nextTrack(){
            this.log('nextTrack called');
            this.music.skipToNextItem();
        },
        showSearchForAlbum(){
          this.state=STATE_LOAD_ALBUM;
        },
        //execute a search
        searchForAlbum() {
            this.log('searchForAlbum called');
            clearTimeout(this.delaySearchTimer);
            this.searchResults.splice(0,this.searchResults.length); //clear out results
            this.loadingSearchResults=true;
            this.delaySearchTimer=setTimeout(async ()=>{
                    this.log("search: "+this.searchQuery);
                    if(this.searchQuery.length===0)
                    {
                        this.loadingSearchResults=false;
                        return;
                    }
                    const result = await this.music.api.music(
                        '/v1/catalog/'+this.music.storefrontId+'/search',
                        { term: this.searchQuery, types: ['albums', 'artists'], limit: 10}
                    );
                    this.log(result.data.results.albums.data);
                    result.data.results.albums.data.forEach((obj)=>{
                        this.searchResults.push(obj);
                    });
                    this.loadingSearchResults=false;
                }
                ,SEARCH_TIMER_DELAY)
        },
        //load an album from a searchResult index
        loadAlbum(index){
            this.log('loadAlbum called');
            //load it up and play
            this.loadedAlbumDetails=this.searchResults[index];
            this.music.setQueue({ album: this.parseAlbumId(this.loadedAlbumDetails), startPlaying: true});
            //all our state stuff
            this.state=STATE_ALBUM_LOADED;
            this.playState=PLAY_STATE_PLAYING;
            this.searchResults=this.searchResults.splice(0,this.searchResults.length); //clear out results
        },
        //following parse* methods pull out the specified data point from an element in searchResults
        parseAlbumId(resultRow){
            this.log('parseAlbumId called');
            if(resultRow===null){
                return "undefined";
            }
            return resultRow.id;
        },
        parseAlbumName(resultRow){
            this.log('parseAlbumName called');
            if(resultRow===null){
                return "undefined";
            }
            return resultRow.attributes.name;
        },
        parseArtistName(resultRow){
            this.log('parseArtistName called');
            if(resultRow===null){
                return "undefined";
            }
            return resultRow.attributes.artistName;
        },
        parseAlbumArtUrl(resultRow){
            this.log('parseAlbumArtUrl called');
            if((resultRow===null)||(resultRow===undefined)){
                this.log('default return');
                return "img/tmp-rumors.png";
            }
            this.log('Non default');
            this.log(resultRow);
            let rawUrl=resultRow.attributes.artwork.url;
            rawUrl=rawUrl.replace('{w}',150,);
            rawUrl = rawUrl.replace('{h}',150);
            return rawUrl;
        },
    },
    computed: {
        //all the high level screens to show/hide
        showAuthScreen(){
            return this.state===STATE_NEED_AUTH;
        },
        showLoadingScreen(){
            return this.state===STATE_LOADING;
        },
        showLoadAlbumScreen(){
            return this.state===STATE_LOAD_ALBUM;
        },
        showPlayingScreen(){
            return this.state===STATE_ALBUM_LOADED;
        },
        isPlaying(){
            return this.playState===PLAY_STATE_PLAYING;
        }
    },//end computed

});
vinylPadApp.config.compilerOptions.isCustomElement= (tag) => ['apple-music-progress','apple-music-volume',].includes(tag);
const vinylPadAppMount = vinylPadApp.mount('#vinyl-pad');

