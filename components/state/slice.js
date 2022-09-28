import { createSlice } from '@reduxjs/toolkit'

// Global State Slice

export const gSlice = createSlice({ 
    name: 'gState', 
        initialState: {  
            broadcastingWindow: false,
            demoVersion:false
        },  
        reducers: {    
            setBroadcastWindow: (state, action) => {
                state.broadcastingWindow = action.payload
            },
            setDemoVersion: (state, action) => {
                state.demoVersion = action.payload
            }
            
        },
 })
export const {setBroadcastWindow, setDemoVersion} = gSlice.actions
export default gSlice.reducer

  