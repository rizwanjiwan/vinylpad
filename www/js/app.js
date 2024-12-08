const vinylPadApp = Vue.createApp({
    data() {
        let returnObj = {
            debug:true,
            devToken:null,
            music:null,
        };
        //load music kit
        document.addEventListener('musickitloaded',  async () =>{
            try {
                //get token
                await fetch('token.json')
                    .then(res => {
                        return res.text()
                    })
                    .then(token=>{
                        this.devToken = token;
                    });
                await MusicKit.configure({
                    developerToken: this.devToken,
                    app: {
                        name: 'vinylPad',
                        build: '0.1',
                    },
                });

            } catch (err) {
                console.error(err);
            }
            // MusicKit instance is available
            this.music = MusicKit.getInstance();
            await this.music.authorize();
           /* const result = await this.music.api.music(
                `/v1/catalog/us/search`,
                { term: 'rumors', types: 'albums'}
            );
            log(result.data.results.albums.data);
            result.data.results.albums.data.forEach(obj=>{log(obj)});
            */
            const queue = await this.music.setQueue({ album: '594061854'});
        });
        return returnObj;
    },
    methods: {
        log(message){
            if(this.debug){
                console.log(message);
            }
        },
        play(){
          this.music.play();
        },
        pause(){
            this.music.pause();
        },
        previousTrack(){
            this.music.skipToPreviousItem();
        },
        nextTrack(){
            this.music.skipToNextItem();
        },
    },
    computed: {


    },//end computed

});
vinylPadApp.config.compilerOptions.isCustomElement= (tag) => ['apple-music-progress','apple-music-volume',].includes(tag);
const vinylPadAppMount = vinylPadApp.mount('#vinyl-pad');

