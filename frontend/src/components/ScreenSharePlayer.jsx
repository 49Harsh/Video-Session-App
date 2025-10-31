import { useEffect, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

// Enable Agora SDK logs
AgoraRTC.setLogLevel(0);

const ScreenSharePlayer = ({ channelName, role, appId, token }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState(null);
  
  const clientRef = useRef(null);
  const localVideoTrackRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const remoteVideoContainerRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const initAgora = async () => {
      try {
        // Create Agora client
        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        // Event: User published (THIS IS WHERE VIEWERS GET THE SCREEN)
        client.on('user-published', async (user, mediaType) => {
          console.log('📢 User published:', user.uid, mediaType);

          // Subscribe
          await client.subscribe(user, mediaType);
          console.log('✅ Subscribed to', mediaType);

          if (mediaType === 'video') {
            setHasRemoteVideo(true);
            
            // Get the remote video track
            const remoteVideoTrack = user.videoTrack;
            
            // Wait for DOM
            setTimeout(() => {
              if (remoteVideoContainerRef.current && remoteVideoTrack) {
                // Play video
                remoteVideoTrack.play(remoteVideoContainerRef.current, { fit: 'contain' });
                console.log('🎬 Video playing!');
              }
            }, 100);
          }

          if (mediaType === 'audio') {
            user.audioTrack.play();
            console.log('🔊 Audio playing!');
          }
        });

        // Event: User unpublished
        client.on('user-unpublished', (user, mediaType) => {
          console.log('📴 Unpublished:', mediaType);
          if (mediaType === 'video') {
            setHasRemoteVideo(false);
          }
        });

        // Join channel
        const uid = await client.join(appId, channelName, token, null);
        
        if (!mounted) return;
        
        console.log('✅ Joined with UID:', uid);
        setIsConnecting(false);

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
      if (clientRef.current) {
        clientRef.current.leave();
        clientRef.current.removeAllListeners();
      }
    };
  }, [channelName, appId, token]);

  const startScreenShare = async () => {
    try {
      setError(null);
      console.log('🖥️ Starting screen share...');

      // Create screen track
      const screenTrack = await AgoraRTC.createScreenVideoTrack({
        encoderConfig: '1080p_1'
      }, 'disable');

      localVideoTrackRef.current = screenTrack;

      // Create audio track
      try {
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        localAudioTrackRef.current = audioTrack;
      } catch (err) {
        console.warn('No mic');
      }

      // Publish
      const tracks = [localVideoTrackRef.current];
      if (localAudioTrackRef.current) tracks.push(localAudioTrackRef.current);

      await clientRef.current.publish(tracks);
      console.log('✅ Published!');

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

  const stopScreenShare = async () => {
    if (localVideoTrackRef.current) {
      localVideoTrackRef.current.stop();
      localVideoTrackRef.current.close();
      localVideoTrackRef.current = null;
    }
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.stop();
      localAudioTrackRef.current.close();
      localAudioTrackRef.current = null;
    }
    setIsSharing(false);
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
            {isSharing ? '⏹ Stop Sharing' : '▶ Start Sharing'}
          </button>
          <p className="status-text">
            Status: {isConnecting ? 'Connecting...' : isSharing ? '🟢 Sharing' : '🔴 Not Sharing'}
          </p>
        </div>
      )}

      {error && (
        <div className="error-message">⚠️ {error}</div>
      )}

      <div className="remote-videos">
        <div
          ref={remoteVideoContainerRef}
          id="remote-video"
          style={{
            width: '100%',
            height: '600px',
            backgroundColor: '#000',
            display: role === 'viewer' ? 'block' : 'none'
          }}
        />
        
        {role === 'viewer' && !hasRemoteVideo && !isConnecting && (
          <div className="waiting-message">
            <h2>⏳ Waiting for host...</h2>
            <p>Screen will appear here</p>
          </div>
        )}

        {role === 'host' && !isSharing && !isConnecting && (
          <div className="waiting-message">
            <h2>Click "Start Sharing"</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenSharePlayer;
