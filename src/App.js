import './App.css';
import React, { useRef } from 'react';
import { Model } from './entity/Model';
import axios from 'axios';

var model = new Model, currentPage, current_user_email, current_project;
const instance = axios.create({ baseURL: 'https://icki0h6bb0.execute-api.us-east-1.amazonaws.com/Prod/' });

function App() {
  let [redraw, forceRedraw] = React.useState(0)
  if (currentPage == null) currentPage = <Login />

  function Login() {
    const login_box = { position: "absolute", width: 400, height: 380, background: "lightgrey", textAlign: "center", top: "50%", left: "50%", marginLeft: -200, marginTop: -190 }
    const login_title = { position: "absolute", fontSize: "30pt", fontWeight: "bold", width: 400, top: 20, left: 0, textAlign: "center" }
    const login_email_label = { position: "absolute", fontWeight: "bold", top: 100, left: 20, textAlign: "center" }
    const login_email_input = { position: "absolute", width: 220, background: "white", top: 100, left: 150, textAlign: "left" }
    const login_pass_label = { position: "absolute", fontWeight: "bold", top: 150, left: 20, textAlign: "center" }
    const login_pass_input = { position: "absolute", width: 220, background: "white", top: 150, left: 150, textAlign: "left" }
    const login_type_label = { position: "absolute", fontWeight: "bold", top: 200, left: 20, textAlign: "center" }
    const login_type_radio = { position: "absolute", width: 220, top: 200, left: 150, textAlign: "left" }
    const login_button = { position: "relative", fontSize: "16pt", top: 320, width: 200 }

    let input_email = useRef(null)
    let input_password = useRef(null)
    let input_account_type = null

    function handle_button_login() {
      if (document.querySelector('input[name="account_type"]:checked') != null) input_account_type = document.querySelector('input[name="account_type"]:checked')

      if (input_email.current.value == null || input_password.current.value == null || input_account_type.value == null) {
        alert("Fill out all fields before logging in or registering.")
      } else {
        let msg = {}
        msg["email"] = input_email.current.value
        msg["password"] = input_password.current.value
        let dataValue = JSON.stringify(msg)
        let data = { 'body': dataValue }

        current_user_email = input_email.current.value

        if (input_account_type.value == 'designer') {
          instance.post('/loginDesigner', data).then((response) => {
            currentPage = <DesignerListProjects />
            forceRedraw(redraw + 1)
            redraw++
          })
        } else if (input_account_type.value == 'administrator') {
          instance.post('/loginAdministrator', data).then((response) => {
            currentPage = <AdministratorListProjects />
            forceRedraw(redraw + 1)
            redraw++
          })
        } else {
          // login supporter
        }
      }
    }

    return (
      <div className="Login">
        <div id="login-box" style={login_box}>
          <label style={login_title}>LOG IN</label>

          <label style={login_email_label}>email address:</label>
          <input id="email" type="text" ref={input_email} style={login_email_input}></input>

          <label style={login_pass_label}>password:</label>
          <input id="password" type="text" ref={input_password} style={login_pass_input}></input>

          <label style={login_type_label}>account type:</label>
          <div style={login_type_radio}>
            <div> <label><input type="radio" id="supporter" name="account_type" value="supporter"></input>supporter</label> </div>
            <div> <label><input type="radio" id="designer" name="account_type" value="designer"></input>designer</label> </div>
            <div> <label><input type="radio" id="administrator" name="account_type" value="administrator"></input>administrator</label> </div>
          </div>

          <button style={login_button} onClick={handle_button_login}>Login or Register</button>
        </div>
      </div>
    );
  }

  function DesignerListProjects() {
    let msg = {}
    msg["email"] = current_user_email
    let dataValue = JSON.stringify(msg)
    let data = { 'body': dataValue }

    let [entries, setEntries] = React.useState([])

    instance.post('/designerList', data).then((response) => {
      console.log(response)
      if (response != null) {
        let allProjects = JSON.parse(response.data.result)
        console.log(allProjects)
        if (allProjects != undefined) {
          let inner = []
          for (let i = 0; i < allProjects.list.length; i++) {
            let project = allProjects.list[i]
            const entry = (
              <div id="project_box">
                <label onClick={handle_button_view(project.name)}>Name: {project.name}</label><br/>
                <label >Description: {project.description}</label><br/>
                <label >Deadline: {project.deadline}</label><br/>
                <label >Type: {project.type}</label><br/>
                <label >Goal: ${project.goal}</label><br/>
                <label >Designer: {project.entrepreneur}</label><br/>
                <label >---------------------</label><br/>
              </div>
            )
            inner.push(entry)
          }
          setEntries(inner)
        }
      }
    })

    function handle_button_view(project_name_param) {
      current_project = project_name_param
      currentPage = <DesignerViewProject />
      forceRedraw(redraw + 1)
      redraw++
    }

    function handle_button_create() {
      currentPage = <DesignerCreateProject />
      forceRedraw(redraw + 1)
      redraw++
    }

    return (
      <div className="DesignerListProjects">
        <label>Designer List Projects</label><br />
        <label>{current_user_email} 's projects</label><br />
        <label>click project name to view project</label><br />
        <label>------------------</label><br />
        <div>{entries}</div><br />
        <button onClick={handle_button_create}>Create New Project</button><br />
      </div>
    )
  }

  function DesignerCreateProject() {
    let input_name = useRef(null)
    let input_description = useRef(null)
    let input_goal = useRef(null)
    let input_deadline = useRef(null)
    let input_type = useRef(null)

    function handle_button_create() {
      if (input_name.current.value == null || input_goal.current.value <= 0 || input_deadline.current.value == null) {
        alert("Fill out all required fields before creating a new project.")
      } else {
        let msg = {}
        msg["name"] = input_name.current.value
        msg["story"] = input_description.current.value
        msg["designerEmail"] = current_user_email
        msg["type"] = input_type.current.value
        msg["goal"] = input_goal.current.value
        msg["deadline"] = input_deadline.current.value
        msg["successful"] = null
        msg["launched"] = false
        let dataValue = JSON.stringify(msg)
        let data = { 'body': dataValue }

        console.log(data)

        instance.post('/createProject', data).then((response) => {
          currentPage = DesignerListProjects(msg["designerEmail"])
          forceRedraw(redraw + 1)
          redraw++
        })
      }
    }

    return (
      <div className="DesignerCreateProject">
        <label>CREATE A NEW PROJECT</label><br />
        <label>Project Name:<input name="project_name" type="text" ref={input_name} /></label><br />
        <label>Description (optional):<input name="project_description" type="text" ref={input_description} /></label><br />
        <label>Goal: $<input name="project_goal" type="number" ref={input_goal} min="1" default="1" /></label><br />
        <label>Deadline:<input name="project_deadline" type="date" ref={input_deadline} /></label><br />
        <label>Type:<input name="project_type" type="text" ref={input_type} /></label><br />
        <button onClick={handle_button_create}>Create Project</button>
      </div>
    )
  }

  function DesignerViewProject() {
    const info_box = { position: "absolute", width: 800, height: 700, background: "lightgrey", textAlign: "center", top: 50, left: 50, display: "inline-block" }
    const project_name = { position: "relative", fontSize: "40pt", fontWeight: "bold", top: 40 }
    const deadline_box = { position: "absolute", width: 370, height: 85, background: "white", outline: "1px solid black", textAlign: "center", top: 150, left: 20 }
    const deadline_label = { position: "absolute", width: 370, fontSize: "12pt", top: 10, left: 0 }
    const days_label = { position: "absolute", width: 370, fontSize: "20pt", fontWeight: "bold", top: 40, left: 0 }

    const goal_box = { position: "absolute", width: 370, height: 85, background: "white", outline: "1px solid black", textAlign: "center", top: 150, right: 20 }
    const goal_label = { position: "absolute", width: 370, fontSize: "12pt", top: 10, left: 0 }
    const raised_label = { position: "absolute", width: 370, fontSize: "20pt", fontWeight: "bold", top: 40, left: 0 }

    const description_box = { position: "absolute", width: 760, height: 340, background: "white", outline: "1px solid black", textAlign: "center", top: 255, left: 20 }
    const description_label = { position: "absolute", width: 740, height: 320, textAlign: "left", top: 10, left: 10 }
    const designer_label = { position: "absolute", fontSize: "14pt", fontWeight: "bold", bottom: 70, right: 20 }

    const active_label = { position: "absolute", width: 540, fontSize: "20pt", fontWeight: "bold", top: -45, left: 0 }
    const active_pledges_box = { position: "absolute", width: 540, height: 650, background: "lightgrey", textAlign: "center", top: 100, left: 900, display: "inline-block" }
    const pledge_box = { position: "relative", width: 500, height: 100, background: "white", outline: "1px solid black", textAlign: "left", left: 10, top: 10, padding: 10 }
    const pledge_name = { position: "absolute", fontWeight: "bold" }
    const pledge_amount = { position: "absolute", top: 35 }
    const pledge_description = { position: "absolute", top: 60 }

    let msg = {}
    msg["name"] = current_project
    let dataValue = JSON.stringify(msg)
    let data = { 'body': dataValue }

    let [entries, setEntries] = React.useState([])
    let [pledges, setPledges] = React.useState([])

    instance.post('/designerViewProject', data).then((response) => {
      let projectInfo = JSON.parse(JSON.stringify(response.data))
      let temp = {}
      if (response != null) {
        temp.name = response.data.name
        temp.story = response.data.story
        temp.designerEmail = response.data.designerEmail
        temp.type = response.data.type
        temp.goal = response.data.goal
        temp.deadline = response.data.deadline
        temp.activePledges = response.data.activePledges
        temp.directSupports = response.data.directSupports
        temp.successful = response.data.successful
        temp.launched = response.data.launched
      }
      setEntries(temp)

      if (temp.activePledges != null) {
        let inner = []
        for (let i = 0; i < temp.activePledges.length; i++) {
          let pledge = temp.activePledges[i]
          let entry = (
            <div id="pledge_box" style={pledge_box}>
              <label style={pledge_name}>{pledge.name}</label>
              <label style={pledge_amount}>{pledge.amount}</label>
              <label style={pledge_description}>{pledge.description}</label>
            </div>
          )
          inner.push(entry)
        }
        setPledges(inner)
      }
    })
  

    return (
      <div className="DesignerViewProject">
        <div id="info_box" style={info_box}>
          <label style={project_name}>{entries.name}</label>
          <div id="deadline_box" style={deadline_box}>
            <label style={deadline_label}>Project Deadline: {entries.deadline}</label>
            <label style={days_label}>__ DAYS LEFT</label>
          </div>
          <div id="goal_box" style={goal_box}>
            <label style={goal_label}>Project Goal: ${entries.goal}</label>
            <label style={raised_label}>$__ RAISED</label>
          </div>
          <div id="description_box" style={description_box}>
            <label style={description_label}>{entries.story}</label>
          </div>
          <label style={designer_label}><i>By: {entries.designerEmail}</i></label>
        </div>

        <div id="active_pledges_box" style={active_pledges_box}>
          <label style={active_label}>Active Pledges</label>
          <div id="pledges">{pledges}</div>
        </div>
      </div>
    );
  }

  function AdministratorListProjects() {
    let [entries, setEntries] = React.useState([])

    instance.post('/adminList').then((response) => {
      if (response != null) {
        let allProjects = JSON.parse(response.data.result)
        if (allProjects != undefined) {
          let inner = []
          for (let i = 0; i < allProjects.list.length; i++) {
            let project = allProjects.list[i]
            const entry = (
              <div id="project_box">
                <button onClick={() => handle_button_view(project.name)}>Name: {project.name}</button><br/>
                <label >Description: {project.description}</label><br/>
                <label >Deadline: {project.deadline}</label><br/>
                <label >Type: {project.type}</label><br/>
                <label >Goal: ${project.goal}</label><br/>
                <label >Designer: {project.entrepreneur}</label><br/>
                <label >---------------------</label><br/>
              </div>
            )
            inner.push(entry)
          }
          setEntries(inner)
        }
      }
    })

    function handle_button_view(project_name_param) {
      current_project = project_name_param
      currentPage = <DesignerViewProject />
      forceRedraw(redraw + 1)
      redraw++
    }

    return (
      <div className="AdministratorListProjects">
        <label>admin list projects</label><br />
        <label>------------------------</label>
        <div>{entries}</div>
      </div>
    )
  }

  return (
    <div>{currentPage}</div>
  );
}

export default App;
