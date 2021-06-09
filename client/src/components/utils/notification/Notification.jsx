import React from 'react'
import './Notification.scss'
export const showErrMsg = (msg) => {
    return <div className="errMsg">{msg}</div>
}

export const showSuccessMsg = (msg) => {
    return <div className="successMsg">{msg}</div>
}