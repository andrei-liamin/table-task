import React, { Component } from 'react';

import './App.css';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      sort: {
        key: null,
        toggle: null
      }
    };
  }

  componentDidMount() {
    fetch('http://www.filltext.com/?rows=32&id=%7Bnumber%7C1000%7D&firstName=%7BfirstName%7D&lastName=%7BlastName%7D&email=%7Bemail%7D&phone=%7Bphone%7C(xxx)xxx-xx-xx%7D&address=%7BaddressObject%7D&description=%7Blorem%7C32%7D')
      .then(response => response.json())
      .then(data => this.setState({ data }));
  }

  sortData = (key) => {
    let sortedData = this.state.data;
    sortedData.sort((a, b) => {
      let aKey = a[key];
      let bKey = b[key];
      if (key === "address") {
        aKey = JSON.stringify(a[key]);
        bKey = JSON.stringify(b[key]);
      }
      if (this.state.sort.toggle) {
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
      sort: {
        key: key,
        toggle: !this.state.sort.toggle
      }
    });
  }

  render() {
    const headerContent = [];
    for (let key in this.state.data[0]) {
      headerContent.push(key);
    };
    const header = headerContent.map((headerKey, i) => {
      let toggle = null;
      if (headerKey === this.state.sort.key) {
        toggle = this.state.sort.toggle
      }
      return (<HeaderCell
        headerKey={headerKey}
        sortToggle={toggle}
        sortDataCallback={() => this.sortData(headerKey)} />
      );
    })

    const rows = this.state.data.map((userData, i) => {
        return(<PersonRow key={i} userData={userData} />);
      }
    );

    return (
      <div className="container">
        <table>
          <tbody>
            <tr>
            {header}
            </tr>
            {rows}
          </tbody>
        </table>
      </div >
    );
  }
}

function HeaderCell(props) {
  let toggleSign = '';
  if (props.sortToggle === true) {
    toggleSign = " [v]"
  } else if (props.sortToggle === false) {
    toggleSign = " [^]"
  }

  return (
    <th onClick={() => props.sortDataCallback()}>
      {props.headerKey + toggleSign}
    </th>
  );
}

function PersonRow(props) {
  const userData = props.userData;

  const address = Object.keys(userData.address).map((k, i) => (
    <div key={i}>{k + ': ' + userData.address[k]}</div>)
  );

  return (
  <tr>
    <td>{userData.id}</td>
    <td>{userData.firstName}</td>
    <td>{userData.lastName}</td>
    <td>{userData.email}</td>
    <td>{userData.phone}</td>
    <td>{address}</td>
    <td>{userData.description}</td>
  </tr>
  );
}