import {StyleSheet, Text, View} from 'react-native';

const Market = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>NFT市场</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    title: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    }
});

export default Market;
