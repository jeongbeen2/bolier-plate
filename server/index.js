const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const config = require('./config/key');
const { auth } = require('./middleware/auth');
const { User } = require('./models/User');
// const cors = require('cors');

// ? body-parser 대체
// application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// application/json
app.use(express.json());
app.use(cookieParser());
// app.use(cors());
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('MongoDB Connected....'))
  .catch((err) => console.log(err));

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/api/hello', (req, res) => res.send('hello~~'));

// ? register route 생성하기
app.post('/api/users/register', (req, res) => {
  // 회원가입할때 필요한 정보를 client에서 보내주면, DB에 넣어주기
  const user = new User(req.body);
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({ success: true });
  }); //--> mongoDB의 method. user data를 받아서 user에 저장한다
});

// ? login route 생성하기
app.post('/api/users/login', (req, res) => {
  // 요청된 이메일을 데이터베이스에서 있는지 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: '제공된 이메일에 해당하는 유저가 없습니다.',
      });
    }
    // 만약 있다면 이메일과 비밀번호가 같은지 확인.
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: '비밀번호가 틀렸습니다.',
        });
      // 비밀번호까지 같다면, 유저를 위한 Token을 생성. npm i jsonwebtoken
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        // user에 토큰이 담겨서 오게된다.
        // 토큰을 저장한다. 어디에? --> 쿠키, 로컬스토리지 등등.. 여기서는 쿠키로 함.
        // cookie parser
        res
          .cookie('x_auth', user.token) // --> cookie를 넣을때 x_auth라는 이름으로 넣어준다.
          .status(200)
          .json({ loginSuccess: true, userId: user._id }); // --> 개발창 -> Application -> cookie로 키/벨류가 들어간다.
      });
    });
  });
});

// ? auth(인증) route 생성하기
app.get('/api/users/auth', auth, (req, res) => {
  // 미들웨어를 성공적으로 다 통과를 했다는 의미.
  // -> Authentication이 true라는 말.
  res.status(200).json({
    _id: req.user._id, // --> user를 할 수 있는 이유는, auth에서 user를 보내줬기 때문.
    isAdmin: req.user.role === 0 ? false : true, // --> role이 0이면 기본값, 1이면 관리자로 설정해줬기 때문.
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

// ? 로그아웃할때는 DB에서 토큰을 지워버리면 된다.
// ? 로그인이 된것을 확인하는 기능은 클라이언트가 토큰을 보내서 DB와 같으면 유저의 권한을 주는 것이기 때문.
// ? logout route 생성하기
app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user.id }, { token: '' }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({ success: true });
  });
});

const port = 5000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
