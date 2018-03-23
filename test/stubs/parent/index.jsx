import React from 'react';
import Child from '../child/index.jsx';

export default function Parent(props) {

  return <Child {...props} />
}