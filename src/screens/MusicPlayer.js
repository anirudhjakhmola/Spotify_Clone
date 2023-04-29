import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import TrackPlayer, {
  Event,
  State,
  Track,
  usePlaybackState,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import {playListData} from '../constants';
import SongInfo from '../components/SongInfo';
import SongSlider from '../components/SongSlider';
import Icon from 'react-native-vector-icons/MaterialIcons';
const {width} = Dimensions.get('window');

const MusicPlayer = () => {
  const [track, setTrack] = useState();
  const playBackState = usePlaybackState(); //hook provided by trackplayer
  const scrollX = useRef(new Animated.Value(0)).current;
  const slider = useRef(null);
  const [scaleValue, setScaleValue] = useState(new Animated.Value(0.8));

  useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
    switch (event.type) {
      case Event.PlaybackTrackChanged:
        const playingTrack = await TrackPlayer.getTrack(event.nextTrack);
        console.log('playingTrack', playingTrack);
        setTrack(playingTrack);
        break;
    }
  });

  const skipTo = async trackId => {
    await TrackPlayer.skip(trackId);
  };

  useEffect(() => {
    // setupPlayer();

    scrollX.addListener(({value}) => {
      //   console.log(`ScrollX : ${value} | Device Width : ${width} `);

      const index = Math.round(value / width);
      skipTo(index);
      // setsongIndex(index);

      //   console.log(`Index : ${index}`);
    });

    return () => {
      scrollX.removeAllListeners();
      TrackPlayer.destroy();
    };
  }, []);

  const renderArtWork = () => {
    return (
      <View style={styles.listArtWrapper}>
        <Animated.View style={{transform: [{scale: scaleValue}]}}>
          {track?.artwork && (
            <Image
              style={{width: 300, height: 300, borderRadius: 5}}
              source={{uri: track?.artwork?.toString()}}
            />
          )}
        </Animated.View>
      </View>
    );
  };

  console.log('playBackState', playBackState);

  useEffect(() => {
    if (playBackState === State.Paused || playBackState === State.Ready) {
      Animated.timing(scaleValue, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [playBackState, scaleValue]);

  // Control Center

  // next button
  const skipToNext = async () => {
    await TrackPlayer.skipToNext();
  };
  // Previous button
  const skipToPrevious = async () => {
    await TrackPlayer.skipToPrevious();
  };

  const togglePlayback = async playback => {
    const currentTrack = await TrackPlayer.getCurrentTrack();

    if (currentTrack !== null) {
      if (playback === State.Paused || playback === State.Ready) {
        await TrackPlayer.play();
      } else {
        await TrackPlayer.pause();
      }
    }
  };

  // const animateImage = () => {

  // };

  return (
    <View style={styles.container}>
      <FlatList
        ref={slider}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        data={playListData}
        renderItem={renderArtWork}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {useNativeDriver: false},
        )}
        keyExtractor={item => item.id}
      />

      <SongInfo track={track} />
      <SongSlider />

      {/* // Control Center */}
      <View style={styles.containerControl}>
        <Pressable onPress={skipToPrevious}>
          <Icon style={styles.icon} name="skip-previous" size={40} />
        </Pressable>
        <Pressable onPress={() => togglePlayback(playBackState)}>
          <Icon
            style={styles.icon}
            name={playBackState === State.Playing ? 'pause' : 'play-arrow'}
            size={75}
          />
        </Pressable>
        <Pressable onPress={skipToNext}>
          <Icon style={styles.icon} name="skip-next" size={40} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#001d23',
  },
  listArtWrapper: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumContainer: {
    width: 300,
    height: 300,
  },

  containerControl: {
    marginBottom: 56,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  icon: {
    color: '#FFFFFF',
  },
  playButton: {
    marginHorizontal: 24,
  },
});

export default MusicPlayer;
