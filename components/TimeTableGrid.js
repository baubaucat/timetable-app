import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TimeTableGrid({ data, onPressItem}){
    const getSubjectColor = (type) => {
        switch(type){
            case 'general': return '#AEEFFF';
            case 'tech': return '#98FB98';
            case 'special': return '#e0B0FF';
            case 'free': return '#fff';
            default: return '#E0E0E0';
    }
};

    return(
        <View style={styles.gridContainer}>
            {data.map((item, index) => (
                <TouchableOpacity
                    key={index} 
          onPress={() => onPressItem(index)} // 親から預かった関数を実行
          style={[styles.gridItem, { backgroundColor: getSubjectColor(item[1]) }]}
        >
          <Text style={[styles.gridText, {color: item[1] === 'free' ? '#ccc' : '#000'}]}>
            {item[0] === ' ' ? '空き' : item[0]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
    gridContainer: {flexDirection: 'row',flexWrap: 'wrap',marginBottom:30},
    gridItem: {width:'18%',height:60,margin:'1%',justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  gridText: { fontSize: 14, fontWeight: 'bold' },
});