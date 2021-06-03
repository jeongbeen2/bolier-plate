import { combineReducers } from 'redux';
import user from './user_reducer';

// ? STORE에는 여러가지 상태와, 그 상태가 어떻게 변하는지를 알려주는 리듀서가 있음.
// ? combineReducer는 이렇게 다양한 reducer들을 root reducer에서 한번에 합쳐주는 기능을 한다.
const rootReducer = combineReducers({
  user,
});

export default rootReducer;
