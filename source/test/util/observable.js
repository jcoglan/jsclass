JS.Test.Unit.extend({
  Util: new JS.Module({
    extend: {
      /** section: test
       * mixin JS.Test.Unit.Util.Observable
       * 
       * This is a utility class that allows anything mixing
       * it in to notify a set of listeners about interesting
       * events.
       **/
      Observable: new JS.Module({
        extend: {
          /**
           * JS.Test.Unit.Util.Observable.NOTHING = {}
           * We use this for defaults since nil might mean something
           **/
          NOTHING: {}
        },
        
        /**
         * JS.Test.Unit.Util.Observable#addListener(channelName, block, context) -> undefined
         * 
         * Adds the passed block as a listener on the
         * channel indicated by `channelName`.
         **/
        addListener: function(channelName, block, context) {
          if (block === undefined) throw new Error('No callback was passed as a listener');
          
          this.channels()[channelName] = this.channels()[channelName] || [];
          this.channels()[channelName].push([block, context]);
        },
        
        /**
         * JS.Test.Unit.Util.Observable#removeListener(channelName, block, context) -> Function
         * 
         * Removes the listener indicated by `block`
         * from the channel indicated by
         * `channelName`. Returns the registered block, or
         * `null` if none was found.
         **/
        removeListener: function(channelName, block, context) {
          var channel = this.channels()[channelName];
          if (!channel) return;
          var i = channel.length;
          while (i--) {
            if (channel[i][0] === block) {
              channel.splice(i,1);
              return block;
            }
          }
          return null;
        },
        
        /**
         * JS.Test.Unit.Util.Observable#notifyListeners(channelName, args) -> Number
         * 
         * Calls all the blocks registered on the channel
         * indicated by `channelName`. If value is
         * specified, it is passed in to the blocks,
         * otherwise they are called with no arguments.
         **/
        notifyListeners: function(channelName, args) {
          var args        = JS.array(arguments),
              channelName = args.shift(),
              channel     = this.channels()[channelName];
          if (!channel) return 0;
          for (var i = 0, n = channel.length; i < n; i++)
            channel[i][0].apply(channel[i][1] || null, args);
          return channel.length;
        },
        
        channels: function() {
          return this.__channels__ = this.__channels__ || [];
        }
      })
    }
  })
});

