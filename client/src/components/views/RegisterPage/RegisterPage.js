import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { registerUser } from '../../../_actions/user_action';

function RegisterPage(props) {
  const dispatch = useDispatch();
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const [Name, setName] = useState('');
  const [ConfirmPassword, setConfirmPassword] = useState('');

  const emailHandler = (event) => {
    setEmail(event.target.value);
  };

  const nameHandler = (event) => {
    setName(event.target.value);
  };
  const passwordHandler = (event) => {
    setPassword(event.target.value);
  };

  const confirmPasswordHandler = (event) => {
    setConfirmPassword(event.target.value);
  };

  const submitHandler = (event) => {
    event.preventDefault(); // ? --> page refresh prevent
    if (Password !== ConfirmPassword) {
      return alert('비밀번호가 같지 않습니다.');
    }
    let body = {
      email: Email,
      name: Name,
      password: Password,
    };
    // redux 사용
    dispatch(registerUser(body)).then((response) => {
      if (response.payload.success) {
        props.history.push('/login');
      } else {
        alert('Failed to sign up!');
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
        <label>Name</label>
        <input type="text" value={Name} onChange={nameHandler} />
        <label>Password</label>
        <input type="password" value={Password} onChange={passwordHandler} />
        <label>Confirm Password</label>
        <input
          type="password"
          value={ConfirmPassword}
          onChange={confirmPasswordHandler}
        />
        <br />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegisterPage;
