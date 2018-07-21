export default function demo(state = {
    data: null
}, action) {

    let newState = Object.assign({}, state, action.data);

    return newState;
}