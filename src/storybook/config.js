import { configure } from "@storybook/react";

const req = require.context(DESTINATION, true, /.story.jsx$/);
const loadStories = () => req.keys().forEach(req);

configure(loadStories, module);
