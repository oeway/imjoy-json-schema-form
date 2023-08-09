import React, { useState, useEffect, useCallback, useRef } from 'react';
import { imjoyRPC } from "imjoy-rpc";
import Form from 'react-jsonschema-form';
import validator from '@rjsf/validator-ajv8';
import './App.css';
import ReactMarkdown from 'react-markdown';


function useImJoyPlugin() {
  const [schema, setSchema] = useState(null);
  const [uiSchema, setUiSchema] = useState({});
  const [closeOnSubmit, setCloseOnSubmit] = useState(true);
  const [submitLabel, setSubmitLabel] = useState("Submit");
  const callbackRef = useRef(null);
  const onchangeRef = useRef(null);
  const onerrorRef = useRef(null);
  const imjoyAPI = useRef(null);
  const promise = useRef(null);

  useEffect(() => {
    if (window.self !== window.top && !window.loadImJoy) {
      window.loadImJoy = true;
      imjoyRPC.setupRPC({
        name: "ImJoy JSON Schema Form",
        version: "0.1.0",
        description: "Displaying JSON schema form, powered by react-jsonschema-form",
        docs: "https://raw.githubusercontent.com/oeway/imjoy-json-schema-form/main/docs.md",
      }).then(_api => {
        imjoyAPI.current = _api;
        _api.export({
          _rintf: true,
          setup() { },
          run(ctx) {
            if (ctx.config.schema) setSchema(ctx.config.schema);
            if (ctx.config.ui_schema) setUiSchema(ctx.config.ui_schema);
            if (ctx.config.submit_label) setSubmitLabel(ctx.config.submit_label);
            if (ctx.config.callback) callbackRef.current = ctx.config.callback;
            if (ctx.config.onchange) onchangeRef.current = ctx.config.onchange;
            if (ctx.config.onerror) onerrorRef.current = ctx.config.onerror;
            if (ctx.config.close_on_submit) setCloseOnSubmit(ctx.config.close_on_submit);
          },
          async get_data() {
            return await new Promise((resolve) => {
              promise.current = resolve
            });
          },
        });
        
      }).catch(err => { console.error(err); });
    }
  }, []);

  return { schema, uiSchema, submitLabel, callbackRef, onchangeRef, onerrorRef, imjoyAPI, closeOnSubmit, promise };
}

function App() {
  const { schema, uiSchema, submitLabel, callbackRef, onchangeRef, onerrorRef, imjoyAPI, closeOnSubmit, promise } = useImJoyPlugin();
  const [markdown, setMarkdown] = useState("");
  useEffect(() => {
    if(!schema)
    fetch("https://raw.githubusercontent.com/oeway/imjoy-json-schema-form/main/docs.md").then(res => res.text()).then(setMarkdown);
  }, [schema]);

  const handleSubmit = useCallback((form) => {
    if (callbackRef.current){
      callbackRef.current(form);
    }
  
    if(promise.current){ 
      promise.current(form);
      imjoyAPI.current.close();
    }
    else if(closeOnSubmit && form.status === "submitted"){
      imjoyAPI.current.close();
    }
  }, [callbackRef, closeOnSubmit, imjoyAPI, promise]);

  return (
    <div className="App">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="my-5">
              {schema?(<Form schema={schema} uiSchema={uiSchema} validator={validator} onError={(errors)=> onerrorRef.current && onerrorRef.current(errors)} onChange={(e) => onchangeRef.current && onchangeRef.current(e.formData)} onSubmit={handleSubmit}>
              {callbackRef.current && (<button type="submit" className="btn btn-primary">{submitLabel}</button>)}
              </Form>):
              <ReactMarkdown children={markdown}/>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
