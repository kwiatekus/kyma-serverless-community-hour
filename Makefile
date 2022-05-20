
render:
	(cd ./src ; sh render-function-manifests.sh)
all:
	(cd ./src ; sh render-function-manifests.sh)
	kubectl apply -k ./k8s-resources/base
deploy:
	kubectl apply -k ./k8s-resources/base