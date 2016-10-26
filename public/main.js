/**
 * Created by oz on 10/25/2016.
 */

var SkylinkWrapper = {

  init: function (settings) {
    var that = this;

    that.skylink = new Skylink();
    that.skylink.setLogLevel(4);

    that.cachePageElems();
    that.myName = "me-"+that.randomString();
    that.$myName.innerHTML = that.myName;
    that.skylink.init({
      apiKey: 'YOUR_DEVELOPER_KEY',
      defaultRoom: 'YOUR_DEFAULT_ROOM'
    }, function (error, success) {
      if (error) {
        console.error("ERROR", error, success);
        that.$status.innerHTML = 'Failed retrieval for room information.<br>Error: ' + (error.error.message || error.error);
      } else {
        that.$status.innerHTML = 'Room is joined....';
        that.$status.style.display = "none";
        that.$myNameParent.style.display = "block";
        that.$startBtn.removeAttribute("disabled");
      }
    });

    that.skylinkListeners();
    that.domBinding();
  },

  cachePageElems: function () {
    var that = this;

    that.$myVideo = document.getElementById("myVideo");
    that.$startBtn = document.getElementById("startBtn");
    that.$hangupBtn = document.getElementById("hangupBtn");
    that.$messageText = document.getElementById("messageTxt");
    that.$status = document.getElementById("status");
    that.$chatBox = document.getElementById('chatBox');
    that.$sendMessageBtn = document.getElementById("sendMessageBtn");
    that.$videoList = document.getElementById("videoContainerList");
    that.$myName = document.getElementById("myName");
    that.$myNameParent = document.getElementById("myNameParent");
  },

  skylinkListeners: function () {

    var that = this;

    that.skylink.setUserData({
      name: that.myName
    });

    that.skylink.on('peerJoined', function(peerId, peerInfo, isSelf) {
      if(isSelf) return; // We already have a video element for our video and don't need to create a new one.
      var vid = document.createElement('video');
      vid.autoplay = true;
      vid.id = peerId;
      that.$videoList.appendChild(vid);
      console.log("peerJoined", peerId, peerInfo, isSelf);
    });

    that.skylink.on('incomingStream', function(peerId, stream, isSelf) {
      if(isSelf) return;
      var vid = document.getElementById(peerId);
      attachMediaStream(vid, stream);
    });

    that.skylink.on('incomingMessage', function(message, peerId, peerInfo, isSelf) {
      var user = that.myName,
          className = 'you';
      if (!isSelf) {
        user = peerInfo.userData.name || peerId;
        className = 'message';
      }
      that.addMessage("<b>" + user + "</b>" + ': ' + message.content, className);
    });

    that.skylink.on('peerLeft', function(peerId) {
      var vid = document.getElementById(peerId);
      console.log("peerLeft", peerId);
      that.$videoList.removeChild(vid);
    });

    that.skylink.on('mediaAccessSuccess', function(stream) {
      attachMediaStream(that.$myVideo, stream);
    });
  },

  domBinding: function () {
    var that = this;

    that.$startBtn.onclick = function(event){
      that.skylink.joinRoom({
        audio: true,
        video: true
      }, function (error, success) {
        if (error) {
          that.$status.innerHTML = 'Failed to start call.<br>' +'Error: ' + (error.error.message || error.error);
        } else {
          that.$startBtn.setAttribute("disabled", "disabled");
          that.$hangupBtn.removeAttribute("disabled");
          that.$status.innerHTML = 'Call started...';
        }
      });
    };

    that.$hangupBtn.onclick = function(event){
      that.$startBtn.removeAttribute("disabled");
      that.$hangupBtn.setAttribute("disabled", "disabled");
      that.skylink.leaveRoom();
      that.$myVideo.src = '';
      that.$myVideo.pause();
    };

    that.$sendMessageBtn.onclick = function(event){
      that.skylink.sendP2PMessage(that.$messageText.value);
      that.$messageText.value = "";
    };
  },

  addMessage: function(message, className) {
    var chatBox = document.getElementById('chatBox'),
        li = document.createElement('li');

    li.className = "list-group-item " + className;
    li.innerHTML = message;

    chatBox.appendChild(li);
  },

  randomString: function(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }
};
