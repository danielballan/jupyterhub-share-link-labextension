import {
  IDisposable, DisposableDelegate
} from '@phosphor/disposable';

import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  Clipboard, Dialog, showDialog, ToolbarButton
} from '@jupyterlab/apputils';

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  NotebookPanel, INotebookModel
} from '@jupyterlab/notebook';

import {
  getImageSpec, createShareLink
} from './actions';


const INITIAL_NETWORK_RETRY = 2; // ms


/**
 * The plugin registration information.
 */
const plugin: JupyterFrontEndPlugin<void> = {
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
        let path = context.path;
        // TODO Properly obtain these from JupyterFrontEnd.
        const hubHost = '';
        const hubPrefix = '/';
        const createShareLinkPromise = createShareLink(
          hubHost, hubPrefix, path, imageSpec);
        createShareLinkPromise.then(shareLink => {
          networkRetry = INITIAL_NETWORK_RETRY;
          showDialog({
            title: "Shareable Link",
            body: `For the next hour, any other user on this JupyterHub who has this link will be able to fetch a copy of your latest saved version of ${path}.`,
            buttons: [
            Dialog.okButton({
              label: 'Copy Link',
            }),
            Dialog.cancelButton({ label: 'Dismiss' }),
          ]
        }).then(result => result.button.accept ?
          Clipboard.copyToSystem(shareLink) : null);
        });
        createShareLinkPromise.catch((reason) => {
          if (reason.status === 404) {
            console.log('Is the jupyter-share-link hub service running?');
          }
          setTimeout(() => {
            networkRetry *= 2;
          }, networkRetry);
        });
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
      className: 'createShareLink',
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
function activate(app: JupyterFrontEnd) {
  app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension());
};


/**
 * Export the plugin as default.
 */
export default plugin;
