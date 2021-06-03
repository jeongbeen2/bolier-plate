const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true, // -> space를 제거해주는 역할. ex) hello world@naver.com -> helloworld@naver.com
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    // token의 유효기간
    type: Number,
  },
});

userSchema.pre('save', function (next) {
  // --> pre 메소드는 'save'라는 것이 시작되기 전에 진행하는 메소드
  // 비밀번호를 암호화 시킨다.
  // npm i bcrypt
  // https://www.npmjs.com/package/bcrypt
  var user = this; // --> userSchema에서 데이터를 가져오는 방법.
  if (user.isModified('password')) {
    //--> password가 변할때 이 메소드를 실행한다.
    bcrypt.genSalt(saltRounds, function (err, salt) {
      // --> generate Salt로, bcrypt에서 제공하는 메소드.
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function (err, hash) {
        // --> hash => 암호화된 비밀번호
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});
// ? comparePassword function create
userSchema.methods.comparePassword = function (plainPassword, cb) {
  // plainPassword 123123456 암호화된 비밀번호 $2b$10$C/wyf23ofF8KHTvNWHWMZOcY80AePoHWqlgdgTf6ZbmMj/CLW5co2
  // 둘이 같은지 체크헤야함. -> 복호화는 어렵기때문에, 저 비밀번호도 암호화해서 비교.
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    // --> compare는 mongoDB에서 제공하는 함수.
    if (err) return cb(err);
    cb(null, isMatch); // --> 에러자리에 null을 넣어주어 에러가 없는것을 확인.
  });
};
// ? generateToken function create
userSchema.methods.generateToken = function (cb) {
  // jsonwebtoken을 이용하여 token을 생성하기.
  // https://www.npmjs.com/package/jsonwebtoken
  var user = this;
  // _id는 mongoDB에서 각자 주어진 id를 사용.
  //
  var token = jwt.sign(user._id.toHexString(), 'secretToken');
  // token은 아래와 같이 만들게 된다. 즉, user id와 secretToken을 합쳐서 만들고,
  // 추후에 SecretToken을 입력하면 user id를 돌려 받을수 있게된다. --> secretToken은 임의의 값임. 내맘대로 적은거
  // user._id + 'secretToken' = token
  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

// ? findByToken function create
userSchema.statics.findByToken = function (token, cb) {
  var user = this;
  // token을 가져와서 복호화(decode) 한다.
  /*
   ? verify a token symmetric
  jwt.verify(token, 'shhhhh', function(err, decoded) {
    console.log(decoded.foo) // bar
  });
  */
  jwt.verify(token, 'secretToken', function (err, decoded) {
    // 유저아이디를 이용해서 유저를 찾은 다음에
    // 클라이언트에서 가져온 token과, DB에 보관된 토큰이 일치하는지 확인.
    user.findOne({ _id: decoded, token: token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user);
    }); // --> findOne은, mongoDB에 있는 값과 확인하는 메소드임.
  });
};
const User = mongoose.model('User', userSchema);

module.exports = { User };
