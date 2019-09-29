import { setNameAction, setFilesAction } from './Actions';

export const showFilesList = name => dispatch => {
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

export const findFilesByName = name => dispatch => {
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

const createMiddleware = () => {
    return dispatch => next => action => {
        if (typeof action === 'function') {
            return action(dispatch);
        }
        return next(action);
    };
};



