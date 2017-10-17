import {NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {RouterModule} from '@angular/router';

import {GitmanSharedModule} from '../shared';

import {HOME_ROUTE, HomeComponent} from './';

import {AngularFontAwesomeModule} from 'angular-font-awesome/angular-font-awesome';

@NgModule({
    imports: [
        GitmanSharedModule,
        RouterModule.forRoot([HOME_ROUTE], {useHash: true}), AngularFontAwesomeModule
    ],
    declarations: [
        HomeComponent,
    ],
    entryComponents: [],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GitmanHomeModule {
}
