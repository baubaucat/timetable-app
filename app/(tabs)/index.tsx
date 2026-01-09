import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// 初期データはコンポーネントの外に出しておきます（読み込み用）
const DEFAULT_TIMETABLE = [
  ['微分', 'general'], ['空き', 'free'], ['国語', 'general'], ['ゼミ', 'special'], ['空き', 'free'],
  ['空き', 'free'], ['材料', 'tech'], ['IT', 'tech'], ['ゼミ', 'special'], ['体育', 'general'],
  ['英語', 'general'], [' ', 'free'], ['電気', 'tech'], [' ', 'free'], [' ', 'free'],
  [' ', 'free'], [' ', 'free'], [' ', 'free'], [' ', 'free'], [' ', 'free'],
];

const DEFAULT_TASKS = [
  { id: 1, subject: '国語', title: 'プレゼン資料', daysLeft: 0, deadline: '2/15' },
  { id: 2, subject: '英語', title: 'レポート課題', daysLeft: 2, deadline: '2/17' },
  { id: 3, subject: '電気', title: 'レポート課題', daysLeft: 5, deadline: '2/20' },
];

export default function App() {
  // ★変更点1：最初は「空っぽ」でスタートさせます。
  // これで「起動直後の上書き」を防ぎます。
  const [timeTable, setTimeTable] = useState([]);
  const [tasks, setTasks] = useState([]);
  
  // 読み込み中かどうかを管理するフラグ
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. 起動時に一度だけ動く「読み込み」処理 ---
  useEffect(() => {
    const loadData = async () => {
      try {
        // 時間割の読み込み
        const savedTimeTable = await AsyncStorage.getItem('my_timetable');
        if (savedTimeTable) {
          setTimeTable(JSON.parse(savedTimeTable)); // 保存データがあればそれを使う
        } else {
          setTimeTable(DEFAULT_TIMETABLE); // なければデフォルトを使う
        }

        // 課題の読み込み
        const savedTasks = await AsyncStorage.getItem('my_tasks');
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        } else {
          setTasks(DEFAULT_TASKS);
        }
      } catch (error) {
        console.error("読み込み失敗", error);
      } finally {
        // 読み込みが終わったらフラグを下ろす
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // --- 2. データが変わったら動く「保存」処理 ---
  
  // 時間割の保存（★変更点2：読み込みが終わって、データがある時だけ保存する）
  useEffect(() => {
    if (!isLoading && timeTable.length > 0) {
      AsyncStorage.setItem('my_timetable', JSON.stringify(timeTable));
    }
  }, [timeTable, isLoading]);

  // 課題の保存
  useEffect(() => {
    if (!isLoading) { // 課題は0個になっても保存したいので length チェックは外す
       AsyncStorage.setItem('my_tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoading]);


  // ---------------- 以下は機能部分（変更なし） ----------------

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [targetIndex, setTargetIndex] = useState(null);
  const [editSubject, setEditSubject] = useState('');
  const [editType, setEditType] = useState('general');

  const openTimeTableEditor = (index) => {
    const item = timeTable[index];
    setTargetIndex(index);
    setEditSubject(item[0]);
    setEditType(item[1]);
    setEditModalVisible(true);
  };

  const saveTimeTableEntry = () => {
    const newTimeTable = [...timeTable];
    newTimeTable[targetIndex] = [editSubject, editType];
    setTimeTable(newTimeTable);
    setEditModalVisible(false);
  };

  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDays, setNewDays] = useState('');

  const getSubjectColor = (type) => {
    switch (type) {
      case 'general': return '#AEEFFF';
      case 'tech': return '#98FB98';
      case 'special': return '#E0B0FF';
      case 'free': return '#fff';
      default: return '#E0E0E0';
    }
  };

  const getTaskColor = (days) => {
    if (days <= 1) return '#FFCCBC';
    if (days <= 3) return '#E0F7FA';
    return '#C8E6C9';
  };

  const getBorderColor = (days) => {
    if (days <= 1) return 'red';
    return 'transparent';
  };

  const addTask = () => {
    if (!newSubject || !newTitle || !newDays) {
      Alert.alert("エラー", "全ての項目を入力してください");
      return;
    }
    const newTask = {
      id: Date.now(),
      subject: newSubject,
      title: newTitle,
      daysLeft: parseInt(newDays),
      deadline: '未定'
    };
    setTasks([...tasks, newTask]);
    setNewSubject('');
    setNewTitle('');
    setNewDays('');
    setTaskModalVisible(false);
  };

  const completeTask = (id) => {
    Alert.alert(
      "課題の完了",
      "この課題を完了にして削除しますか？",
      [
        { text: "キャンセル", style: "cancel" },
        { text: "完了！", onPress: () => setTasks(tasks.filter((t) => t.id !== id)) }
      ]
    );
  };

  // ★読み込み中は白い画面を出しておく（変な動きを防ぐため）
  if (isLoading) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View style={styles.menuIcon}><Text style={{fontSize:20}}>≡</Text></View>
        <Text style={styles.headerTitle}>カレンダー</Text>
        <TouchableOpacity style={styles.editButton}>
          <Text>編集</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.toggleContainer}>
          <Text style={[styles.toggleText, {color: 'green', fontWeight:'bold'}]}>週表示</Text>
          <Text style={styles.toggleText}> / 日表示</Text>
        </View>

        <View style={styles.gridContainer}>
          {timeTable.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => openTimeTableEditor(index)}
              style={[styles.gridItem, { backgroundColor: getSubjectColor(item[1]) }]}
            >
              <Text style={[styles.gridText, {color: item[1] === 'free' ? '#ccc' : '#000'}]}>
                {item[0] === ' ' ? '空き' : item[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.taskList}>
          {tasks.map((task) => (
            <TouchableOpacity 
              key={task.id} 
              onPress={() => completeTask(task.id)}
              style={[
                styles.taskCard, 
                { backgroundColor: getTaskColor(task.daysLeft), borderColor: getBorderColor(task.daysLeft), borderWidth: task.daysLeft <= 1 ? 2 : 0 }
              ]}
            >
              <View>
                <Text style={styles.taskSubject}>{task.subject}</Text>
                <Text style={styles.taskTitle}>{task.title}</Text>
              </View>
              <View style={{alignItems: 'flex-end'}}>
                <Text style={[styles.daysLeft, { backgroundColor: task.daysLeft <= 1 ? '#FF8A80' : 'transparent' }]}>
                  あと <Text style={{fontWeight:'bold', fontSize:18}}>{task.daysLeft}日</Text>
                </Text>
                <Text style={styles.deadline}>提出期限 {task.deadline}</Text>
              </View>
            </TouchableOpacity>
          ))}
          {tasks.length === 0 && <Text style={styles.noTaskText}>現在の課題はありません！🎉</Text>}
        </View>

        <View style={styles.footerButtons}>
          <TouchableOpacity style={styles.bigButton} onPress={() => setTaskModalVisible(true)}>
            <Text style={styles.buttonText}>+課題追加</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bigButton}>
            <Text style={styles.buttonText}>全課題を見る</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* --- モーダル類 --- */}
      <Modal animationType="slide" transparent={true} visible={taskModalVisible} onRequestClose={() => setTaskModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>新しい課題を追加</Text>
            <TextInput style={styles.input} placeholder="科目名" value={newSubject} onChangeText={setNewSubject} />
            <TextInput style={styles.input} placeholder="課題内容" value={newTitle} onChangeText={setNewTitle} />
            <TextInput style={styles.input} placeholder="あと何日？" keyboardType="numeric" value={newDays} onChangeText={setNewDays} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor:'#ccc'}]} onPress={() => setTaskModalVisible(false)}><Text>キャンセル</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor:'#98FB98'}]} onPress={addTask}><Text style={{fontWeight:'bold'}}>保存</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" transparent={true} visible={editModalVisible} onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>時間割を編集</Text>
            <Text style={{marginBottom:5}}>科目名:</Text>
            <TextInput 
              style={styles.input} 
              value={editSubject} 
              onChangeText={setEditSubject}
              placeholder="科目名を入力"
            />
            <Text style={{marginBottom:5}}>色のタイプ:</Text>
            <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:20}}>
              <TouchableOpacity onPress={() => setEditType('general')} style={[styles.colorBtn, {backgroundColor: '#AEEFFF', borderWidth: editType==='general'?2:0}]}><Text style={{fontSize:10}}>一般</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setEditType('tech')} style={[styles.colorBtn, {backgroundColor: '#98FB98', borderWidth: editType==='tech'?2:0}]}><Text style={{fontSize:10}}>専門</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setEditType('special')} style={[styles.colorBtn, {backgroundColor: '#E0B0FF', borderWidth: editType==='special'?2:0}]}><Text style={{fontSize:10}}>特別</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setEditType('free')} style={[styles.colorBtn, {backgroundColor: '#fff', borderWidth: 1, borderColor:'#ccc'}]}><Text style={{fontSize:10}}>空き</Text></TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor:'#ccc'}]} onPress={() => setEditModalVisible(false)}><Text>キャンセル</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor:'#98FB98'}]} onPress={saveTimeTableEntry}><Text style={{fontWeight:'bold'}}>変更を保存</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 30 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  menuIcon: { width: 40, height: 40, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  editButton: { borderWidth: 1, padding: 5, paddingHorizontal: 10 },
  toggleContainer: { flexDirection: 'row', marginBottom: 10 },
  toggleText: { fontSize: 18 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 30 },
  gridItem: { width: '18%', height: 60, margin: '1%', justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  gridText: { fontSize: 14, fontWeight: 'bold' },
  taskList: { gap: 10, marginBottom: 30 },
  taskCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderRadius: 5, alignItems: 'center' },
  taskSubject: { fontSize: 16 },
  taskTitle: { fontSize: 18, fontWeight: 'bold' },
  daysLeft: { fontSize: 16, marginBottom: 5 },
  deadline: { fontSize: 14 },
  noTaskText: { textAlign: 'center', fontSize: 18, marginTop: 10, color: '#888' },
  footerButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  bigButton: { width: '48%', borderWidth: 2, padding: 15, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalButton: { flex: 1, padding: 10, alignItems: 'center', marginHorizontal: 5, borderRadius: 5 },
  colorBtn: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
});