#!/bin/sh
set -e
kubectl delete functions --all
kubectl delete subscriptions.eventing.kyma-project.io --all
kubectl delete apirules.gateway.kyma-project.io --all
kubectl delete gitrepositories.serverless.kyma-project.io --all