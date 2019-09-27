import Types from './Types';

const reducer = (state, action) => {
    switch (action.type) {
        case Types.SET_NAME:
            return {
                ...state,
                name: action.payload
            };
        case Types.INIT:
        default:
            return {
                name: "Anon"
            }
    }
};

export default reducer;