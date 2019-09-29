import View from './View';

import {showFilesList, findFilesByName} from './middleWare'

class UserView extends View {
    constructor(el, store) {
        super(el, store);
        this._onInput = this._onInput.bind(this);
        this._el.addEventListener('input', this._onInput);
        store.dispatch(showFilesList(''));
    }

    destroy() {
        super.destroy();
        this._onInput.removeEventListener('input', this._onInput);
    }

    _onInput(event) {
        //Wait for 1s before dispatching action
        clearTimeout(this._delayTimer);
        let store = this._store;
        this._delayTimer = setTimeout(function() {
            event.target.value
                ? store.dispatch(findFilesByName(event.target.value))
                : store.dispatch(showFilesList(event.target.value));
        }, 1000);
    }

    render({ name }) {
        return ``;
    }
}

export default UserView;
