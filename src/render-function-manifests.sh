#!/bin/sh
set -e
echo "resources:" > ../k8s-resources/base/functions/kustomization.yaml

for d in */ ; do
    [ -L "${d}" ] && continue
    echo "Generating k8s manifests for function ${d%/}"
    ( cd "$d" && kyma apply function --dry-run --ci -o yaml | tail -n +2 > ../../k8s-resources/base/functions/${d%/}.yaml )
    echo "- ${d%/}.yaml" >> ../k8s-resources/base/functions/kustomization.yaml
done