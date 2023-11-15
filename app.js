import React, { useCallback, useReducer, useEffect } from 'react';
import debounce from 'lodash.debounce';
import { getSuggestion } from './ai.js';

const x = React.createElement.bind(React);

const ACTION_ON_CHANGE = 'ON_CHANGE';
const ACTION_ON_SUGGEST = 'ON_SUGGEST';
const ACTION_ON_ACCEPT = 'ON_ACCEPT';

const INITIAL_STATE = {
    inputText: '',
    suggestText: '',
};

const reducer = (state, action) => {
    switch (action.type) {
        case ACTION_ON_CHANGE: {
            return {
                ...state,
                inputText: action.payload.value,
            };
        }
        case ACTION_ON_SUGGEST: {
            return {
                ...state,
                suggestText: action.payload.value,
            };
        }
        case ACTION_ON_ACCEPT: {
            return {
                ...state,
                inputText: state.inputText + ' ' + state.suggestText,
            }
        }
        default:
            return state;
    }
};

export const App = () => {
    const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

    const onInputChange = useCallback((event) => {
        dispatch({
            type: ACTION_ON_CHANGE,
            payload: {
                value: event.target.value
            }
        });
    }, []);

    const requestSuggestion = useCallback(
        debounce(
            async (text) => {
                if (text === '') {
                    return;
                }
                const suggested = await getSuggestion(text);
                dispatch({
                    type: ACTION_ON_SUGGEST,
                    payload: {
                        value: suggested,
                    },
                });
            },
            1000
        ), []);

    useEffect(() => requestSuggestion(state.inputText), [state.inputText]);

    const onAccept = useCallback(() => dispatch({ type: ACTION_ON_ACCEPT }), []);

    return x(
        'div',
        null,
        x(
            'div',
            { className: 'dual-wrapper' },
            x(
                'div',
                { className: 'text-wrapper' },
                x(
                    'textarea',
                    { value: state.inputText, onInput: onInputChange }
                ),
            ),
            x(
                'div',
                { className: 'text-wrapper' },
                x(
                    'textarea',
                    { disabled: true, value: state.suggestText }
                ),
            ),
        ),
        x(
            'div',
            { className: 'action-wrapper' },
            x(
                'button',
                { onClick: onAccept },
                'Accept'
            )
        ),
    );
};
