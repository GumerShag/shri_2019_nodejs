import Types from './Types';

const setNameAction = (name) => ({
   type: Types.SET_NAME,
   payload: name
});

const setFilesAction = (files) => ({
    type: Types.SET_FILES,
    files: files
});

export {setNameAction, setFilesAction}



