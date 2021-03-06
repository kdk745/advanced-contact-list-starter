import React, { Component, PropTypes } from 'react';
import ContactList from './ContactList';
import AddedContactList from './AddedContactList';
import SearchBar from './SearchBar';
import SearchBarContainer from './containers/SearchBarContainer';
import ContactForm from './ContactForm';
import axios from 'axios';
import ActionHist from './ActionHist';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      contacts: [],
      addedContacts: [],
      actionHistory: []
    };
  }

  handleSearchBarChange(event) {
    this.setState({
      searchText: event.target.value
    });
  }

  componentDidMount() {
    // axios.get('/contacts')
    //   .then(resp => {
    //     this.setState({
    //       contacts: resp.data,
    //       actionHistory: []
    //     });
    //   });
    this.props.onComponentMount();
    axios.get('/addedContacts')
      .then(resp => {
        this.setState({
          addedContacts: resp.data,
        });
      })
      .catch(err => {
        console.log(`Error! ${err}`);
      });
  }
  popActionItem(attributes) {
    const newActionHist = this.state.actionHistory.filter(action => action._id !== attributes._id);
    newActionHist.pop();
    this.setState({
      actionHistory: newActionHist
    });
  }
  handleChange(event) {
    this.setState({
      searchText: event.target.value
    });
  }

  componentWillMount() {
    console.log('componentWillMount');

  }

  getFilteredContacts() {

    const term = this.state.searchText.trim().toLowerCase();
    const contacts = this.state.contacts;

    if (!term) {
      return contacts;
    }

    return contacts.filter(contact => {
      return contact.name.toLowerCase().indexOf(term) >= 0;
    });
  }

  handleAddContact(attributes) {
    const newAction = {
      _id: Math.random(),
      item: 'added new contact'
    };
    axios.post('http://localhost:3001/contacts', attributes)
      .then(resp => {
        this.setState({
          contacts: [...this.state.contacts, resp.data],
          actionHistory: [...this.state.actionHistory, newAction]
        });
      })
      .catch(err => console.log(err));
  }


  addContact(attributes) {
    const newContacts = this.state.contacts.filter(contact => contact._id !== attributes._id);
    const newAction = {
      _id: Math.random(),
      item: 'added contact'
    };
    axios.post('/addedContacts', attributes)
      .then(resp => {
        this.setState({
          contacts: newContacts,
          addedContacts: [...this.state.addedContacts, resp.data],
          actionHistory: [...this.state.actionHistory, newAction]
        });
      });
    axios.delete(`/contacts/${attributes._id}`);
  }

  reset() {
    const all = [...this.state.contacts, ...this.state.addedContacts];
    const empty = [];
    axios({
      method: 'post',
      url: '/contacts',
      contacts: {all}
    });
    for (const added of this.state.addedContacts) {
      axios.delete(`/addedContacts/${added._id}`);
    }
    this.setState({
      contacts: all,
      addedContacts: empty
    });

  }

  popContact(contact) {
    const visContacts = [...this.state.contacts];
    visContacts[contact - 1].active = 'none';
    this.setState({
      contacts: visContacts
    });
  }

  removeContact(attributes) {
    const id = attributes._id;
    const newContacts = this.state.addedContacts.filter(contact => contact._id !== attributes._id);
    const newAction = {
      _id: Math.random(),
      item: 'removed contact'
    };
    axios.delete(`/addedContacts/${id}`)
      .then(resp => {
        this.setState({
          addedContacts: newContacts,
          contacts: [...this.state.contacts, attributes],
          actionHistory: [...this.state.actionHistory, newAction]
        });
      })
      .catch(err => console.log(`ERROR! ${err}`));
  }


  render() {
    return (

      <div className="App">
        <SearchBarContainer />
        <ContactForm
          onSubmit={this.handleAddContact.bind(this)}
        />
        <SearchBar
          value={this.state.searchText}
          onChange={this.handleSearchBarChange.bind(this)}
        />
        <button onClick={() => this.reset()}>Reset</button>
        <ContactList
          onContactClick={this.addContact.bind(this)}
          contacts={this.props.contacts}
          search={this.state.searchText}
        />
        <h2>Added Contacts</h2>
        <AddedContactList
          onContactClick={this.removeContact.bind(this)}
          contacts={this.state.addedContacts}
          search={this.state.searchText}
        />
        <h2>Action History</h2>
        <ActionHist
          onBtnClick={this.popActionItem.bind(this)}
          actionHistory={this.state.actionHistory}
        />
      </div>

    );
  }
}

export default App;

App.propTypes = {
  onComponentMount: PropTypes.func.isRequired,
};
