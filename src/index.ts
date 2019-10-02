import {
  URLExt
} from '@jupyterlab/coreutils';

import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  Clipboard, Dialog, showDialog
} from '@jupyterlab/apputils';

import {
  IFileBrowserFactory
} from '@jupyterlab/filebrowser';

import { toArray } from '@phosphor/algorithm';

import {
  createShareLink
} from './actions';


const INITIAL_NETWORK_RETRY = 2; // ms


/**
 * A file browser share-file plugin
 *
 * This extension adds a "Copy Shareable Link" command that generates a copy-
 * pastable URL by making a request to the jupyter-share-link JupyterHub
 * service.
 */
const shareFile: JupyterFrontEndPlugin<void> = {
  activate: activateShareFile,
  id: '@jupyterlab/filebrowser-extension:share-file',
  requires: [IFileBrowserFactory, JupyterFrontEnd.IPaths],
  autoStart: true
  };

function activateShareFile(
  app: JupyterFrontEnd,
  factory: IFileBrowserFactory,
  paths: JupyterFrontEnd.IPaths
): void {
  const { commands } = app;
  const { tracker } = factory;
  const hubHost = paths.urls.hubHost || '';
  const hubPrefix = paths.urls.hubPrefix || '/hub/';
  // TODO
  // When this commit is released (looks like it's in 2.0.0alpha1 currently...)
  // https://github.com/jupyterlab/jupyterlab/commit/b750683f727485ea594d75d8efe7c0b29ecf4937
  // then user the new hubServerName.
  // const hubServerName = paths.urls.hubServerName || '';
  const base = paths.urls.base;
  /**
  * Per @ian-r-rose, this is the best way to get the services URL for now,
  * but maybe in the future JupyterLab will add a hubServices path.
  */
  const hubServices = URLExt.join(hubPrefix.slice(0, -4), `services/`);

  commands.addCommand('filebrowser:share-main', {
    execute: () => {
      const widget = tracker.currentWidget;
      if (!widget) {
        return;
      }
      const path = encodeURI(widget.selectedItems().next().path);
      let networkRetry = INITIAL_NETWORK_RETRY;
      console.log('base', base);
      const createShareLinkPromise = createShareLink(
        hubHost, hubServices, base, path);
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
    },
    isVisible: () =>
      tracker.currentWidget &&
      toArray(tracker.currentWidget.selectedItems()).length === 1,
    iconClass: 'jp-MaterialIcon jp-LinkIcon',
    label: 'Copy Shareable Link'
  });
  }



/**
 * Export the plugin as default.
 */
export default shareFile;
