YTCropper = {} || YTCropper;
YTCropper.YoutubeIdParser = Stapes.subclass({
   constructor: function() {
      this.youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i; 
   },
   parseYoutubeId: function(url) {
     var matches = url.match(this.youtubeRegex);

     if (matches != null && matches.length >= 2) {
        return  matches[1];
     }
   }
});
YTCropper.Cropper = Stapes.subclass({
   constructor: function() {
      this.initializeRactive();
   },
   initializeRactive: function() {
      this.ractive = new Ractive({
        el: '.form-container',
        template: '#form-template',
        data: {wadsworth_constant: false}
      });
      this.bindRactiveListeners();
   },
   bindRactiveListeners: function() {
      // NOTE: Take the floor here instead of rounding or else we will get different
      // values from what is displayed in the player.
      this.ractive.on('captureStartTime', this.captureStartTime.bind(this));
      this.ractive.on('captureEndTime', this.captureEndTime.bind(this));
      this.ractive.observe('youtube_url', this.youtubeUrlDidChange.bind(this));
      this.ractive.on('toggleWadsworthConstant', this.toggleWadsworthConstant.bind(this))
   },
   captureStartTime: function() {
      this.ractive.set({ start_seconds: Math.floor(this.player.getCurrentTime()) });
   },
   captureEndTime: function() {
      this.ractive.set({ end_seconds: Math.floor(this.player.getCurrentTime()) });
   },
   youtubeUrlDidChange: function(newValue) {
      var parser = new YTCropper.YoutubeIdParser();
      var youtubeId = parser.parseYoutubeId(newValue);

      if (youtubeId) {
         this.ractive.set({ youtube_id: youtubeId });

         if (typeof(YT) === "undefined") {
            this.initializePlayerAndLoadVideo();
         }
         else {
            this.loadVideoById();
         }
      }
   },
   initializePlayerAndLoadVideo: function() {
     var tag = document.createElement('script');

     tag.src="https://www.youtube.com/iframe_api";
     var firstScriptTag = document.getElementsByTagName('script')[0];
     firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

     onYouTubeIframeAPIReady = this.initializePlayer.bind(this);
   },
   initializePlayer: function() {
     this.player = new YT.Player('player', { videoId: this.ractive.get('youtube_id'), height: '390', width: '640' });
   },
   loadVideoById: function() {
     this.player.loadVideoById(this.ractive.get('youtubeId'));
   },
   toggleWadsworthConstant: function(event) {
      if (!this.ractive.get('wadsworth_constant')) {
         var duration;

         if (typeof(this.player) === "undefined") {
            return;
         }

         duration = this.player.getDuration()

         if (duration == 0) {
            return;
         }

         this.ractive.set({ start_seconds: Math.floor(duration * .3) });
         this.ractive.set({ end_seconds: duration });
      }
   }
});
