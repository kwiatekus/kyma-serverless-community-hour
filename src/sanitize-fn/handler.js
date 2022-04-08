const { v4: uuidv4 } = require('uuid');
const string = require("string-sanitizer");
module.exports = {
    main: function (event, context) {

        let sanitisedData = sanitise(event.data);

        const eventOut = buildEventPayload(sanitisedData, event);
        event.publishCloudEvent(eventOut).then(response => {
            console.log(`Payload pushed`, response.data);
        }).catch(err => {
            console.error("Could not send event",err);
        })
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
    
    // const eventSource = "kyma"
    // const eventType = "sap.kyma.custom.acme.payload.sanitised.v1"
    // const eventSpecVersion = "1.0"    

    //TODO Read from ENVS!
    const eventType = process.env['eventtype']
    const eventSource = process.env['eventsource']
    const eventSpecVersion = process.env['eventspecversion']
    var eventPayload=event.buildResponseCloudEvent(uuidv4(),eventType,data);
    eventPayload.source=eventSource
    eventPayload.specversion=eventSpecVersion;
    return eventPayload;
}