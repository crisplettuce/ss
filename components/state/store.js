import { configureStore } from '@reduxjs/toolkit'
import sliceReducer from './slice.js'

export default configureStore({ 
     reducer: {
         gState: sliceReducer,
     },
})

