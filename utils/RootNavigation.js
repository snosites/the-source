import * as React from 'react'
import { StackActions } from '@react-navigation/native'

export const isReadyRef = React.createRef()

export const navigationRef = React.createRef()

export function navigate(name, params) {
    if (isReadyRef.current && navigationRef.current) {
        // Perform navigation if the app has mounted
        navigationRef.current.navigate(name, params)
    } else {
        console.warn('navigation has not mounted yet')
        // You can decide what to do if the app hasn't mounted
        // You can ignore this, or add these actions to a queue you can call later
    }
}

export function push(name, params) {
    if (isReadyRef.current && navigationRef.current) {
        // Perform navigation if the app has mounted
        navigationRef.current.dispatch(StackActions.push(name, params))
    } else {
        console.warn('navigation has not mounted yet')
    }
}

export function pop(count = 1) {
    if (isReadyRef.current && navigationRef.current) {
        // Perform navigation if the app has mounted
        navigationRef.current.dispatch(StackActions.pop(count))
    } else {
        console.warn('navigation has not mounted yet')
    }
}
