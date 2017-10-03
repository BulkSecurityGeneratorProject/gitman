import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ProdConfig } from './blocks/config/prod.config';
import { GitmanAppModule } from './app.module';
import { enableProdMode } from '@angular/core';

ProdConfig();

if (module['hot']) {
    module['hot'].accept();
}

//enableProdMode();
platformBrowserDynamic().bootstrapModule(GitmanAppModule)
.then((success) => console.log(`Application started`))
.catch((err) => console.error(err));
