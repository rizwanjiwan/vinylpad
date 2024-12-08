log('Setup event listener registered')
let music;//MusicKit Instance
let devToken;//dev token;
document.addEventListener('musickitloaded',  async () =>{
    // Call configure() to configure an instance of MusicKit on the Web.
    try {
        //get token
        log('Trying to grab token');
        await fetch('token.json')
            .then(res => {
                return res.text()
            })
            .then(token=>{
                log('Token grabbed: '+token);
                devToken = token;
        });

        log('Trying to setup MusicKit');
        await MusicKit.configure({
            developerToken: devToken,
            app: {
                name: 'vinylPad',
                build: '0.1',
            },
        });

    } catch (err) {
        console.error(err);
    }
    // MusicKit instance is available
    log('MusicKit instance and auth');
    music = MusicKit.getInstance();
    await music.authorize();
    log('Authorized.');
    log('test play fleetwood mac');
    const result = await music.api.music(
        `/v1/catalog/us/search`,
        { term: 'rumors', types: 'albums'}
    );
    log(result.data.results.albums.data);
    result.data.results.albums.data.forEach(obj=>{log(obj)});
    const queue = await music.setQueue({ album: '594061854'});

});




//to toggle if we're debuging stuff
function log(message){
    console.log(message);
}