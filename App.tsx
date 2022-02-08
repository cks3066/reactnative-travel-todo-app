import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { theme } from "./colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fontisto } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";

const STORAGE_KEY_TODOS = "@toDos";
const STORAGE_KEY_WORKING = "@working";

export default function App() {
  const [working, setWorking] = useState(Boolean);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [changeText, setChangeText] = useState("");
  const [targetKey, setTargetKey] = useState("");

  useEffect(() => {
    loadToDos();
    loadWorking();
  }, []);

  useEffect(() => {
    saveWorking(working);
  }, [working]);

  const travel = () => {
    setWorking(false);
  };
  const work = () => {
    setWorking(true);
  };
  const onChangeText = (payload) => {
    setText(payload);
  };
  const onChangeChangeText = (payload) => {
    setChangeText(payload);
  };
  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(toSave));
    } catch {}
  };
  const loadToDos = async () => {
    try {
      const toDos = await AsyncStorage.getItem(STORAGE_KEY_TODOS);
      if (toDos) {
        setToDos(JSON.parse(toDos));
      }
    } catch {}
  };
  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, confirm: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const deleteToDo = (key) => {
    Alert.alert("Delete To Do", "Are you sure?", [
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const newToDos: any = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
      { text: "Cancle" },
    ]);
  };
  const confirmToDo = (key) => {
    Alert.alert("Complete To Do", "Are you sure?", [
      {
        text: "Complete",
        onPress: () => {
          const newToDos: any = { ...toDos };
          newToDos[key].confirm = true;
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
      { text: "Cancle", style: "destructive" },
    ]);
  };
  const changeToDo = (key) => {
    setModalVisible(true);
    setTargetKey(key);
  };
  const _changeToDo = (key) => {
    const newToDos: any = { ...toDos };
    newToDos[key].text = changeText;
    setToDos(newToDos);
    saveToDos(newToDos);
    setChangeText("");
    setTargetKey("");
    setModalVisible(false);
  };
  const saveWorking = async (toSave: Boolean) => {
    try {
      AsyncStorage.setItem(STORAGE_KEY_WORKING, toSave.toString());
    } catch {}
  };
  const loadWorking = async () => {
    try {
      const loaded: string = await AsyncStorage.getItem(STORAGE_KEY_WORKING);
      setWorking(JSON.parse(loaded));
    } catch {}
  };

  return (
    <View style={styles.container}>
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={{ flexDirection: "row" }}>
              <TextInput
                style={{
                  backgroundColor: "white",
                  width: "85%",
                  marginRight: 8,
                  borderRadius: 24,
                  paddingHorizontal: 12,
                  marginVertical: 7,
                }}
                placeholder="Change Text"
                value={changeText}
                onChangeText={onChangeChangeText}
                onSubmitEditing={() => {
                  _changeToDo(targetKey);
                }}
              />
              <View>
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => _changeToDo(targetKey)}
                >
                  <Text style={styles.textStyle}>Change</Text>
                </Pressable>
                <Pressable
                  style={{
                    ...styles.button,
                    ...styles.buttonClose,
                    backgroundColor: theme.delete,
                  }}
                  onPress={() => setModalVisible(false)}
                >
                  <Text
                    style={{
                      ...styles.textStyle,
                    }}
                  >
                    Cancle
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              ...styles.buttonText,
              color: working ? "white" : theme.gray,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.buttonText,
              color: !working ? "white" : theme.gray,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        returnKeyType="done"
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        value={text}
        placeholder={working ? "Add a To Do" : "Where do you want to do"}
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View
              style={{
                ...styles.toDo,
                backgroundColor: !toDos[key].confirm
                  ? theme.toDoBg
                  : theme.confirm,
              }}
              key={key}
            >
              <Text style={styles.toDoText}>{toDos[key].text}</Text>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity onPress={() => changeToDo(key)}>
                  <MaterialIcons
                    style={{ paddingRight: 12 }}
                    name="input"
                    size={16}
                    color="#dfe6e9"
                  />
                </TouchableOpacity>
                {!toDos[key].confirm && (
                  <TouchableOpacity onPress={() => confirmToDo(key)}>
                    <Fontisto
                      style={{ paddingRight: 12 }}
                      name="check"
                      size={16}
                      color={theme.check}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => deleteToDo(key)}>
                  <Fontisto name="trash" size={16} color={theme.delete} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    marginTop: 100,
    justifyContent: "space-between",
  },
  buttonText: {
    color: "white",
    fontSize: 36,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 28,
    marginVertical: 20,
    fontSize: 16,
  },
  toDo: {
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    width: "80%",
    margin: 20,
    backgroundColor: "#2d3436",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 5,
    elevation: 2,
    margin: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 12,
    textAlign: "center",
    color: "white",
  },
});
