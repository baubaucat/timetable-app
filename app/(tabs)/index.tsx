import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// ★アイコンを使うために追加
import { AntDesign, Feather } from '@expo/vector-icons';

import Header from '../../components/Header';
import TimeTableGrid from '../../components/TimeTableGrid';

const DEFAULT_TIMETABLE = [
  ['微分', 'general'], ['空き', 'free'], ['国語', 'general'], ['ゼミ', 'special'], ['空き', 'free'],
  ['空き', 'free'], ['材料', 'tech'], ['IT', 'tech'], ['ゼミ', 'special'], ['体育', 'general'],
  ['英語', 'general'], [' ', 'free'], ['電気', 'tech'], [' ', 'free'], [' ', 'free'],
  [' ', 'free'], [' ', 'free'], [' ', 'free'], [' ', 'free'], [' ', 'free'],
];

const DEFAULT_TASKS = [
  { id: 1, subject: '国語', title: 'プレゼン資料', daysLeft: 0, deadline: '2/15' },
  { id: 2, subject: '英語', title: 'レポート課題', daysLeft: 2, deadline: '2/17' },
];

export default function App() {
  const [timeTable, setTimeTable] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 読み込み ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedTimeTable = await AsyncStorage.getItem('my_timetable');
        setTimeTable(savedTimeTable ? JSON.parse(savedTimeTable) : DEFAULT_TIMETABLE);
        const savedTasks = await AsyncStorage.getItem('my_tasks');
        setTasks(savedTasks ? JSON.parse(savedTasks) : DEFAULT_TASKS);
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };
    loadData();
  }, []);

  // --- 保存 ---
  useEffect(() => {
    if (!isLoading && timeTable.length > 0) AsyncStorage.setItem('my_timetable', JSON.stringify(timeTable));
  }, [timeTable, isLoading]);
  useEffect(() => {
    if (!isLoading) AsyncStorage.setItem('my_tasks', JSON.stringify(tasks));
  }, [tasks, isLoading]);

  // --- 時間割編集 ---
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

  // --- 課題管理 ---
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDays, setNewDays] = useState('');

  const getTaskColor = (days) => {
    if (days <= 1) return '#FFCCBC';
    if (days <= 3) return '#E0F7FA';
    return '#C8E6C9';
  };
  const getBorderColor = (days) => (days <= 1 ? 'red' : 'transparent');

  const addTask = () => {
    if (!newSubject || !newTitle || !newDays) { Alert.alert("エラー", "入力してください"); return; }
    const newTask = { id: Date.now(), subject: newSubject, title: newTitle, daysLeft: parseInt(newDays), deadline: '未定' };
    setTasks([...tasks, newTask]);
    setNewSubject(''); setNewTitle(''); setNewDays(''); setTaskModalVisible(false);
  };

  const completeTask = (id) => {
    Alert.alert("完了", "課題を削除しますか？", [{ text: "キャンセル" }, { text: "削除", style: 'destructive', onPress: () => setTasks(tasks.filter((t) => t.id !== id)) }]);
  };

  if (isLoading) return <View style={{flex:1, justifyContent:'center'}}><Text>Loading...</Text></View>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.toggleContainer}>
          <Text style={[styles.toggleText, {color: '#333', fontWeight:'bold'}]}>📅 今学期の時間割</Text>
        </View>

        <TimeTableGrid data={timeTable} onPressItem={openTimeTableEditor} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📝 課題リスト</Text>
        </View>

        <View style={styles.taskList}>
          {tasks.map((task) => (
            <View 
              key={task.id} 
              style={[
                styles.taskCard, 
                { backgroundColor: getTaskColor(task.daysLeft), borderColor: getBorderColor(task.daysLeft), borderWidth: task.daysLeft <= 1 ? 2 : 0 }
              ]}
            >
              <View style={{flex:1}}>
                <Text style={styles.taskSubject}>{task.subject}</Text>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.deadline}>残り: {task.daysLeft}日</Text>
              </View>
              
              {/* ★ゴミ箱アイコンを追加 */}
              <TouchableOpacity onPress={() => completeTask(task.id)} style={styles.deleteButton}>
                <Feather name="trash-2" size={24} color="#FF5252" />
              </TouchableOpacity>
            </View>
          ))}
          {tasks.length === 0 && (
            <View style={styles.emptyState}>
              <Feather name="smile" size={50} color="#ccc" />
              <Text style={styles.noTaskText}>課題はありません！</Text>
            </View>
          )}
        </View>

        <View style={styles.footerButtons}>
          {/* ★アイコン付きのボタンに変更 */}
          <TouchableOpacity style={[styles.bigButton, styles.addButton]} onPress={() => setTaskModalVisible(true)}>
            <AntDesign name="pluscircleo" size={24} color="white" style={{marginRight: 10}} />
            <Text style={[styles.buttonText, {color:'white'}]}>課題追加</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.bigButton, styles.viewButton]}>
            <Feather name="list" size={24} color="#333" style={{marginRight: 10}} />
            <Text style={styles.buttonText}>全課題</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* --- モーダル類 --- */}
      <Modal animationType="slide" transparent={true} visible={taskModalVisible} onRequestClose={() => setTaskModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>新しい課題</Text>
            <TextInput style={styles.input} placeholder="科目名 (例: 数学)" value={newSubject} onChangeText={setNewSubject} />
            <TextInput style={styles.input} placeholder="内容 (例: p.30の問題)" value={newTitle} onChangeText={setNewTitle} />
            <TextInput style={styles.input} placeholder="あと何日？ (数字のみ)" keyboardType="numeric" value={newDays} onChangeText={setNewDays} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor:'#eee'}]} onPress={() => setTaskModalVisible(false)}><Text>キャンセル</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor:'#333'}]} onPress={addTask}><Text style={{color:'white', fontWeight:'bold'}}>追加する</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" transparent={true} visible={editModalVisible} onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>編集メニュー</Text>
            <TextInput style={styles.input} value={editSubject} onChangeText={setEditSubject} placeholder="科目名" />
            <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:20}}>
               <TouchableOpacity onPress={() => setEditType('general')} style={[styles.colorBtn, {backgroundColor: '#AEEFFF', borderWidth: editType==='general'?2:0}]}><Text style={{fontSize:10}}>一般</Text></TouchableOpacity>
               <TouchableOpacity onPress={() => setEditType('tech')} style={[styles.colorBtn, {backgroundColor: '#98FB98', borderWidth: editType==='tech'?2:0}]}><Text style={{fontSize:10}}>専門</Text></TouchableOpacity>
               <TouchableOpacity onPress={() => setEditType('special')} style={[styles.colorBtn, {backgroundColor: '#E0B0FF', borderWidth: editType==='special'?2:0}]}><Text style={{fontSize:10}}>特別</Text></TouchableOpacity>
               <TouchableOpacity onPress={() => setEditType('free')} style={[styles.colorBtn, {backgroundColor: '#fff', borderWidth: 1, borderColor:'#ccc'}]}><Text style={{fontSize:10}}>空き</Text></TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor:'#eee'}]} onPress={() => setEditModalVisible(false)}><Text>キャンセル</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor:'#333'}]} onPress={saveTimeTableEntry}><Text style={{color:'white', fontWeight:'bold'}}>保存</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 30 }, // 背景を少しグレーに
  scrollContent: { padding: 20, paddingBottom: 100 },
  toggleContainer: { flexDirection: 'row', marginBottom: 15 },
  toggleText: { fontSize: 20, fontWeight: 'bold' },
  sectionHeader: { marginTop: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#555' },
  taskList: { gap: 12, marginBottom: 30 },
  taskCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  taskSubject: { fontSize: 14, color: '#555', marginBottom: 2 },
  taskTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  deadline: { fontSize: 12, color: '#777' },
  deleteButton: { padding: 10 },
  emptyState: { alignItems: 'center', padding: 20 },
  noTaskText: { textAlign: 'center', fontSize: 16, marginTop: 10, color: '#aaa' },
  footerButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  bigButton: { width: '48%', padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  addButton: { backgroundColor: '#333' }, // 黒いボタンでカッコよく
  viewButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  buttonText: { fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '85%', backgroundColor: 'white', padding: 25, borderRadius: 20, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#f0f0f0', padding: 12, marginBottom: 15, borderRadius: 8, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalButton: { flex: 1, padding: 12, alignItems: 'center', marginHorizontal: 5, borderRadius: 8 },
  colorBtn: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
});