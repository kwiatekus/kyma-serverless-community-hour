# kyma-serverless-community-hour

# Use case

![usecase](usecase.png)
# Explore 

Explore at [kyma-dashboard](https://console.c-31cabdf.kyma.ondemand.com/)

### Draft the code

```js
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
```

```json
{
  "name": "sanitize-fn",
  "version": "0.0.1",
  "dependencies": {
    "uuidv4": "6.2.12",
    "string-sanitizer": "2.0.2"
  }
}
```

### Test
```bash
export url=data-in.c-31cabdf.kyma.ondemand.com
curl  -H "Content-Type: application/json"   -X POST -d '{"FirstName":"J@#$%ohn!", "LastName":"Do@@*&e"}' "https://$url/"
```

# Use Kyma CLI

## Fetch what you got already

```bash
mkdir src
cd src
mkdir sanitize-fn
cd sanitize-fn
kyma sync function sanitize-fn
code .
```

### Delete and re-create

```bash
k delete functions --all
kyma apply function
```

## Init new function

```bash
cd src
mkdir store-fn
cd store-fn
kyma init function --name store-fn --vscode
code .
```

### Run locally with Hot-Deployment/Debug

```bash
kyma run function --hot-deploy  

curl localhost:8080
```

### IDE Autocompletion

Subscription to event
```yaml
subscriptions:
    - name: store-fn
      protocol: ""
      filter:
        filters:
            - eventSource:
                property: source
                type: exact
                value: ""
              eventType:
                property: type
                type: exact
                value: sap.kyma.custom.acme.payload.sanitised.v1
```
S3 storage ENVs

apply secret first : `kubectl apply -k ./k8s-resources/base`

```yaml
env:
  - name: S3_BUCKET
    valueFrom:
      secretKeyRef:
        name: s3-storage
        key: S3_BUCKET
  - name: S3_ENDPOINT
    valueFrom:
      secretKeyRef:
        name: s3-storage
        key: S3_ENDPOINT
  - name: S3_ACCESSKEY_ID
    valueFrom:
      secretKeyRef:
        name: s3-storage
        key: S3_ACCESSKEY_ID
  - name: S3_SECRET
    valueFrom:
      secretKeyRef:
        name: s3-storage
        key: S3_SECRET
```
## Apply final version of store-fn

```bash
git checkout store-function-final

kyma apply function
```
# Consistent Deployment

### Use Kyma CLI to render k8s manifests for functions

```bash
kyma apply function --dry-run -o yaml
```
### Make Function Yamls part of your k8s-resources

For each sub-folder in `src` render a yaml file
```bash
#!/bin/sh
set -e
echo "resources:" > ../k8s-resources/base/functions/kustomization.yaml

for d in */ ; do
    [ -L "${d}" ] && continue
    echo "Generating k8s manifests for function ${d%/}"
    ( cd "$d" && kyma apply function --dry-run --ci -o yaml | tail -n +3 > ../../k8s-resources/base/functions/${d%/}.yaml )
    echo "- ${d%/}.yaml" >> ../k8s-resources/base/functions/kustomization.yaml
done
```
### Makefile

```
render:
	(cd ./src ; sh render-function-manifests.sh)
apply:
	(cd ./src ; sh render-function-manifests.sh)
	kubectl apply -k ./k8s-resources/base

```

(`git checkout consistent-k8s-deployment`) 

PUSH Based Deployment via `make apply`
 - manually  
 - via CI/CD

PULL Based Deployment of `k8s-resources` folder via in-cluster GitOperator (i.e `fluxcd` or `argocd`)

## Source Function Handlers from GIT too!


change source type: `inline` to `git`.

>>NOTE: heads up! avoid double deplyments. Require folder filters in CI/CD pipelines

```yaml
    sourceType: git
    url: https://github.com/kwiatekus/kyma-serverless-community-hour.git
    repository: kyma-serverless-community-hour1
    reference: main
    baseDir: /src/sanitize-fn/
```

```yaml
    sourceType: git
    url: https://github.com/kwiatekus/kyma-serverless-community-hour.git
    repository: kyma-serverless-community-hour2
    reference: main
    baseDir: /src/store-fn/
```

Render changes in manifests.. See difference
`make render`

Apply To the runtime
`make apply`

From now on, the referenced repository will be polled for changes and function controller will be auto-deploying content of the `baseDirs`