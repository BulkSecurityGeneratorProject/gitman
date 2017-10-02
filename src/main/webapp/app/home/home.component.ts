import { Component, OnInit, OnDestroy, Injectable } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';
import { Account, LoginModalService, Principal } from '../shared';

import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { NgbProgressbarConfig } from '@ng-bootstrap/ng-bootstrap';
import { CheckMK } from '../services/CheckMK';
import { Gitlab } from '../services/Gitlab';

import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'jhi-home',
    templateUrl: './home.component.html',
    styleUrls: [
        'home.css'
    ],
    providers: [NgbProgressbarConfig, CheckMK, Gitlab]

})
@Injectable()
export class HomeComponent implements OnInit, OnDestroy {
    account: Account;
    modalRef: NgbModalRef;

    
    public latestBuild = Object;
    public isCollapsed = false;
    public deploymentGroups: Map<string, Object[]> = new Map<string, Object[]>();
    processed = 0;
    subscription: Subscription;


    constructor(private http: Http,
        private principal: Principal,
        private loginModalService: LoginModalService,
        private eventManager: JhiEventManager,
        public config: NgbProgressbarConfig,
        private checkMK: CheckMK,
        private gitlab: Gitlab
    ) {

    }

    ngOnInit() {
        this.principal.identity().then((account) => {
            this.account = account;
        });
        this.registerAuthenticationSuccess();

        this.gitlab.getLastestBuilld().subscribe(build => { this.latestBuild = build; });
        //this.subscription=this.gitlab
        this.getDeploymentData();
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.subscription.unsubscribe();
    }


    registerAuthenticationSuccess() {
        this.eventManager.subscribe('authenticationSuccess', (message) => {
            this.principal.identity().then((account) => {
                this.account = account;
            });
        });


    } 

    isAuthenticated() {
        return this.principal.isAuthenticated();
    }

    login() {
        this.modalRef = this.loginModalService.open();
    }

    getDeploymentData() {
        this.subscription = this.gitlab.retrieveDeployments().subscribe(deployment => {
            const data = deployment.json();
            //console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!Recieved '+deployment);
            data.forEach(item => {
                let envData = [];
                if (this.deploymentGroups.get(item.environment.name)) {
                    envData = this.deploymentGroups.get(item.environment.name);
                }
                if (!item.hasOwnProperty('collapsed')) {
                    item['collapsed'] = false;
                }
                envData.push(item);
                this.deploymentGroups.set(item.environment.name, envData);
            });
        });
    }

    getCheckMKStatus($environment: string) {
        this.checkMK.getCheckMKStatus($environment, this.deploymentGroups);
    }
}
