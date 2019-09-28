import createMiddleware from './middleWare';
class Store {
    constructor(reducer) {
        this._state = undefined;
        this._listeners = [];
        this._reducer = reducer;
        this.dispatch({
            type: 'init'
        })
    }

    getState() {
        return this._state;
    }

    dispatch(action) {
        if (typeof action === 'function') {
            action(this.dispatch.bind(this));
            return;
        }
        this._state = this._reducer(this._state, action);
        this._notifyListeners();
    }

    subscribe(cb) {
        this._listeners.push(cb);
        return function () {
            const index = this._listeners.indexOf(cb);
            this._listeners = this._listeners.splice(index, 1)
        }
    }

    _notifyListeners() {
        this._listeners.forEach((listener) => {
            listener(this._state)
        })
    }
}

export default Store;