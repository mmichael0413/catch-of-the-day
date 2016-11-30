import React from 'react';
import AddFishForm from './AddFishForm';
import base from '../base';

class Inventory extends React.Component {
  constructor() {
    super();
    this.renderInventory = this.renderInventory.bind(this);
    this.authenticate = this.authenticate.bind(this);
    this.authHandler = this.authHandler.bind(this);
    this.logout = this.logout.bind(this);
    this.renderLogin = this.renderLogin.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      uid: null,
      owner: null
    }
  }

  componentDidMount() {
    base.onAuth((user) => {
      if (user) {
        this.authHandler(null, {user});
      }
    });
  }

  authenticate(provider) {
    base.authWithOAuthPopup(provider, this.authHandler);
  }

  authHandler(err, authData) {
    if (err) {
      console.log(err);
      return;
    } else {
      const storeRef = base.database().ref(this.props.storeId);

      storeRef.once('value', (snapshot) => {
        const data = snapshot.val() || {};
        // assign owner to user if none exists
        if (!data.owner) {
          storeRef.set({
            owner: authData.user.uid
          });
        }

        this.setState({
          uid: authData.user.uid,
          owner: data.owner || authData.user.uid
        });
      });
    }
  }

  logout() {
    base.unauth();
    this.setState({ uid: null });
  }

  handleChange(event, key) {
    const fish = this.props.fishes[key];
    // get copy of current state
    const updatedFish = {
      ...fish,
      [event.target.name]: event.target.value
    };
    this.props.updateFish(key, updatedFish);
  }

  renderInventory(key) {
    const fish = this.props.fishes[key];
    return(
      <div className="fish-edit" key={key}>
        <input type="text" name="name" value={fish.name} placeholder="Fish name" 
          onChange={(event) => this.handleChange(event, key)} />
        <input type="text" name="price" value={fish.price} placeholder="Fish price" 
          onChange={(event) => this.handleChange(event, key)} />
        <select name="status" value={fish.status} onChange={(event) => this.handleChange(event, key)} >
          <option value="available">Fresh!</option>
          <option value="unavailable">Sold Out!</option>
        </select>
        <textarea name="desc" value={fish.desc} placeholder="Fish description" 
          onChange={(event) => this.handleChange(event, key)} />
        <input type="text" name="image" value={fish.image} placeholder="Fish image" 
          onChange={(event) => this.handleChange(event, key)} />
        <button onClick={() => this.props.removeFish(key)}>Remove fish</button>
      </div>
    )
  }

  renderLogin() {
    return(
      <nav className="login">
        <h2>Inventory</h2>
        <p>Sign in to manage your store's inventory</p>
        <button className="github" onClick={() => this.authenticate('github')}>
          Login with GitHub
        </button>
        <button className="facebook" onClick={() => this.authenticate('facebook')}>
          Login with Facebook
        </button>
        <button className="twitter" onClick={() => this.authenticate('twitter')}>
          Login with Twitter
        </button>
      </nav>
    )
  }

  render() {
    // don't need `() => {this.logout}` since logout is not getting any arguments
    const logout = <button onClick={this.logout}>Log out</button>;

    // check if user is not logged in
    if (!this.state.uid) {
      return(
        <div>{this.renderLogin()}</div>
      )
    }
    // check if user is owner of the store
    if (this.state.uid !== this.state.owner) {
      return(
        <div>
          <p>Sorry, you're not the owner of this store</p>
          {logout}
        </div>
      )
    }

    return(
      <div>
        <h2>Inventory</h2>
        {logout}
        {Object.keys(this.props.fishes).map(this.renderInventory)}
        <AddFishForm addFish={this.props.addFish} />
        <button onClick={this.props.loadSamples}>Load sample fishes</button>
      </div>
    )
  }
}

Inventory.propTypes = {
  fishes: React.PropTypes.object.isRequired,
  addFish: React.PropTypes.func.isRequired,
  removeFish: React.PropTypes.func.isRequired,
  updateFish: React.PropTypes.func.isRequired,
  loadSamples: React.PropTypes.func.isRequired,
  storeId: React.PropTypes.string.isRequired
}

export default Inventory;