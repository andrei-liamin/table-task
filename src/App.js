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
      },
      pageNumber: 1,
      rowsPerPage: 5
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
      },
      pageNumber: 1
    });
  }

  showPage = (pageNumber, pages) => {
    if (pageNumber === "-" && this.state.pageNumber > 1) {
      this.setState({
        pageNumber: this.state.pageNumber - 1
      })
    } else if (pageNumber === "+" && this.state.pageNumber < pages) {
      this.setState({
        pageNumber: this.state.pageNumber + 1
      })
    } else if (Number.isInteger(pageNumber)) {
      this.setState({
        pageNumber: pageNumber
      })
    }
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
        key={i}
        headerKey={headerKey}
        sortToggle={toggle}
        sortDataCallback={() => this.sortData(headerKey)} />
      );
    })

    const pages = Math.ceil(this.state.data.length / this.state.rowsPerPage);
    const endIndex = this.state.pageNumber * this.state.rowsPerPage
    const startIndex = endIndex - this.state.rowsPerPage;
    const rowsPage = this.state.data.slice(startIndex, endIndex);
    const rows = rowsPage.map((personData, i) => {
      return (<PersonRow key={i} personData={personData} />);
    });
    const pagesCount = [];
    for (let i = 1; i <= pages; i++) {
      pagesCount.push(i);
    }
    const navigation = () => {
      const pageButtons = pagesCount.map((pageNumber, i) => {
        const navButtonStyle = this.state.pageNumber === pageNumber ? "active-nav-button" : "";
        return (
          <button
            className={navButtonStyle}
            key={i}
            onClick={() => this.showPage(pageNumber, pages)} >
            {pageNumber}
          </button>
        )
      })
      return (
        <div>
          <button
            onClick={() => this.showPage("-", pages)} >
            Prev
        </button>
          {pageButtons}
          <button
            onClick={() => this.showPage("+", pages)} >
            Next
        </button>
        </div>
      );
    }

    return (
      <div className="container" >
        <div className="navigation">{navigation()}</div>
        <table>
          <tbody>
            <tr>
              {header}
            </tr>
            {rows}
          </tbody>
        </table>
        <div className="navigation">
          {navigation()}
        </div>
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
  const personData = props.personData;

  const address = Object.keys(personData.address).map((k, i) => (
    <div key={i}>{k + ': ' + personData.address[k]}</div>)
  );

  return (
    <tr>
      <td>{personData.id}</td>
      <td>{personData.firstName}</td>
      <td>{personData.lastName}</td>
      <td>{personData.email}</td>
      <td>{personData.phone}</td>
      <td>{address}</td>
      <td>{personData.description}</td>
    </tr>
  );
}