import {
  IDisposable, DisposableDelegate
} from '@phosphor/disposable';

import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  ToolbarButton
} from '@jupyterlab/apputils';

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  NotebookPanel, INotebookModel
} from '@jupyterlab/notebook';

import {
  getImageSpec
} from './actions';


const INITIAL_NETWORK_RETRY = 2; // ms

/**
 * Error message if the nbdime API is unavailable.
 */
// const serviceMissingMsg = 'Unable to query jupyterhub-share-link API. Is the hub service running?';

export
namespace CommandIDs {

  export
  const shareNotebook = 'jupyterhub-share-link:share';
}


/**
 * The plugin registration information.
 */
const plugin: JupyterLabPlugin<void> = {
  activate,
  id: 'my-extension-name:buttonPlugin',
  autoStart: true
};


/**
 * A notebook widget extension that adds a button to the toolbar.
 */
export
class ButtonExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  /**
   * Create a new extension object.
   */
  createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {

    let callback = () => {
      let networkRetry = INITIAL_NETWORK_RETRY;
      // NotebookActions.runAll(panel.content, context.session);
      const imageSpecPromise = getImageSpec();
      imageSpecPromise.then(imageSpec => {
        networkRetry = INITIAL_NETWORK_RETRY;
        console.log(imageSpec);
        let path = context.path;
        console.log(path);
      });
      imageSpecPromise.catch((reason) => {
        if (reason.status === 404) {
          console.log('Is the jupyter_expose_image_spec serverextension running?');
        }
        setTimeout(() => {
          networkRetry *= 2;
        }, networkRetry);
      });
    };
    let button = new ToolbarButton({
      className: 'myButton',
      iconClassName: 'fa fa-send',
      onClick: callback,
      tooltip: 'Create Shareable Link'
    });

    panel.toolbar.insertItem(0, 'runAll', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}


/**
 * Activate the extension.
 */
function activate(app: JupyterLab) {
  app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension());
};


/**
 * Export the plugin as default.
 */
export default plugin;
