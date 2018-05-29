import React from 'react';
import { hydrate } from 'react-dom';
import Template from '../parent/index.jsx';
import { hot } from 'react-hot-loader'

const App = hot(module)(Template);

hydrate(<App text={'Hello World'}/>, document.getElementById('root'));
