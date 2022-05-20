const { v4: uuidv4 } = require('uuid');
const string = require("string-sanitizer");

module.exports = {
    main: async function (event, context, callback) {

        const message = `Hello World from the Kyma Function ${context["function-name"]} running on ${context.runtime}!`;

        console.log(message);

        let sanitisedData = sanitise(event.data);

        const eventOut = buildEventPayload(sanitisedData, event);
        const response = await event.publishCloudEvent(eventOut)
        
        callback(response.status, response.statusText)
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
    const eventType = process.env['eventtype']
    const eventSource = process.env['eventsource']
    const eventSpecVersion = process.env['eventspecversion']
    var eventPayload=event.buildResponseCloudEvent(uuidv4(),eventType,data);
    eventPayload.source=eventSource
    eventPayload.specversion=eventSpecVersion;
    return eventPayload;
}