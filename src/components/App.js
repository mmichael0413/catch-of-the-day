import React from 'react';
import Header from './Header';
import Inventory from './Inventory';
import Order from './Order';
import Fish from './Fish';
import sampleFishes from '../sample-fishes';
import base from '../base';

class App extends React.Component {
  constructor() {
    super();
    this.addFish         = this.addFish.bind(this);
    this.updateFish      = this.updateFish.bind(this);
    this.removeFish      = this.removeFish.bind(this);
    this.addToOrder      = this.addToOrder.bind(this);
    this.removeFromOrder = this.removeFromOrder.bind(this);
    this.loadSamples     = this.loadSamples.bind(this);
    // get initial state
    this.state = { fishes: {}, order: {} };
  }

  componentWillMount() {
    // this runs right before <App> is rendered
    this.ref = base.syncState(`${this.props.params.storeId}/fishes`, {
      context: this,
      state: 'fishes'
    });

    // check if there is an order in localStorage
    const localStorageRef = localStorage.getItem(`order-${this.props.params.storeId}`);

    if (localStorageRef) {
      // update our App component's Order state
      this.setState({
        order: JSON.parse(localStorageRef)
      });
    }
  }

  componentWillUnmount() {
    // this runs right after <App> is rendered
    base.removeBinding(this.ref);
  }

  componentWillUpdate(nextProps, nextState) {
    // this runs right before the <App> component is changed in any way
    localStorage.setItem(`order-${this.props.params.storeId}`, JSON.stringify(nextState.order));
  }

  addFish(fish) {
    // get fishes from initial state
    const fishes = {...this.state.fishes}; // `...` does a splat on an object
    // add the fish to the state
    const timestamp = Date.now();
    fishes[`fish-${timestamp}`] = fish;
    // set the new state
    this.setState({ fishes });
  }

  updateFish(key, updatedFish) {
    const fishes = {...this.state.fishes};
    fishes[key] = updatedFish;
    this.setState({ fishes });
  }

  removeFish(key) {
    const fishes = {...this.state.fishes};
    fishes[key] = null;
    this.setState({ fishes });
  }

  addToOrder(key) {
    const order = {...this.state.order};
    order[key] = order[key] + 1 || 1;
    this.setState({ order });
  }

  removeFromOrder(key) {
    const order = {...this.state.order};
    delete order[key];
    this.setState({ order });
  }

  loadSamples() {
    this.setState({
      fishes: sampleFishes
    });
  }

  render() {
    return(
      <div className="catch-of-the-day">
        <div className="menu">
          <Header tagline="Fresh Seafood Market" />
          <ul className="list-of-fishes">
            {
              Object.keys(this.state.fishes).map(
                key => <Fish key={key} index={key} details={this.state.fishes[key]}
                             addToOrder={this.addToOrder}
                             removeFromOrder={this.removeFromOrder} />
                             // key must be unique for React
                             // {this.props.key} is reserved for React so I'm passing index
              )
            }
          </ul>
        </div>
        <Order
          fishes={this.state.fishes}
          order={this.state.order}
          params={this.props.params}
          removeFromOrder={this.removeFromOrder} />
        <Inventory
          addFish={this.addFish}
          updateFish={this.updateFish}
          removeFish={this.removeFish}
          loadSamples={this.loadSamples}
          fishes={this.state.fishes}
          storeId={this.props.params.storeId} />
      </div>
    )
  }
}

App.propTypes = {
  params: React.PropTypes.object.isRequired
}

export default App;