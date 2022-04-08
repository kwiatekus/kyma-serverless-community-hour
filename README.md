# kyma-serverless-community-hour

# Use case

![usecase](usecase.png)
# Explore 

Explore at [kyma-dashboard](https://console.c-31cabdf.kyma.ondemand.com/)

Draft the code

```js
const { v4: uuidv4 } = require('uuid');
const string = require("string-sanitizer");
module.exports = {
    main: function (event, context) {

        let sanitisedData = sanitise(event.data);

        const eventOut = buildEventPayload(sanitisedData, event);
        event.publishCloudEvent(eventOut).then(response => {
            console.log(`Payload pushed`, response.data);
        });
        return "OK"
    }
}
let sanitise = (data)=>{
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            let sanitized = string.sanitize(data[key])
            console.log(`sanitizing ${data[key]} -> ${sanitized}`);
            data[key]=sanitized
        }
    }
    console.log(data);
    return data;
}

let buildEventPayload = (data, event)=>{
    
    const eventSource = "kyma"
    const eventType = "sap.kyma.custom.acme.payload.sanitised.v1"
    const eventSpecVersion = "1.0"    

    //TODO Read from ENVS!
    // const eventType = process.env['eventype']
    // const eventSource = process.env['evensource']
    // const eventSpecVersion = process.env['eventspecversion']
    var eventPayload=event.buildResponseCloudEvent(uuidv4(),eventType,data);
    eventPayload.source=eventSource
    eventPayload.specversion=eventSpecVersion;
    return eventPayload;
}
```

```json
{
  "name": "sanitise-fn",
  "version": "0.0.1",
  "dependencies": {
    "uuidv4": "6.2.12",
    "string-sanitizer": "2.0.2"
  }
}
```

# Test
```bash
export url=data-in.c-31cabdf.kyma.ondemand.com
curl  -H "Content-Type: application/json"   -X POST -d '{"FirstName":"J@#$%ohn!", "LastName":"Do@@*&e"}' "https://$url/"
```