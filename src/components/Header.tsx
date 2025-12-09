import { StyleSheet, Text, View, Pressable } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import CheckIcon from '../../assets/icons/Checkmark';
import InfoBtn from '../../assets/icons/InfoBtn';

interface HeaderProps {
  onDone?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onDone }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quote Widget Pro</Text>
      <View style={styles.LeftSection}>
        <Pressable onPress={() => navigation.navigate('InfoPage' as never)}>
          <InfoBtn size={35} bg="#ffffffaf" iconColor="#000" />
        </Pressable>
        <Pressable onPress={onDone}>
          <View style={styles.doneBtn}>
            <CheckIcon size={20} color="#fff" />
            <Text style={{ color: '#fff' }}>Done</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 10,
    marginHorizontal: 15,
  },
  LeftSection: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 2,
  },
  doneBtn: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 14,
    backgroundColor: '#201868ff',
    borderRadius: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textShadowColor: '#ffffffa6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
});
