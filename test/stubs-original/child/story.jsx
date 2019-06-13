import React from "react";
import { storiesOf } from "@storybook/react";
import Template from "./client.jsx";
storiesOf("Child", module).add("default", () => <Template>Hello</Template>);
