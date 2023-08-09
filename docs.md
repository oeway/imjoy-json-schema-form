# ImJoy JSON Schema Form

## Introduction
This guide demonstrates how to use the imjoy-json-schema-form plugin to create a custom form dialog or window generated from json schema.

## Steps to Create a Custom Form Dialog

### 1. Define JSON Schema
Define a JSON schema for your custom form:

```javascript
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
```

### 2. Show Dialog or Create Window
Use the `api.showDialog` or `api.createWindow` method to display the custom form based on the defined schema:

#### Using `api.showDialog`

```javascript
const form = await api.showDialog({
    src: "https://oeway.github.io/imjoy-json-schema-form/",
    name: "Form",
    config: {
        schema: testSchema,
        ui_schema: {},
        submit_label: "Submit",
        close_on_submit: true,
        callback(data){
            alert(`Received form data: \${JSON.stringify(data)}`);
        },
        onchange(data){
            console.log("form data changed", data);
        },
        onerror(errors){
            console.error("form error", errors);
        },
    }
});
```

#### Using `api.createWindow` (if applicable)

```javascript
const window = await api.createWindow({
    src: "https://oeway.github.io/imjoy-json-schema-form/",
    name: "Window",
    config: {
        schema: testSchema,
        /* Other configuration options */
    }
});
```

### 3. Handle Events
Provide callback functions to handle events:

```javascript
callback(data){
    alert(`Received form data: \${JSON.stringify(data)}`);
},
onchange(data){
    console.log("form data changed", data);
},
onerror(errors){
    console.error("form error", errors);
},
```

## Python

Besides in javascript, you can also use the form in python, for example, in a Jupyter Notebook (https://jupyter.imjoy.io), you can do:
```python
async def setup():  
    fm = await api.showDialog(
        src="https://oeway.github.io/imjoy-json-schema-form/",
        config={
            "schema": {
                "title": "Test Form",
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "title": "Name",
                        "maxLength": 3,
                    },
                    "age": {
                        "type": "number",
                        "title": "Age"
                    }
                }
            }
        }
    )
    form = await fm.get_data()
    await api.alert(str(form))

api.export({"setup": setup})
```

You can also use `callback` to run a function when the form is submitted:
```python
from imjoy_rpc import api

async def setup():  
    async def callback(data):
        await api.alert(str(data))
        await fm.close()

    fm = await api.showDialog(
        src="https://oeway.github.io/imjoy-json-schema-form/",
        config={
            "_rintf": true,
            "callback": callback,
            "schema": {
                "title": "Test Form",
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "title": "Name"
                    },
                    "age": {
                        "type": "number",
                        "title": "Age"
                    }
                }
            }
        }
    )

api.export({"setup": setup})
```

Note that we need to add `"_rintf": true,` to be able to run the callback function multiple times.

## Conclusion
This guide simplifies the process of creating a custom form dialog using the ImJoy plugin functions `api.createWindow` or `api.showDialog`. You can define a JSON schema to specify the fields and behaviors of the form, and utilize callback functions to handle interactions.
