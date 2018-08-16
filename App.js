/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, FlatList, Modal, TouchableHighlight } from 'react-native';
import * as firebase from 'firebase';
import t from 'tcomb-form-native';
import Swipeout from 'react-native-swipeout';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';

const Form = t.form.Form;

const User = t.struct({
  apellidos: t.String,
  cedula: t.String,
  nombre: t.String
});

// const options = {
//   fields: {
//     email: {
//       error: 'Without an email address how are you going to reset your password when you forget it?'
//     },
//     password: {
//       error: 'Choose something you use on a dozen other sites or something you won remember'
//     }
//   }
// };

var config = {
  apiKey: "AIzaSyDoFGafzvY8R4nf1BveWfDxjGnZGbIhmAM",
  authDomain: "clinica-dental-c555e.firebaseapp.com",
  databaseURL: "https://clinica-dental-c555e.firebaseio.com",
  projectId: "clinica-dental-c555e",
  storageBucket: "",
  messagingSenderId: "855849329819"
};
firebase.initializeApp(config);

class FlatListItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activeRowKey: null
    }
  }
  render() {
    const swipeSettings = {
      autoClose: true,
      backgroundColor: '#f5f5f0',
      onClose: (secId, rowId, direcction) => {
        if (this.state.activeRowKey != null) {
          this.setState({ activeRowKey: null })
        }
      },
      onOpen: (secId, rowId, direcction) => {
        this.setState({ activeRowKey: this.props.item.key })
      },
      right: [
        {
          onPress: () => {

            firebase.database().ref('pacientes').child(this.props.item.db_key).remove();

            const deletingRow = this.state.activeRowKey
            this.props.list.splice(this.props.index, 1)
            this.props.parentFlatList.refreshList(deletingRow)
          },
          text: 'Delete', type: 'delete'
        },
        {
          onPress: () => {

            firebase.database()
              .ref('pacientes/' + this.props.item.db_key)
              .update({ nombre: 'foo' });
          },
          text: 'Edit', type: 'edit'
        }
      ],
      rowId: this.props.index,
      sectionId: 1
    };
    return (
      <Swipeout {...swipeSettings}>
        <View style={styles.listItemContainer}>
          <Text style={styles.listItem}>
            {this.props.item.nombre}/{this.props.item.cedula}
          </Text>
        </View>
      </Swipeout>
    )
  }
}


type Props = {};
export default class App extends Component<Props> {
  constructor(props) {
    super(props)

    this.state = {
      pacientes: [],
      modalVisible: false,
      deletedRowKey: null
    }

  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  refreshList = (deletedKey) => {
    this.setState((prevState) => {
      return {
        deletedRowKey: deletedKey
      }
    })
  }


  componentDidMount() {

    firebase
      .database()
      .ref()
      .child("pacientes")
      .once("value", snapshot => {
        const data = snapshot.val()
        if (data) {
          this.setState({
            pacientes: Object.keys(data).map(key => {
              data[key]['db_key'] = key
              return data[key]
            })
          })
        }
      });

    firebase
      .database()
      .ref()
      .child("pacientes")
      .on("child_added", snapshot => {
        const data = snapshot.val();
        if (data) {
          this.setState(prevState => ({
            pacientes: [data, ...prevState.pacientes]
          }))
        }
      })
  }


  agregar_paciente = () => {
    const value = this._form.getValue();

    firebase.database().ref()
      .child("pacientes")
      .push()
      .set(value, () => this.setModalVisible(false))
  }

  render() {
    return (
      <View>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}>
          <View style={styles.container_modal}>
            <View>
              <Form
                ref={c => this._form = c}
                type={User}
              />
              <Button
                title="Agregar Paciente"
                onPress={this.agregar_paciente}
              />

              <TouchableHighlight
                onPress={() => {
                  this.setModalVisible(!this.state.modalVisible);
                }}>
                <Text>Regresar</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>

        <FlatList data={this.state.pacientes}
          renderItem={({ item, index }) => {
            return (
              <FlatListItem
                item={item}
                index={index}
                parentFlatList={this}
                list={this.state.pacientes}>
              </FlatListItem>
            );
          }}
        />

        <ActionButton
          buttonColor="rgba(231,76,60,1)"

          onPress={() => {
            this.setModalVisible(true);
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  listItemContainer: {
    backgroundColor: '#fff',
    margin: 5,
    borderRadius: 5
  },
  listItem: {
    fontSize: 20,
    padding: 10
  },
  container_modal: {
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#ffffff'
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  }
});

