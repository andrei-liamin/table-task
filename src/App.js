import React, { Component } from 'react';
import './App.css';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  componentDidMount() {
    fetch('http://www.filltext.com/?rows=32&id=%7Bnumber%7C1000%7D&firstName=%7BfirstName%7D&lastName=%7BlastName%7D&email=%7Bemail%7D&phone=%7Bphone%7C(xxx)xxx-xx-xx%7D&address=%7BaddressObject%7D&description=%7Blorem%7C32%7D')
      .then(response => response.json())
      .then(data => this.setState({ data }));
  }

  render() {
    const header = [];
    for (let key in this.state.data[0]) {
      header.push(key);
    }

    return (
      <table>
        <tr>{header.map((element, i) => (<th>{element}</th>))}</tr>
        <tbody>
          {this.state.data.map((element, i) => {
            let address = [];
            address = Object.keys(element.address).map((k) => (
              <tr key={`k=${k}`}>{k + ': ' + element.address[k]}</tr>)
            )

            return (<tr key={`id=${element.id}`}>
              <td>{element.id}</td>
              <td>{element.firstName}</td>
              <td>{element.lastName}</td>
              <td>{element.email}</td>
              <td>{element.phone}</td>
              <td>{address}</td>
              <td>{element.description}</td>
            </tr>);
          })}
        </tbody>
      </table>
    );
  }
}
