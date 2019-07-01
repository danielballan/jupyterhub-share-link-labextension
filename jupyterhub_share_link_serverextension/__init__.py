"""
This very simple notebook server extension supports the jupyterhub-share-link
JupyterHub Service.
"""
from datetime import datetime
import json
import os.path

from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler


class ImageSpecHandler(IPythonHandler):
    def get(self):
        self.write({'JUPYTER_IMAGE_SPEC': os.getenv('JUPYTER_IMAGE_SPEC')})


def _jupyter_server_extension_paths():
    return [{
        "module": "jupyterhub_share_link_serverextension"
    }]


def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.

    Args:
        nb_server_app (NotebookWebApplication): handle to the Notebook webserver instance.
    """
    web_app = nb_server_app.web_app
    host_pattern = '.*$'
    route_pattern = url_path_join(web_app.settings['base_url'], '/image-spec')

    web_app.add_handlers(host_pattern, [(route_pattern, ImageSpecHandler)])
