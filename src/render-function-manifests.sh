#!/bin/sh
set -e

for d in */ ; do
    [ -L "${d}" ] && continue
    echo "Generating k8s manifests for function ${d%/}"
    ( cd "$d" && kyma apply function --dry-run --ci -o yaml  > ../../k8s-resources/base/functions/${d%/}.yaml )
done