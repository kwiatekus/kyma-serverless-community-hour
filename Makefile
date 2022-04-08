
render:
	(cd ./src ; sh render-function-manifests.sh)
apply:
	(cd ./src ; sh render-function-manifests.sh)
	kubectl apply -k ./k8s-resources/base
	kubectl apply -f ./k8s-resources/base/functions
cleanup:
	sh cleanup.sh
