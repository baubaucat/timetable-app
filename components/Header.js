import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// ★ アイコンセットを読み込みます
import { Feather } from '@expo/vector-icons';

export default function Header() {
  return (
    <View style={styles.header}>
      {/* メニューアイコン */}
      <TouchableOpacity style={styles.iconButton}>
        <Feather name="menu" size={24} color="#333" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>My時間割</Text>

      {/* 編集アイコン (文字の代わりにアイコンを表示) */}
      <TouchableOpacity style={styles.iconButton}>
        <Feather name="edit-3" size={24} color="#333" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20,
    paddingHorizontal: 10 // 少し横に隙間を作りました
  },
  headerTitle: { 
    fontSize: 24, // 少し控えめなサイズに
    fontWeight: 'bold',
    color: '#333'
  },
  iconButton: {
    padding: 10, // タップしやすいように判定を広げる
  }
});