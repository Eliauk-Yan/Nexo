import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons'

interface NetworkProps {
  title?: string
  onReload: () => void
}

export default function NetworkError(props: NetworkProps) {
  const title = props.title || '抱歉，网络连接出错了！'
  const { onReload } = props

  return (
    <View style={styles.container}>
      <SimpleLineIcons name={'drawer'} size={160} color={'#ddd'} />
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity style={styles.reload} onPress={() => onReload()}>
        <Text style={styles.label}>重新加载</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#999',
  },
  reload: {
    marginTop: 10,
    backgroundColor: '#1f99b0',
    height: 40,
    borderRadius: 4,
    paddingLeft: 10,
    paddingRight: 10,
  },
  label: {
    color: '#fff',
    lineHeight: 40,
  },
})
