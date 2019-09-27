import View from './View'
import { setNameAction } from './Actions'

class UserView extends View{
    constructor(el, store) {
        super(el, store);
        this._onInput = this._onInput.bind(this);
        this._el.addEventListener('input', this._onInput);
    }

    destroy() {
        super.destroy();
        this._onInput.removeEventListener('input', this._onInput);
    }

    _onInput(event) {
        this._store.dispatch(setNameAction(event.target.value));
    }

    render({ name }) {
        return ``
    }
}

export default UserView;