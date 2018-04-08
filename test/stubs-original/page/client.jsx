import React from 'react';
import { hydrate } from 'react-dom';
import Template from '../parent/index.jsx';

hydrate(<Template text={'Hello World'}/>, document.getElementById('root'));
