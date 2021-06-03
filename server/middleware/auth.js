const { User } = require('../models/User');
let auth = (req, res, next) => {
  // 인증 처리를 하는곳.
  // 1. client 쿠키에서 토큰을 가져온다.
  let token = req.cookies.x_auth;

  // 2. 토큰을 복호화하고, 유저를 찾는다.
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user) return res.json({ isAuth: false, error: true });
    req.token = token;
    req.user = user;
    next(); // --> next()하는 이유는,
    // app.get('api/users/auth', auth, (req, res) => { })
    // 에서 auth 다음의 함수로 넘어갈 수 있게 해주는것.
    // 또한, req.token와 user를 집어넣어줘서 req에서 token과 res를 사용할 수 있게함.
  });
  // 3. 유저가 있으면 인증 O
  // 4. 유저가 없으면 인증 X
};

module.exports = { auth };
