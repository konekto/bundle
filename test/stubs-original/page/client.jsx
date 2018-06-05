import React from 'react';
import { render } from 'react-dom';
import Template from '../parent/index.jsx';
import { hot } from 'react-hot-loader'

const App = hot(module)(Template);

render(<App text={'Hello World'}/>, document.getElementById('root'));
