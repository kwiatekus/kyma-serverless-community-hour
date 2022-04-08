
render:
	(cd ./src ; sh render-function-manifests.sh)
apply:
	(cd ./src ; sh render-function-manifests.sh)
	kubectl apply -k ./k8s-resources/base
