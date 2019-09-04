import React, { Component } from 'react'
import style from './css/recent.css'
import admin from "./images/1024x1024.png"
import sjx from "./images/sjx.png"
import GroupAvatar from "./GroupAvatar"
import store from '../store'
import {getchatSelect} from '../store/actionCreator'
const { engine } = require('@lk/LK-C')
const chatManager = engine.ChatManager
const Application = engine.Application
const lkApp = Application.getCurrentApp()
const remote = require('electron').remote
const {Menu, MenuItem} = remote
import { Link, Route ,withRouter} from 'react-router-dom'
class RecentItem extends Component {
  constructor(props) {
    super(props)
    this.user = lkApp.getCurrentUser()
    this.state = store.getState()
    this.selected = ''
    store.subscribe(()=>this.setState(store.getState()))
  }
  async menuBar (chatId, isGroupChat, MessageCeiling,focus,user) {
    if (event.button === 2) {
      const menu = new Menu()
      const Message =  MessageCeiling
      menu.append(new MenuItem({
        label:Message?'取消置顶':'🔝置顶',
         click() {
          if (Message) {
             chatManager.asyMessageCeiling(null,user.id, chatId)
          }else {
             chatManager.asyMessageCeiling(Date.now(),user.id, chatId)
          }
        },
      }))
      menu.append(new MenuItem({type: 'separator'}))
      menu.append(new MenuItem({
        label:focus===1?'取消特别提醒':'⭐特别提醒',
         click() {
          if (focus===1) {
             chatManager.asyMessageFocus(2,user.id, chatId)
          }else {
             chatManager.asyMessageFocus(1,user.id, chatId)
          }
        },
      }))
      menu.append(new MenuItem({type: 'separator'}))
      menu.append(new MenuItem({
        label: '删除',
         click() {
           chatManager.asyDeleteChat({chatId})
        },
        visible: this.isGroup !== 1
      }))
      menu.popup({ window: remote.getCurrentWindow() })
    }
  }
  componentDidMount() {
    const {id,chatName,memberCount} = this.props
    chatManager.on('chatChange', this.chatChangeListener)
    if (this.props.chatTop=== this.props.id) {
      //this.chatSelect(id,chatName,memberCount)
      this.refs[this.props.id].click()
    }
    // const data = {
    //   id:this.props.id,
    //   chatName:this.props.chatName,
    //   memberCount:this.props.memberCount
    // }
    // if (this.props.chatTop === this.props.id) {
    //   this.props.history.push({pathname:'/',query:data})
    // }


  }
  componentWillUnmount() {
    this.setState = () => {}
    chatManager.un('chatChange', this.chatChangeListener)
  }
  chatChangeListener = async({param})=> {
    const {chatId} = param
    if (chatId === this.props.id) {
      const {focus} =  await chatManager.asyGetChat(this.user.id, chatId)
      const newMsgNum =await chatManager.asyGetNewMsgNum(chatId)
      console.log({newMsgNum})
      this.setState({
        focus:focus,
        newMsgNum
      })

    }
  }

  preventDefault() {
    event.preventDefault()
  }
  chatSelect (id,chatName,memberCount) {
    chatManager.asyReadMsgs(id)
    const { isGroup} = this.props
    // const data =  {id,chatName,memberCount}
    // this.props.history.push({pathname:'/',query:data})
    const action = getchatSelect({id,chatName,memberCount,isGroup})
    store.dispatch(action)
    this.setState({
      backgroundColor:'rgb(238, 239, 239)'
    })
    //this.props.parentChatSelect({id,chatName,memberCount})
  }
  render() {
    const { MessageCeiling, activeTime, avatar, chatName, id, isGroup, memberCount, msgContent, ownerUserId, reserve1, senderUid, state ,index} = this.props
    const focus = this.state.focus || this.props.focus
    const newMsgNum = this.state.newMsgNum === undefined ? this.props.newMsgNum : this.state.newMsgNum
    const isNewMsgNum = newMsgNum ? <div className={style.newMsgNum}>{newMsgNum >= 99 ? '99+' : newMsgNum}</div> : ''
    return (
      <div id={id} ref={id} style={{backgroundColor:this.state.backgroundColor}} className={style.recent_L1}   onMouseDown={this.preventDefault.bind(this)}  onContextMenu={this.preventDefault.bind(this)} onClick={() => {
        this.chatSelect(id,chatName,memberCount)
      }} onMouseUp={this.menuBar.bind(this,id, isGroup, MessageCeiling,focus,this.user)}>
        <div className={style.recent_L2}/>
        {/*<img src={this.imgMapObj} className={style.recent_L3}/>&nbsp;&nbsp;*/}
        {avatar.length > 1 ?<GroupAvatar imgMapObj = {avatar} /> : <img src={avatar} className={style.recent_L3}/> }&nbsp;&nbsp;
        <div className={style.react_L4}>
          <div className={style.react_L5}>
            <span title="收到消息会弹出窗口">{focus === 1 ? '⭐' : ''}</span>
            {chatName}
          </div>
          <div className={style.react_L6}>{activeTime}</div>
          <div className={style.react_L7}>{msgContent}</div>
        </div>
        <img src={sjx} style={{visibility: MessageCeiling?'visible':'hidden'}} className={style.react_L8}/>
        <div className={style.newMsgNum} style={{visibility: newMsgNum?'visible':'hidden'}}>{newMsgNum >= 99 ? '99+' : newMsgNum}</div>
      </div>
    )
  }
}

export default withRouter(RecentItem)
