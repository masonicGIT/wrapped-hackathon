import React, { useState } from "react";
import { Contract } from "@ethersproject/contracts";
import { getDefaultProvider } from "@ethersproject/providers";
import { useQuery } from "@apollo/react-hooks";

import { Body, Button, Header, Image, Link } from "./components";
import logo from "./ethereumLogo.png";
import useWeb3Modal from "./hooks/useWeb3Modal";

import { addresses, abis } from "@project/contracts";
import GET_TRANSFERS from "./graphql/subgraph";

async function readOnChainData() {
/*
  // Should replace with the end-user wallet, e.g. Metamask
  const defaultProvider = getDefaultProvider();
  // Create an instance of an ethers.js Contract
  // Read more about ethers.js on https://docs.ethers.io/v5/api/contract/contract/
  const ceaErc20 = new Contract(addresses.ceaErc20, abis.erc20, defaultProvider);
  // A pre-defined address that owns some CEAERC20 tokens
  const tokenBalance = await ceaErc20.balanceOf("0x3f8CB69d9c0ED01923F11c829BaE4D9a4CB6c82C");
  console.log({ tokenBalance: tokenBalance.toString() });
*/
    const res = await fetch('https://api.nomics.com/v1/currencies/ticker?key=demo-26240835858194712a4f8cc0dc635c7a&ids=WFIL&interval=1d,30d&convert=USD&per-page=100&page=1')
    const wfilPrice = (await res.json())[0].price
    console.dir(wfilPrice)
}

function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  return (
    <Button
	onClick={() => {
          if (!provider) {
            loadWeb3Modal();
          } else {
            logoutOfWeb3Modal();
          }
      }}
    >
    {!provider ? "Connect Wallet" : "Disconnect Wallet"}
    </Button>
  );
}

class Swapper extends React.Component {
    constructor(props) {
	super(props)
	this.state = { isToggleOn: true }
	this.handleClick =  this.handleClick.bind(this)
	this.sushiSwap = "https://lite.sushiswap.fi/#/swap"
        this.uniswap = "https://app.uniswap.org/#/swap?outputCurrency=0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359"
    }

    handleClick() {
	this.setState(state => ({
	    isToggleOn: !state.isToggleOn
	}))
    }
    
    render() {
	return (
	    <div>
		 <iframe
		     src={ this.state.isToggleOn ? this.uniswap : this.sushiSwap }
		     width="100%"
		     height="500"
                     style={{ "border": "0", "margin": "0 auto", "display": "block", "border-radius": "10px", "max-width": "600px", "min-width": "300px" }}
		     frameborder="0"
		     allowfullscreen
		     sandbox
		 >
		 </iframe>

		<button onClick={this.handleClick}>
		    {this.state.isToggleOn ? 'ON' : 'OFF'}
		</button>
	    </div>
	)
    }

}

function App () {
  const { loading, error, data } = useQuery(GET_TRANSFERS);
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();

  const [isActive, setActive] = useState("false")

  const handleToggle = () => {
    setActive(!isActive)
  }

    const [filPrice, setFilPrice] = useState(null)
    const [wfilPrice, setWfilPrice] = useState(null)
    const fetchData = async () => {
	const res = await fetch('https://api.nomics.com/v1/currencies/ticker?key=demo-26240835858194712a4f8cc0dc635c7a&ids=WFIL,FIL&convert=USD&per-page=100&page=1')
	let data = await res.json()
	let filPrice = Number(data[0].price).toFixed(4)
	let wfilPrice = Number(data[1].price).toFixed(4)
	setFilPrice(filPrice)
	setWfilPrice(wfilPrice)
    }


    React.useEffect(() => {
    if (!loading && !error && data && data.transfers) {
	fetchData()
	console.log({ transfers: data.transfers });
    }
  }, [loading, error, data]);

  return (
    <div>
      <Header>
      <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
      </Header>
	<Body>
	    <h2>Filecoin Price: { filPrice }</h2>
	    <h2>Wrapped Filecoin Price: { wfilPrice }</h2>
	    <h3>Percentage Diff: { ((wfilPrice - filPrice)/wfilPrice).toFixed(4)} %</h3>
	    <h3>Price Diff: { ((wfilPrice - filPrice)).toFixed(4)} $</h3>
	    <h3></h3>
	    <Swapper/>
            <Button onClick={() => readOnChainData()}>
		Read On-Chain Balance
            </Button>
      </Body>
    </div>
  );
}

export default App;
