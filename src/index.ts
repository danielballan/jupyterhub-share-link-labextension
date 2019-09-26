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
  getImageSpec, createShareLink
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
  const hubPrefix = paths.urls.hubPrefix || '';

  commands.addCommand('filebrowser:share-main', {
    execute: () => {
      const widget = tracker.currentWidget;
      if (!widget) {
        return;
      }
      const path = encodeURI(widget.selectedItems().next().path);
      let networkRetry = INITIAL_NETWORK_RETRY;
      const imageSpecPromise = getImageSpec();
      imageSpecPromise.then(imageSpec => {
        networkRetry = INITIAL_NETWORK_RETRY;
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
