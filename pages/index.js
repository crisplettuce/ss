import Image from 'next/image'
import MoralisLogo from '../assets/pblogos/moralis.png'
import IPFSLogo from '../assets/pblogos/ipfs.png'
import PolygonLogo from '../assets/pblogos/polygon.png'
import ChainlinkLogo from '../assets/pblogos/chainlink.png'
import BiconomyLogo from '../assets/pblogos/biconomy.png'
import Mic from '../assets/platform/mic.png'
import UserA from '../assets/platform/userA.png'
import UserB from '../assets/platform/userB.png'
import { useEffect, useState } from 'react'

export default function Home(){
    const[screenSize, setScreenSize] = useState('')

 
    useEffect(()=>{
        setScreenSize( window.innerWidth)
        window.addEventListener("resize", (event) => {
            setScreenSize( window.innerWidth)
        });
    },[screenSize])

    return (
        <div>
            <div style={{display:'grid', height:'100vh', textAlign:'center'}}>
                <div style={{marginTop:'15vh'}}>
                     <h1 style={screenSize > 500 ? {color:'white',fontWeight:'300', fontSize:'10vw'} : {color:'white',fontWeight:'300', fontSize:'14vw'}}> {'{ subspaces }'}</h1>
                     <p style={{color:'white', fontSize:'12px'}}> Voice Broadcasting Platform </p> 
                </div>
               
            </div>

            <div style={{color:'white', display:'grid'}}>
                <div style={{width:'90vw', fontSize:'35px', marginTop:'10vh', padding:'0px 30px', textAlign:'left'}}>
                    <span> Voice your opinion on any topic or idea</span>
                    <p style={{fontSize:'15px', marginTop:'5vh'}}> Make it a quick talking point or thoughtful podcast </p> 
                </div>
                <div style={{width:'50vw', marginLeft:'auto', marginTop:'10vh', transform:'scaleX(-1)'}}>
                    <Image src={Mic}></Image>
                </div>
                   
            </div>

            <div style={{color:'white', display:'grid',  height:'100vh'}}>
                <div style={{width:'90vw', fontSize:'35px', marginTop:'20vh', padding:'0px 20px', textAlign:'right'}}>
                    <span> Listen to what people around the world have to say</span>
                    <p style={{fontSize:'15px', marginTop:'5vh'}}> Free to share ideas without censorship </p> 
                </div>
                <div style={{width:'50vw', marginTop:'10vh', display:'flex',marginLeft:'10vw'}}>
                   <div>
                   <Image src={UserA}></Image>
                   </div>
                   <div style={{marginTop:'-70px'}}>
                   <Image src={UserB}></Image>
                   </div>
                   <div style={{transform:'scaleX(-1)'}}>
                   <Image src={UserA}></Image>
                   </div>
                </div>
            </div>

            <div style={{color:'white', display:'grid',  height:'100vh'}}>
                <div style={{width:'90vw',marginTop:'20vh', padding:'0px 20px', textAlign:'left'}}>
                    <span style={{fontSize:'35px'}}> Built for a Web3 Experience</span>
                    <ul style={{fontSize:'18px', marginTop:'10vh', marginBottom:'10vh'}}>

                        <li> Get Paid 💸 </li>
                        <ul>
                            <li> earn tips for the broadcasts you publish  </li>
                        </ul>

                        <li style={{color:'rgb(11,11,11)'}}> </li>

                        <li> Control your Identity 🔑 </li>
                        <ul>
                            <li> stay anonymous and be known only by your address or define a profile and share what you like  </li>
                        </ul>
          
                    </ul>
                    <div>
                    <p> To get started simply connect with a Polygon account, no additional info required.</p>
                    </div>
                </div>
            </div>

            <div style={{display:'grid', textAlign:'center'}}>
                    <div style={{padding:'20px 20px', color:'gray', marginTop:'10vh'}}>
                        <p> Powered by the best ⚡️</p>
                    </div>

                    <div style={{display:'flex',justifyContent:'center', marginTop:'10vh', marginBottom:'40vh', width:'90vw',justifySelf:'center'}}>
                        <a href="https://www.moralis.io" target="_blank" style={{width:'15vh', marginRight:'5vw'}}>
                            <Image src={MoralisLogo} ></Image>
                        </a>
                        <a href="https://www.polygon.technology/" target="_blank" style={{width:'15vh', marginRight:'5vw'}}>
                            <Image src={PolygonLogo}></Image>
                        </a>
                        <a href="https://www.ipfs.tech/" target="_blank" style={{width:'15vh', marginRight:'5vw'}}>
                            <Image src={IPFSLogo}></Image>
                        </a>
                        <a href="https://www.chain.link" target="_blank" style={{width:'15vh', marginRight:'5vw'}}>
                            <Image src={ChainlinkLogo}></Image>
                        </a>
                        <a href="https://www.biconomy.io/" target="_blank" style={{width:'15vh', marginRight:'5vw'}}>
                            <Image src={BiconomyLogo}></Image>
                        </a>
                    </div>
               
            </div>

        </div>
    )
}
