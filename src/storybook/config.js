import { configure } from "@storybook/react";

console.log('looking for stories in', DESTINATION);

const req = require.context(DESTINATION, true, /.story.jsx$/);
const loadStories = () => {
  req.keys().forEach((x)=> {
    console.log('loading', x);
    req(x) 
  });
}

configure(loadStories, module);
