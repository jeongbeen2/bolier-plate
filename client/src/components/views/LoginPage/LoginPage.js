import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../../_actions/user_action';

function LoginPage(props) {
  const dispatch = useDispatch();
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');

  const emailHandler = (event) => {
    setEmail(event.target.value);
  };

  const passwordHandler = (event) => {
    setPassword(event.target.value);
  };

  const submitHandler = (event) => {
    event.preventDefault(); // ? --> page refresh prevent
    let body = {
      email: Email,
      password: Password,
    };
    // redux 사용
    dispatch(loginUser(body)).then((response) => {
      if (response.payload.loginSuccess) {
        props.history.push('/');
      } else {
        alert('Error!');
      }
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100vh',
      }}
    >
      <form
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
        onSubmit={submitHandler}
      >
        <label>Email</label>
        <input type="email" value={Email} onChange={emailHandler} />
        <label>Password</label>
        <input type="password" value={Password} onChange={passwordHandler} />
        <br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginPage;
