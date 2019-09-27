import '../css/main.scss';

import UserView from './redux/UserView';
import InputView from './redux/InputView'
import Store from './redux/Store';
import reducer from './redux/Reducer'

console.log('It works!')
const store = new Store(reducer)
const inputEl = document.querySelector('.text-input');
const userEl = document.querySelector('.user-info');
new InputView(inputEl, store);
new UserView(userEl, store);