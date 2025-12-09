import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import LeftArrow from '../../assets/icons/LeftArrow';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native';

const InfoPage = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaProvider>
      <ImageBackground
        source={require('../../assets/wallpaper.jpg')}
        resizeMode="cover"
        blurRadius={45}
        imageStyle={{ opacity: 0.6 }}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.container}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <LeftArrow />
          </TouchableOpacity>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 50, paddingTop: 54 }}
          >
            <Text style={styles.sectionTitle}>Adding Widget</Text>
            <View style={styles.section}>
              <Text style={styles.instructionText}>
                1. Long press on your home screen{'\n'}
                2. Select "Widgets"{'\n'}
                3. Find "Quote Widget Pro"{'\n'}
                4. Drag it to your home screen{'\n'}
                5. Your settings will be applied automatically!
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Show your love</Text>
            <View style={styles.section}>
              <Text style={styles.instructionText}>
                We’d love to hear what you think! Your feedback helps us make
                the app even better. Share your thoughts and experiences with us
                by leaving a review on Google Play.
              </Text>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}
              >
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: '#eb8b65ff' }]}
                >
                  <Text style={styles.btnTxt}>Share app</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: '#201868ff' }]}
                >
                  <Text style={styles.btnTxt}>Rate us</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionTitle}>More apps from us</Text>
            <View style={[styles.section, { flexDirection: 'row', gap: 20 }]}>
              <Image
                source={require('../../assets/icons/focusDock.jpg')}
                style={styles.appIcn}
              />
              <View>
                <Text style={{ fontSize: 24, fontWeight: '400' }}>
                  Focus dock
                </Text>
                <TouchableOpacity style={styles.getBtn}>
                  <Text style={[styles.btnTxt, { color: '#201868ff' }]}>
                    Get app
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </SafeAreaProvider>
  );
};

export default InfoPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    gap: 20,
  },
  backBtn: {
    backgroundColor: '#f3f3f3d5',
    marginRight: 'auto',
    position: 'absolute',
    top: 40,
    left: 15,
    padding: 7,
    paddingHorizontal: 20,
    borderRadius: 25,
    zIndex: 40,
  },

  section: {
    backgroundColor: '#ffffffab',
    padding: 18,
    paddingVertical: 24,
    borderRadius: 30,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: '300',
    color: '#000000ff',
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 15,
  },
  btn: {
    flex: 1,
    marginHorizontal: 4,
    marginTop: 25,
    borderRadius: 30,
    padding: 15,
  },
  btnTxt: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontWeight: '400',
  },
  appIcn: {
    height: 100,
    width: 100,
    borderRadius: 20,
    marginLeft: 5,
    elevation: 5,
    shadowColor: '#000000c2',
  },
  getBtn: {
    backgroundColor: '#463ae728',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: 14,
    borderRadius: 40,
    marginRight: 'auto',
  },
  instructionText: {
    fontSize: 15,
    lineHeight: 26,
  },
});
