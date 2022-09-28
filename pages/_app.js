import '../styles/globals.css'
import { WagmiConfig, createClient, chain } from "wagmi";
import { ConnectKitProvider, ConnectKitButton, getDefaultClient } from "connectkit";
import Header from '../components/header'
import { Provider } from 'react-redux';
import store from '../components/state/store'

// Mumbai Key
const alchemyId = 'RaE87BYUbEikldKC0TenwQmvq065F7BI';

const chains = [chain.polygonMumbai];

const client = createClient(
  getDefaultClient({
    appName: "TestApp",
    alchemyId,
    chains,
  }),
);

function MyApp({ Component, pageProps }) {
  return(
    <Provider store={store}>
    <WagmiConfig client={client}>
    <ConnectKitProvider>
      <Header/>
      <Component {...pageProps} />
    </ConnectKitProvider>
  </WagmiConfig>
  </Provider>
   
  )
}

export default MyApp
