## Setup

```shell
mamba create -n jupyteach-jupyterlite-contents -y --override-channels --strict-channel-priority -c conda-forge -c nodefaults python jupyterlab=3 nodejs=18 cookiecutter jupyterlite-core
conda activate jupyteach-jupyterlite-contents
pip install -r requirements.txt
pip install -ve .
pip install build
jupyter labextension develop . --overwrite
```

## Dev

To build

```shell
doit build
```

To serve

```shell
jupyter lite serve
```

To build just the extension from within jupyteach:

```shell
doit quickbuild
```

To build extension and full jupyterlite from within jupyteach:

```shell
doit devbuild
```
