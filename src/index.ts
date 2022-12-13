import {
  JupyterLiteServer,
  JupyterLiteServerPlugin
} from '@jupyterlite/server';
import { ILocalForage } from '@jupyterlite/localforage';
import { IContents } from '@jupyterlite/contents';
import { JupyteachContents } from './contents';
import { PageConfig } from '@jupyterlab/coreutils';

const contentsPlugin: JupyterLiteServerPlugin<IContents> = {
  id: '@jupyteach/server-extension:contents',
  requires: [ILocalForage],
  autoStart: true,
  provides: IContents,
  activate: (app: JupyterLiteServer, forage: ILocalForage) => {
    console.log('activating custom contents plugin');
    const storageName = PageConfig.getOption('contentsStorageName');
    const storageDrivers = JSON.parse(
      PageConfig.getOption('contentsStorageDrivers') || 'null'
    );
    const { localforage } = forage;
    const contents = new JupyteachContents({
      storageName,
      storageDrivers,
      localforage
    });
    app.started.then(() => contents.initialize().catch(console.warn));
    return contents;
  }
};

export default [contentsPlugin];
