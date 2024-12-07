import { StyleSheet, View, Text } from 'react-native';

export default function Home() {
  return (
    <>
      <View style={styles.container}>
        <Text>I am a Heading</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
