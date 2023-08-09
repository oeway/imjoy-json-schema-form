import React, { useState, useEffect, useCallback, useRef } from 'react';
import { imjoyRPC } from "imjoy-rpc";
import Form from 'react-jsonschema-form';
import validator from '@rjsf/validator-ajv8';
import './App.css';

const docs = `
# ImJoy Plugin Form Guide

## Introduction
This guide demonstrates how to use ImJoy plugin functions to create a custom form dialog with fields for name and age.

## Steps to Create a Custom Form Dialog

### 1. Define JSON Schema
Define a JSON schema for your custom form:

\`\`\`javascript
const testSchema = {
    "title": "Test Form",
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
            "title": "Name",
            "maxLength": 5,
        },
        "age": {
            "type": "number",
            "title": "Age"
        }
    }
};
\`\`\`

### 2. Show Dialog or Create Window
Use the \`api.showDialog\` or \`api.createWindow\` method to display the custom form based on the defined schema:

#### Using \`api.showDialog\`

\`\`\`javascript
const form = await api.showDialog({
    src: \`\${currentLocationRoot}/index.html\`,
    name: "Form",
    config: {
        schema: testSchema,
        /* Other configuration options */
    }
});
\`\`\`

#### Using \`api.createWindow\` (if applicable)

\`\`\`javascript
const window = await api.createWindow({
    src: \`\${currentLocationRoot}/index.html\`,
    name: "Window",
    config: {
        schema: testSchema,
        /* Other configuration options */
    }
});
\`\`\`

### 3. Handle Events
Provide callback functions to handle events:

\`\`\`javascript
callback(data){
    alert(\`Received form data: \${JSON.stringify(data)}\`);
},
onchange(data){
    console.log("form data changed", data);
},
onerror(errors){
    console.error("form error", errors);
},
\`\`\`

## Conclusion
This guide simplifies the process of creating a custom form dialog using the ImJoy plugin functions \`api.createWindow\` or \`api.showDialog\`. You can define a JSON schema to specify the fields and behaviors of the form, and utilize callback functions to handle interactions.

`
function useImJoyPlugin() {
  const [api, setApi] = useState(null);
  const [schema, setSchema] = useState({
    "title": "Untitled",
    "description": "No form data is available for display.",
    "type": "object",
  });
  const [uiSchema, setUiSchema] = useState({});
  const [submitLabel, setSubmitLabel] = useState("Submit");
  const callbackRef = useRef(null);
  const onchangeRef = useRef(null);
  const onerrorRef = useRef(null);

  useEffect(() => {
    if (window.self !== window.top && !window.loadImJoy) {
      window.loadImJoy = true;
      imjoyRPC.setupRPC({
        name: "ImJoy JSON Schema Form",
        version: "0.1.0",
        description: "Displaying JSON schema form, powered by react-jsonschema-form",
      }).then(api => {
        setApi(api);
        api.export({
          _rintf: true,
          docs,
          setup() { },
          run(ctx) {
            if (ctx.config.schema) setSchema(ctx.config.schema);
            if (ctx.config.ui_schema) setUiSchema(ctx.config.ui_schema);
            if (ctx.config.submit_label) setSubmitLabel(ctx.config.submit_label);
            if (ctx.config.callback) callbackRef.current = ctx.config.callback;
            if (ctx.config.onchange) onchangeRef.current = ctx.config.onchange;
            if (ctx.config.onerror) onerrorRef.current = ctx.config.onerror;
          },
        });
      }).catch(err => { console.error(err); });
    }
  }, []);

  return { schema, uiSchema, submitLabel, callbackRef, onchangeRef, onerrorRef, api };
}

function App() {
  const { schema, uiSchema, submitLabel, callbackRef, onchangeRef, onerrorRef } = useImJoyPlugin();

  const handleSubmit = useCallback((form) => {
    if (callbackRef.current){
      callbackRef.current(form);
    }
  }, [callbackRef]);

  return (
    <div className="App">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="my-5">
              <Form schema={schema} uiSchema={uiSchema} validator={validator} onError={(errors)=> onerrorRef.current && onerrorRef.current(errors)} onChange={(e) => onchangeRef.current && onchangeRef.current(e.formData)} onSubmit={handleSubmit}>
              {callbackRef.current && (<button type="submit" className="btn btn-primary">{submitLabel}</button>)}
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
