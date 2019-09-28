import View from './View';
import { setNameAction, setFilesAction } from './Actions';

const showFilesList = name => dispatch => {
    return fetch('http://localhost:3000/api/repos')
        .then(response => {
            return response.json();
        })
        .then(files => {
            const filteredFilesList = files.filter(file => {
                return file.id.toLowerCase().includes(name.toLowerCase());
            });
            dispatch(setFilesAction(filteredFilesList));
            dispatch(setNameAction(name));
        });
};

const findFilesByName = name => dispatch => {
    return fetch('http://localhost:3000/api/repo/search')
        .then(response => {
            return response.json();
        })
        .then(files => {
            const filteredFilesList = files.filter(file => {
                return file.id.toLowerCase().includes(name.toLowerCase());
            });
            dispatch(setFilesAction(filteredFilesList));
            dispatch(setNameAction(name));
        });
};

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
