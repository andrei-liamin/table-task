import React, { Component } from 'react';
import './App.css';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      sortToggle: true
    };
  }

  componentDidMount() {
    fetch('http://www.filltext.com/?rows=32&id=%7Bnumber%7C1000%7D&firstName=%7BfirstName%7D&lastName=%7BlastName%7D&email=%7Bemail%7D&phone=%7Bphone%7C(xxx)xxx-xx-xx%7D&address=%7BaddressObject%7D&description=%7Blorem%7C32%7D')
      .then(response => response.json())
      .then(data => this.setState({ data }));
  }

  sortData(key) {
    let sortedData = this.state.data;
    sortedData.sort((a, b) => {
      let aKey = a[key];
      let bKey = b[key];
      if(key === "address") {
        aKey = JSON.stringify(a[key]);
        bKey = JSON.stringify(b[key]);
      }
      if (this.state.sortToggle) {
        bKey = [aKey, aKey = bKey][0];
      }
      if (aKey > bKey)
        return 1;
      if (aKey < bKey)
        return -1;
      return 0;
    });
    this.setState({
      data: sortedData,
      sortToggle: !this.state.sortToggle
    });
  }

  render() {
    const header = [];
    for (let key in this.state.data[0]) {
      header.push(key);
    }

    return (
      <div className="container">
        <table>
          <tbody>
            <tr>{header.map((key, i) => (
              <th key={i} onClick={() => this.sortData(key)}>
                {key}
              </th>
            ))}</tr>
            {this.state.data.map((element, i) => {
              const address = Object.keys(element.address).map((k, i) => (
                <div key={i}>{k + ': ' + element.address[k]}</div>)
              )

              return (<tr key={i}>
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
      </div>
    );
  }
}
