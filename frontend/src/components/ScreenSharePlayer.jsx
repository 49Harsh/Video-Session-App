import { useEffect, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

// Enable Agora SDK logs
AgoraRTC.setLogLevel(0);

const ScreenSharePlayer = ({ channelName, role, appId, token }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [hasRemoteScreen, setHasRemoteScreen] = useState(false);
  const [hasRemoteCam, setHasRemoteCam] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState(null);
  
  const screenClientRef = useRef(null);  // Separate client for screen (host) or single client (viewer)
  const webcamClientRef = useRef(null);  // Separate client for webcam (host only)
  const localVideoTrackRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const webcamVideoTrackRef = useRef(null);
  const webcamAudioTrackRef = useRef(null);
  const remoteScreenContainerRef = useRef(null);
  const remoteWebcamContainerRef = useRef(null);
  const localVideoContainerRef = useRef(null);
  const webcamContainerRef = useRef(null);
  
  // Track which user is screen vs webcam
  const remoteUsersRef = useRef({ screenUid: null, webcamUid: null });

  useEffect(() => {
    let mounted = true;

    const initAgora = async () => {
      try {
        // Helper to setup subscriptions for viewer
        const setupClientEvents = (client) => {
          client.on('user-published', async (user, mediaType) => {
            console.log('📢 User published:', user.uid, mediaType);
            await client.subscribe(user, mediaType);
            console.log('✅ Subscribed to', mediaType);

            if (mediaType === 'video') {
              const remoteVideoTrack = user.videoTrack;
              
              // Decide based on stored users or order
              let targetEl = null;
              
              // If we already know this user
              if (user.uid === remoteUsersRef.current.screenUid) {
                targetEl = remoteScreenContainerRef.current;
                setHasRemoteScreen(true);
              } else if (user.uid === remoteUsersRef.current.webcamUid) {
                targetEl = remoteWebcamContainerRef.current;
                setHasRemoteCam(true);
              } else {
                // New user - assign based on what's empty
                if (!remoteUsersRef.current.screenUid) {
                  // First user goes to screen
                  targetEl = remoteScreenContainerRef.current;
                  remoteUsersRef.current.screenUid = user.uid;
                  setHasRemoteScreen(true);
                  console.log('🖥️ Assigned to screen:', user.uid);
                } else if (!remoteUsersRef.current.webcamUid) {
                  // Second user goes to webcam
                  targetEl = remoteWebcamContainerRef.current;
                  remoteUsersRef.current.webcamUid = user.uid;
                  setHasRemoteCam(true);
                  console.log('📹 Assigned to webcam:', user.uid);
                }
              }

              setTimeout(() => {
                if (targetEl && remoteVideoTrack) {
                  remoteVideoTrack.play(targetEl, { 
                    fit: targetEl === remoteScreenContainerRef.current ? 'contain' : 'cover' 
                  });
                  console.log('🎬 Remote video playing in', targetEl.id);
                }
              }, 50);
            }

            if (mediaType === 'audio') {
              user.audioTrack.play();
              console.log('🔊 Audio playing!');
            }
          });

          client.on('user-unpublished', (user, mediaType) => {
            console.log('📴 Unpublished:', mediaType, user.uid);
            if (mediaType === 'video') {
              if (user.uid === remoteUsersRef.current.screenUid) {
                setHasRemoteScreen(false);
                remoteUsersRef.current.screenUid = null;
                console.log('🖥️ Screen cleared');
              } else if (user.uid === remoteUsersRef.current.webcamUid) {
                setHasRemoteCam(false);
                remoteUsersRef.current.webcamUid = null;
                console.log('📹 Webcam cleared');
              }
            }
          });
        };

        if (role === 'host') {
          // Create two clients for host
          const screenClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
          const webcamClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
          screenClientRef.current = screenClient;
          webcamClientRef.current = webcamClient;

          // Host join with fixed string UIDs to help viewers distinguish
          const screenUid = await screenClient.join(appId, channelName, token, 'host-screen');
          const webcamUid = await webcamClient.join(appId, channelName, token, 'host-cam');

          console.log('✅ Host joined - Screen UID:', screenUid, 'Webcam UID:', webcamUid);
          setIsConnecting(false);
        } else {
          // Viewer: single client only
          const viewerClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
          screenClientRef.current = viewerClient;
          setupClientEvents(viewerClient);
          const viewerUid = await viewerClient.join(appId, channelName, token, null);
          console.log('✅ Viewer joined with UID:', viewerUid);
          setIsConnecting(false);
        }

      } catch (err) {
        console.error('❌ Error:', err);
        if (mounted) {
          setError(err.message);
          setIsConnecting(false);
        }
      }
    };

    initAgora();

    // Cleanup
    return () => {
      mounted = false;
      if (localVideoTrackRef.current) localVideoTrackRef.current.close();
      if (localAudioTrackRef.current) localAudioTrackRef.current.close();
      if (webcamVideoTrackRef.current) webcamVideoTrackRef.current.close();
      if (webcamAudioTrackRef.current) webcamAudioTrackRef.current.close();
      if (screenClientRef.current) {
        screenClientRef.current.removeAllListeners();
        screenClientRef.current.leave();
      }
      if (webcamClientRef.current) {
        webcamClientRef.current.removeAllListeners();
        webcamClientRef.current.leave();
      }
    };
  }, [channelName, appId, token]);

  const startScreenShare = async () => {
    try {
      setError(null);
      console.log('🖥️ Starting screen share...');

      // Create screen track (VIDEO ONLY - no audio)
      const screenTrack = await AgoraRTC.createScreenVideoTrack({
        encoderConfig: '1080p_1'
      }, 'disable');

      localVideoTrackRef.current = screenTrack;

      // Play local preview for host
      if (localVideoContainerRef.current) {
        screenTrack.play(localVideoContainerRef.current, { fit: 'contain' });
        console.log('🎬 Local preview playing!');
      }

      // Publish ONLY video to screen client (no mic audio)
      await screenClientRef.current.publish([localVideoTrackRef.current]);
      console.log('✅ Screen published (video only)!');

      setIsSharing(true);

      // Handle stop
      localVideoTrackRef.current.on('track-ended', () => {
        console.log('🛑 Stopped');
        stopScreenShare();
      });

    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.code === 'OPERATION_ABORTED' ? 'Cancelled - try again' : err.message);
    }
  };

  const startWebcam = async () => {
    try {
      setError(null);
      console.log('📹 Starting webcam...');

      // Create camera video track
      const videoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: '720p_2'
      });
      webcamVideoTrackRef.current = videoTrack;

      // Create microphone audio track
      try {
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        webcamAudioTrackRef.current = audioTrack;
      } catch (err) {
        console.warn('No mic');
      }

      // Play local webcam preview
      if (webcamContainerRef.current) {
        videoTrack.play(webcamContainerRef.current, { fit: 'cover' });
        console.log('🎬 Webcam preview playing!');
      }

      // Publish to webcam client
      const tracks = [webcamVideoTrackRef.current];
      if (webcamAudioTrackRef.current) tracks.push(webcamAudioTrackRef.current);

      await webcamClientRef.current.publish(tracks);
      console.log('✅ Webcam published!');

      setIsWebcamOn(true);

    } catch (err) {
      console.error('❌ Webcam error:', err);
      setError('Failed to start webcam: ' + err.message);
    }
  };

  const stopWebcam = async () => {
    try {
      // Unpublish webcam tracks
      const tracksToUnpublish = [];
      if (webcamVideoTrackRef.current) tracksToUnpublish.push(webcamVideoTrackRef.current);
      if (webcamAudioTrackRef.current) tracksToUnpublish.push(webcamAudioTrackRef.current);
      
      if (tracksToUnpublish.length > 0 && webcamClientRef.current) {
        await webcamClientRef.current.unpublish(tracksToUnpublish);
        console.log('✅ Unpublished webcam');
      }

      // Stop and close tracks
      if (webcamVideoTrackRef.current) {
        webcamVideoTrackRef.current.stop();
        webcamVideoTrackRef.current.close();
        webcamVideoTrackRef.current = null;
      }
      if (webcamAudioTrackRef.current) {
        webcamAudioTrackRef.current.stop();
        webcamAudioTrackRef.current.close();
        webcamAudioTrackRef.current = null;
      }
      
      setIsWebcamOn(false);
      console.log('🛑 Stopped webcam');
    } catch (err) {
      console.error('Stop webcam error:', err);
      // Still cleanup
      if (webcamVideoTrackRef.current) {
        webcamVideoTrackRef.current.stop();
        webcamVideoTrackRef.current.close();
        webcamVideoTrackRef.current = null;
      }
      if (webcamAudioTrackRef.current) {
        webcamAudioTrackRef.current.stop();
        webcamAudioTrackRef.current.close();
        webcamAudioTrackRef.current = null;
      }
      setIsWebcamOn(false);
    }
  };

  const stopScreenShare = async () => {
    try {
      // Unpublish screen video
      if (localVideoTrackRef.current && screenClientRef.current) {
        await screenClientRef.current.unpublish([localVideoTrackRef.current]);
        console.log('✅ Unpublished screen video');
      }

      // Close video track
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.stop();
        localVideoTrackRef.current.close();
        localVideoTrackRef.current = null;
      }
      
      setIsSharing(false);
      console.log('🛑 Stopped screen share');
    } catch (err) {
      console.error('Stop error:', err);
      // Still cleanup even if unpublish fails
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.stop();
        localVideoTrackRef.current.close();
        localVideoTrackRef.current = null;
      }
      setIsSharing(false);
    }
  };

  return (
    <div className="screen-share-container">
      {role === 'host' && (
        <div className="controls">
          <button
            onClick={isSharing ? stopScreenShare : startScreenShare}
            disabled={isConnecting}
            className={isSharing ? 'stop-button' : 'start-button'}
          >
            {isSharing ? '⏹ Stop Screen' : '🖥️ Share Screen'}
          </button>
          
          <button
            onClick={isWebcamOn ? stopWebcam : startWebcam}
            disabled={isConnecting}
            className={isWebcamOn ? 'stop-button' : 'start-button'}
            style={{ marginLeft: '10px' }}
          >
            {isWebcamOn ? '⏹ Stop Webcam' : '📹 Start Webcam'}
          </button>
          
          <p className="status-text">
            Screen: {isSharing ? '🟢 Sharing' : '🔴 Off'} | 
            Webcam: {isWebcamOn ? '🟢 On' : '🔴 Off'}
          </p>
        </div>
      )}

      {error && (
        <div className="error-message">⚠️ {error}</div>
      )}

      <div className="remote-videos" style={{ position: 'relative' }}>
        {/* Viewer: remote screen big */}
        <div
          ref={remoteScreenContainerRef}
          id="remote-screen"
          style={{
            width: '100%',
            height: '600px',
            backgroundColor: '#000',
            display: role === 'viewer' ? 'block' : 'none'
          }}
        />

        {/* Viewer: remote webcam PiP */}
        <div
          ref={remoteWebcamContainerRef}
          id="remote-webcam"
          style={{
            width: '300px',
            height: '225px',
            backgroundColor: '#000',
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            borderRadius: '10px',
            border: '2px solid #fff',
            display: role === 'viewer' && hasRemoteCam ? 'block' : 'none'
          }}
        />

        {/* Host's local screen preview */}
        <div
          ref={localVideoContainerRef}
          id="local-video"
          style={{
            width: '100%',
            height: '600px',
            backgroundColor: '#000',
            display: role === 'host' && isSharing ? 'block' : 'none'
          }}
        />

        {/* Host's local webcam preview */}
        <div
          ref={webcamContainerRef}
          id="webcam-video"
          style={{
            width: '300px',
            height: '225px',
            backgroundColor: '#000',
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            borderRadius: '10px',
            border: '2px solid #fff',
            display: role === 'host' && isWebcamOn ? 'block' : 'none'
          }}
        />
        
        {role === 'viewer' && !hasRemoteScreen && !hasRemoteCam && !isConnecting && (
          <div className="waiting-message">
            <h2>⏳ Waiting for host...</h2>
            <p>Video will appear here</p>
          </div>
        )}

        {role === 'host' && !isSharing && !isWebcamOn && !isConnecting && (
          <div className="waiting-message">
            <h2>Click "Share Screen" or "Start Webcam"</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenSharePlayer;
