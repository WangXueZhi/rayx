/**
 * 
 * { dispatchName1: () => dispatch(action), dispatchName2: () => dispatch(action) }
 * [ stateName1, stateName2 ]
 */

// redux
import { connect } from 'react-redux'

let JoinRedux = function (options) {

    let { actions, component, states } = options;

    // Map Redux state to component props
    function mapStateToProps(state) {
        let statesObject = {};

        for (let i = 0; i < states.length; i++) {
            statesObject[states[i]] = state[states[i]];
        }
        return statesObject
    }

    // Map Redux actions to component props
    function mapDispatchToProps(dispatch) {
        let funcObject = {};

        for (let key in actions) {
            funcObject[key] = (data) => {
                if(data.type){
                    actions[key].type = data.type;
                    delete data.type;
                }
                actions[key].data = data;
                dispatch(actions[key]);
            }
        }

        return funcObject
    }

    // Connected Component
    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(component)
};

export default JoinRedux;