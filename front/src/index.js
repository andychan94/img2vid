import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceworker";
import {Provider} from 'react-redux'
// import rootReducer from './reducers'
import {createStore} from 'redux';
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";

function todos(state = [], action) {
    switch (action.type) {
        case 'ADD_TODO':
            return state.concat([action.text])
        default:
            return state
    }
}

const store = createStore(todos, ['Use Redux'])

store.dispatch({
    type: 'ADD_TODO',
    text: 'Read the docs'
})

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <Switch>
                <Route path="/">
                    <App/>
                </Route>
            </Switch>
        </Router>
    </Provider>,
    document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();