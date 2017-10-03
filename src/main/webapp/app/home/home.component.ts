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
    public deploymentGroups: Map<string, {gitData:object[],collapsed:boolean,ckeckMK_status:string}> = new Map<string, {gitData:object[],collapsed:boolean,ckeckMK_status:string}>();
    public deployments: Map<string, Map<string, object[]>> = new Map<string, Map<string, object[]>>();
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
        this.subscription = this.gitlab.retrieveDeployments(100).subscribe(deployment => {
            const data = deployment;
            this.processedDeployments++;
            //console.log('Retrieved item data='+data);

            data.forEach(item => {
                
                let envData={gitData:[],collapsed:false,ckeckMK_status:"undefined"};
                
                if (this.deploymentGroups.get(item.environment.name)) {
                    envData = this.deploymentGroups.get(item.environment.name);
                }
                envData['gitData'].push(item);
                
                this.deploymentGroups.set(item.environment.name, envData);

            });
            for (let entry of Array.from(this.deploymentGroups.keys())) {
                const key: string[] = entry.split('/');
                if (key.length == 2) {
                    let apps: Map<string, object[]> = this.deployments.get(key[0]) || new Map<string, object[]>();
                    let commits: object[] = this.deploymentGroups.get(entry).gitData;
                    if (apps.get(key[1]) == null) {
                        apps.set(key[1], []);
                    }

                    this.deployments.set(key[0], apps);

                    // for (let entry of Array.from(this.deployments.keys())) {
                    //     let a: Map<string, Object[]> = this.deployments.get(entry);
                    //     console.log("Key " + entry + " keyset=" + a.keys());
                    // }

                }
            }

    });
    }

    getCheckMKStatus($environment: string) {
        this.checkMK.getCheckMKStatus($environment, this.deploymentGroups);
    }


    getEnvironmentNames(): string[] {
        return Array.from(this.deploymentGroups.keys()).sort();

    }

    downloadProps()
    {
        console.log('Download config props');
          let response: Response;
        this.gitlab.downloadFile("configuration/local/config.properties?ref=develop-2.2")
        .map((res: Response) => response = res.json())
        .subscribe((res:Response)=>{
            console.log(res);
        });
    }
}