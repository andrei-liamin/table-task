import React, { Component } from 'react';

import './App.css';
import validate from "validate.js";

const AppLoadingState = {
  beforeFirstLoad: 1, // show only source selector
  loading: 2, // show that it loads something
  loaded: 3, // show the table
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingState: AppLoadingState.beforeFirstLoad,
      data: [],
      sort: {
        key: null,
        toggle: null
      },
      pageNumber: 1,
      rowsPerPage: 50,
      filter: '',
      activePersonData: null
    };
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

  filterByString = (e) => {
    this.setState({
      pageNumber: 1,
      filter: e.target.value.toLowerCase()
    })
  }

  addNewRow = (newRow) => {
    newRow.address = {};
    newRow.description = null;

    const newData = this.state.data.slice();
    newData.unshift(newRow);
    this.setState({
      data: newData,
      pageNumber: 1
    })
  }

  setSourceType = (e) => {
    const small = 'http://www.filltext.com/?rows=32&id=%7Bnumber%7C1000%7D&firstName=%7BfirstName%7D&lastName=%7BlastName%7D&email=%7Bemail%7D&phone=%7Bphone%7C(xxx)xxx-xx-xx%7D&address=%7BaddressObject%7D&description=%7Blorem%7C32%7D';
    const big = 'http://www.filltext.com/?rows=1000&id={number|1000}&firstName={firstName}&delay=3&lastName={lastName}&email={email}&phone={phone|(xxx)xxx-xx-xx}&address={addressObject}&description={lorem|32}';
    const selectedSource = (e.target.value === 'small') ? small : big;

    fetch(selectedSource)
      .then(response => response.json())
      .then(data => this.setState({ data, loadingState: AppLoadingState.loaded }));
    this.setState({
      loadingState: AppLoadingState.loading
    });
  }

  render() {
    const sourceSelectorGroup = (
      <div onChange={this.setSourceType}>
        <h2>select source type:</h2>
        <input type="radio" value="small" name="sourceType" /> small
        <input type="radio" value="BIG" name="sourceType" /> BIG
      </div>
    );
    if (this.state.loadingState === AppLoadingState.beforeFirstLoad) {
      return sourceSelectorGroup;
    } else if (this.state.loadingState === AppLoadingState.loading) {
      return (
        <div>
          <p>I am working on fetching the data from the server...</p>
          <div>
            <h3>this page is still responsive. you can click on this radio buttons:</h3>
            <input type="radio" value="1" name="sourceType" /> 1
            <input type="radio" value="2" name="sourceType" /> 2
          </div>
        </div>);
    } // below is Loaded state

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

    const filteredData = this.state.data.filter((row) => {
      return (JSON.stringify(Object.values(row)).toLowerCase().includes(this.state.filter))
    })
    const pages = Math.ceil(filteredData.length / this.state.rowsPerPage);
    const endIndex = this.state.pageNumber * this.state.rowsPerPage
    const startIndex = endIndex - this.state.rowsPerPage;
    const rowsPage = filteredData.slice(startIndex, endIndex);
    const rows = rowsPage.map((personData, i) => {
      return (
        <PersonRow
          key={i}
          setActiveRowCallback={(personData) => this.setState({ activePersonData: personData })}
          personData={personData} />);
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
      <div className="container">
        {sourceSelectorGroup}
        <NewRow
          className="new-row"
          addNewRowCallback={this.addNewRow} />
        <div className="filter">
          <input
            onChange={(e) => this.filterByString(e)}
            placeholder="Search" ></input>
        </div>
        <div className="navigation">
          {navigation()}
        </div>
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
        <ActivePersonCard activePersonData={this.state.activePersonData} />
      </div >
    );
  }
}

class NewRow extends React.Component {
  constraints = {
    id: {
      numericality: {
        onlyInteger: true,
        greaterThan: 0,
        notValid: "must be positive integer"
      },
      presence: true,
    },
    firstName: {
      presence: true,
    },
    lastName: {
      presence: true,
    },
    email: {
      email: true,
      presence: true,
    },
    phone: {
      presence: true,
      format: {
        pattern: /\(\d\d\d\)\d\d\d-\d\d\d\d/,
        message: "has to be like:(993)001-3064",
      },
    },
  };

  constructor(props) {
    super(props);

    const newNewRow = {
      id: null,
      firstName: null,
      lastName: null,
      email: null,
      phone: null
    };
    this.state = {
      newRow: newNewRow,
      validateResult: validate(newNewRow, this.constraints),
      formDisplay: false
    };
  }

  handleInputChange = (e) => {
    const newNewRow = JSON.parse(JSON.stringify(this.state.newRow));
    newNewRow[e.target.name] = e.target.value

    this.setState({
      newRow: newNewRow,
      validateResult: validate(newNewRow, this.constraints)
    });
  }

  render() {
    const addNewRowForm = this.state.formDisplay ? (
      <div>
        <ul>
          <li>ID <input name="id" onChange={(e) => this.handleInputChange(e)} />
            {(this.state.validateResult) ? this.state.validateResult.id : " V"}
          </li>
          <li>First Name <input name="firstName" onChange={(e) => this.handleInputChange(e)} />
            {(this.state.validateResult) ? this.state.validateResult.firstName : " V"}
          </li>
          <li>Last Name <input name="lastName" onChange={(e) => this.handleInputChange(e)} />
            {(this.state.validateResult) ? this.state.validateResult.lastName : " V"}
          </li>
          <li>Email <input name="email" onChange={(e) => this.handleInputChange(e)} />
            {(this.state.validateResult) ? this.state.validateResult.email : " V"}
          </li>
          <li>Phone <input name="phone" onChange={(e) => this.handleInputChange(e)} />
            {(this.state.validateResult) ? this.state.validateResult.phone : " V"}
          </li>
        </ul>
        <button
          disabled={this.state.validateResult !== undefined}
          onClick={() => this.props.addNewRowCallback(this.state.newRow)} >
          Add in the Table
        </button>
      </div>
    ) : (<div></div>);

    return (
      <div>
        <button onClick={() => { this.setState({ formDisplay: !this.state.formDisplay }) }}>Show/hide add new Person form</button>
        {addNewRowForm}
      </div>
    );
  }
}

function ActivePersonCard(props) {
  const { activePersonData } = props;

  let content = null;
  if (activePersonData === null) {
    content = <p>no selected user</p>;
  } else {
    content = (<ul>
      <li>Выбран пользователь <b>{activePersonData.firstName + ' ' + activePersonData.lastName}</b></li>
      <li>Описание:<textarea value={activePersonData.description} readOnly={true} /></li>
      <li>Адрес проживания: <b>{activePersonData.address.streetAddress}</b></li>
      <li>Город: <b>{activePersonData.address.city}</b></li>
      <li>Провинция/штат: <b>{activePersonData.address.state}</b></li>
      <li>Индекс: <b>{activePersonData.address.zip}</b></li>
    </ul>);
  }
  return (
    <div className="row-value">
      {content}
    </div>
  );
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
  const { personData } = props;

  const address = Object.keys(personData.address).map((k, i) => (
    <div key={i}>{k + ': ' + personData.address[k]}</div>)
  );

  return (
    <tr onClick={() => props.setActiveRowCallback(personData)}>
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