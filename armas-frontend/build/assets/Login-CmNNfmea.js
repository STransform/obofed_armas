import{r as c,a1 as v,a2 as j,j as e,a5 as C}from"./index-T-6qnOdo.js";import{g as N,c as p,d as i,f as x,a as m}from"./index.esm-ClsMiQVo.js";import{C as y,a as k,b as E}from"./CForm-o-NAh3lE.js";import{C as h,a as g}from"./CInputGroupText-BKFi1c-j.js";const S=()=>{const[s,u]=c.useState({username:"",password:""}),[l,o]=c.useState(""),r=v(),{loginAction:f}=j(),b=async t=>{if(t.preventDefault(),o(""),!s.username||!s.password){o("Please enter both username and password");return}try{const a=await f(s);console.log("User roles after login:",a),a.includes("ADMIN")?r("/charts"):a.includes("USER")||a.includes("SENIOR_AUDITOR")||a.includes("ARCHIVER")||a.includes("APPROVER")||a.includes("MANAGER")?r("/charts/"):r("/#")}catch(a){const n=a.message||"Login failed. Please try again.";o(n),console.error("Login error:",a)}},d=t=>{const{name:a,value:n}=t.target;u(w=>({...w,[a]:n}))};return e.jsxs("div",{style:{backgroundColor:"#2B547E",minHeight:"100vh",position:"relative",overflow:"hidden"},children:[e.jsx("style",{children:`
          .login-form {
            width: 700px;
            margin: 100px auto;
            background-image: linear-gradient(30deg, #13223f, #0e1a30);
            border-radius: 50%;
            position: relative;
          }
          .login-form::before {
            content: "";
            background-color: gold;
            position: absolute;
            display: block;
            height: 100%;
            width: 100%;
            border-radius: 50%;
            z-index: -1;
            animation: 3.2s cresent linear infinite alternate;
          }
          .login-card {
            margin-bottom: 15px;
            background: linear-gradient(DarkSlateGray, red);
            box-shadow: none;
            padding: 30px;
            border: 20px outset rgba(51, 153, 0, 0.65);
            border-radius: 100%;
            color: white;
            -webkit-box-shadow: -10px 10px 20px rgba(255, 255, 255, 0.9);
          }
          .login-btn {
            font-size: 15px;
            font-weight: bold;
            min-height: 40px;
            width: 120px;
            border-top-right-radius: 100px;
            border-bottom-left-radius: 100px;
            border-top-left-radius: 100px;
            border-bottom-right-radius: 100px;
            background-color: green;
          }
          .form-control {
            border-bottom-left-radius: 100px;
            border-top-right-radius: 100px;
          }
          .form-control.password {
            border-top-left-radius: 100px;
            border-bottom-right-radius: 100px;
            border-bottom-left-radius: 0;
            border-top-right-radius: 0;
          }
          .ocean {
            height: 120px;
            width: 100%;
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            overflow-x: hidden;
          }
          .wave {
            background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M800 56.9c-155.5 0-204.9-50-405.5-49.9-200 0-250 49.9-394.5 49.9v31.8h800v-.2-31.6z' fill='white'/%3E%3C/svg%3E");
            position: absolute;
            width: 200%;
            height: 100%;
            animation: wave 10s -3s linear infinite;
            transform: translate3d(0, 0, 0);
            opacity: 0.8;
          }
          .wave:nth-of-type(2) {
            bottom: 0;
            animation: wave 18s linear reverse infinite;
            opacity: 0.5;
          }
          .wave:nth-of-type(3) {
            bottom: 0;
            animation: wave 20s -1s linear infinite;
            opacity: 0.5;
          }
          @keyframes wave {
            0% { transform: translateX(0); }
            50% { transform: translateX(-25%); }
            100% { transform: translateX(-50%); }
          }
          @keyframes cresent {
            0% {
              transform: translate(-30px, 30px) scale(0.9);
              box-shadow: -20px 20px 20px rgba(255, 0, 0, 1);
            }
            50% {
              transform: translate(0px, 0px) scale(1.02);
              box-shadow: 0 0 10px #f9f3f2, 0 0 80px 8px #c7938b;
              background-color: #efdbd8;
            }
            100% {
              transform: translate(30px, -30px) scale(0.9);
              box-shadow: -20px 20px 20px rgba(255, 0, 0, 1);
            }
          }
          @media (max-width: 400px) {
            .login-form {
              width: 360px;
            }
            .login-card {
              padding: 20px;
            }
          }
        `}),e.jsx(N,{className:"login-form",children:e.jsx(p,{className:"justify-content-center",children:e.jsx(i,{md:8,children:e.jsx(y,{className:"login-card",children:e.jsx(k,{children:e.jsxs(E,{onSubmit:b,children:[e.jsx("h4",{className:"text-center",children:"IRMS"}),l&&e.jsx("p",{className:"text-danger text-center",style:{marginLeft:"40px"},children:l}),e.jsxs(h,{className:"mb-3",children:[e.jsx(g,{children:e.jsx("i",{className:"fa fa-user"})}),e.jsx(x,{placeholder:"Enter Email Here",name:"username",value:s.username,onChange:d,autoComplete:"username",className:"form-control",required:!0})]}),e.jsxs(h,{className:"mb-4",children:[e.jsx(g,{children:e.jsx("i",{className:"fa fa-lock"})}),e.jsx(x,{name:"password",value:s.password,onChange:d,type:"password",placeholder:"Enter Password Here",autoComplete:"current-password",className:"form-control password",required:!0})]}),e.jsxs(p,{children:[e.jsx(i,{xs:6,children:e.jsxs(m,{type:"submit",className:"login-btn",children:[e.jsx("i",{className:"fas fa-sign-in-alt"})," Login"]})}),e.jsx(i,{xs:6,className:"text-right",children:e.jsx(C,{to:"/login",children:e.jsx(m,{color:"link",className:"px-0",style:{color:"white"},children:"Forgot password?"})})})]})]})})})})})}),e.jsxs("div",{className:"ocean",children:[e.jsx("div",{className:"wave"}),e.jsx("div",{className:"wave"}),e.jsx("div",{className:"wave"})]})]})};export{S as default};
