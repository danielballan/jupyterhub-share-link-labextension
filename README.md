# jupyterhub-share-link-labextension

Adds UI for sharing notebooks across Hub and a very simple server extension to
support it.

This works in cooperation with a Hub Service,
[jupyterhub-share-link](https://github.com/danielballan/jupyterhub-share-link).


## Prerequisites

* JupyterLab

## Installation

```bash
jupyter labextension install jupyterhub-share-link-labextension
```

## Development

For a development install (requires npm version 4 or later), do the following in the repository directory:

```bash
npm install
npm run build
jupyter labextension link .
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```

