import {useEffect, useState} from 'react'
import { ImImages} from "react-icons/im";
import { useSelector, useDispatch } from 'react-redux';
import { setBroadcastWindow } from '../state/slice';


// [Experimental/ToAdd - For displaying media content (image/video/tweet) to go alongside broadcast for added depth]
export default function ContextButton({arg}){

    const [expand, setExpand] = useState(false);
    const dispatch = useDispatch();

    return(
    <div style={{display:'inline'}}>
    <button style={{cursor:'pointer', marginRight:'1vw',color:'black'}} onClick={()=>{setExpand(true), dispatch(setBroadcastWindow(true))}}><ImImages/></button>
    {
        expand === false ? 
        null
        :
        
        <dialog open style={{backgroundColor:'rgb(20,20,21)', display:'relative', zIndex:'1', marginTop:'2vh', borderTop:'0px', height:'50vh', width:'96vw'}}>
        
        <div style={{height:'40vh'}}>
        <iframe src={arg} title="W3Schools Free Online Web Tutorials" height='100%' width="100%">
          <p> Context Could not Be loaded </p>
        </iframe>
          
        </div>
        <div >    

        <button onClick={()=>{setExpand(false), dispatch(setBroadcastWindow(false))}}>x</button>
        <button style={{backgroundColor:'rgb(20,20,21)', color:'white', border:'0px', fontSize:'15px'}}> Context </button> 

        </div>
        </dialog>
    
    }
    </div>
    )
}
