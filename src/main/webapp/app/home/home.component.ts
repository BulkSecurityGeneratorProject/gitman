import { Component, OnInit, OnDestroy, Injectable } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';
import { Account, LoginModalService, Principal } from '../shared';

import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { NgbProgressbarConfig } from '@ng-bootstrap/ng-bootstrap';
import { CheckMK } from '../services/CheckMK';
import { Gitlab } from '../services/Gitlab';

import { Subscription } from 'rxjs/Subscription';
import { saveAs } from 'file-saver';

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
    public deploymentGroups: Map<string, { gitData: object[], collapsed: boolean, ckeckMK_status: string }> = new Map<string, { gitData: object[], collapsed: boolean, ckeckMK_status: string }>();
    public deployments: Map<string, { showEnvs: boolean, apps: { gitData: Map<string, Object[]>, collapsed: boolean } }> = new Map<string, { showEnvs: false, apps: { gitData: Map<string, Object[]>, collapsed: false } }>();
    private processedDeployments = 0;
    private subscription: Subscription;



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

        this.gitlab.getLastestBuilld().subscribe(buildData => { this.latestBuild = buildData[0]; });
        this.getDeploymentData();
    }

    ngOnDestroy() {
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
        console.log('getDeploymentData');
        this.subscription = this.gitlab.retrieveDeployments(10).subscribe((deployment) => {
            const data = deployment;
            this.processedDeployments++;
            deployment.forEach(e => {
                const environment: string[] = e.environment.name.split('/');
                if (this.deployments.get(environment[0]) == null) {

                    this.deployments.set(environment[0], { showEnvs: false, apps: { gitData:new Map<string,Object[]>() , collapsed: false } });
                }

                if (this.deployments.get(environment[0]).apps.gitData.get(environment[1]) == null){
                    this.deployments.get(environment[0]).apps.gitData.set(environment[1], []);
                }
            
                this.deployments.get(environment[0]).apps.gitData.get(environment[1]).push(e);

        });
        //this.deployments.next({ environment: environment[0], showApps: false, apps: apps });



    });

}

getCheckMKStatus($environment: string) {
    this.checkMK.getCheckMKStatus($environment, this.deployments);
}


getEnvironmentNames(): string[] {
    return Array.from(this.deploymentGroups.keys()).sort();

}
getEnvironments(): string[] {
    return Array.from(this.deployments.keys()).sort();
}

downloadProps() {
    console.log('Download config props');
    let response: Response;
    this.gitlab.downloadFile("")
        .map((res: Response) => response = res.json())
        .subscribe((res: Response) => {
            let blob = new Blob([atob(res['content'])], { type: 'application/zip' });
            saveAs(blob, 'config.properties');
        });
}
}