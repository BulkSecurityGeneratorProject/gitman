import { Component, OnInit } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';
import { Account, LoginModalService, Principal } from '../shared';
import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import {NgbProgressbarConfig} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'jhi-home',
    templateUrl: './home.component.html',
    styleUrls: [
        'home.css'
    ],
    providers: [NgbProgressbarConfig]

})
@Injectable()
export class HomeComponent implements OnInit {
    account: Account;
    modalRef: NgbModalRef;
    data=[];
    lastPage = 1;
    currentPage = 1;
    public latestBuild = Object;
    public isCollapsed = false;
    deploymentGroups : Map<string, Object[]> = new Map<string, Object[]>();
    checkMK_Status:String;
    processed=0;
    private gitlabURL='https://gitlab.zaa.nttdata-labs.com/api/v4/projects/4/';

    constructor(private http: Http,
        private principal: Principal,
        private loginModalService: LoginModalService,
        private eventManager: JhiEventManager,
        public config: NgbProgressbarConfig
    ) {
    }

    ngOnInit() {
        this.principal.identity().then((account) => {
            this.account = account;
        });
        this.registerAuthenticationSuccess();
        this.getLastestBuilld();
        this.getDeploymentData();
        
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


    getLastestBuilld() {
        let response:Response;
        const queryParams = new URLSearchParams();
       
        queryParams.append('scope', 'success');
        queryParams.append('scope', 'success');
        queryParams.append('page', '1');
        queryParams.append('per_page', '1');
        const authHeaders = new Headers();
        authHeaders.append('PRIVATE-TOKEN', 'Zv9PMoMNXFhLzYGBv8iz' );

        const options = new RequestOptions({ headers: authHeaders, params: queryParams});
       
        this.http.get(this.gitlabURL+'jobs',options)
                .map((res:Response)=>response=res)
                .subscribe((res:Response)=>{
                          this.latestBuild=res.json();
                          console.log('LatestBuild' + this.latestBuild);
          });

    }

    
    getDeploymentData() {
        let response:Response;
        console.log('Travesing @ page '+ this.currentPage);
        if( this.currentPage <= this.lastPage){
       
        this.http.get(this.gitlabURL+'deployments',this.buildRequest(this.currentPage))
            .map((res:Response)=>response=res)
	    	.subscribe((res:Response)=>{
				    	this.currentPage++;
                        this.data=this.data.concat(res.json());
                    
                        const paginationLinks=response.headers.get('Link').split(',');
                        for(let i=0;i<paginationLinks.length;i++) {
                           
                            const link=paginationLinks[i].split(';');
                           
                            if(link[1].indexOf('rel="last"')>0) {
                             this.lastPage=parseInt(response.headers.get('X-Total-Pages'));
                             this.getDeploymentData();
                            // console.log(parseFloat(''+this.currentPage)/parseFloat(''+this.lastPage));
                            


                            this.config.max = this.lastPage;
                            this.config.striped = true;
                            this.config.animated = true;
                            this.config.type = 'success';
                            this.config.showValue= true;
                            }
                       }

                       this.data.forEach(item=>{
                           let envData=[];
                           if(this.deploymentGroups.get(item.environment.name)) {
                            envData=this.deploymentGroups.get(item.environment.name);
                           }
                           if(item['collapsed']) {
                           item['collapsed']=false;
                           }
                           envData.push(item);
                           this.deploymentGroups.set(item.environment.name,envData);
                       });
        });}
        else {
            
            this.currentPage=1;
        }
    
    
    }

    buildRequest($currentPage) {
        const queryParams = new URLSearchParams();
        queryParams.append('per_page','100');
        
        queryParams.append('page', ''+$currentPage);

        const authHeaders = new Headers();
        authHeaders.append('PRIVATE-TOKEN', 'Zv9PMoMNXFhLzYGBv8iz' );

        const options = new RequestOptions({ headers: authHeaders, params: queryParams});
        return options;
    }


    getCheckMKStatus($environment:string)
    {
        const queryParams = new URLSearchParams();
        queryParams.append('_username','auto');
        let response:Response;
        
        const envName:string = $environment.split('/')[0];
        
        queryParams.append('host',envName.toUpperCase()+'-ENG');
        const options = new RequestOptions({ params: queryParams});
        const checkMK='https://monitoring.zaa.nttdata-labs.com/monitoring/check_mk/view.py?view_name=service&service=Process%20Connect%20Direct&_secret=VKTRVCVEYDCBTFNQI@GT&output_format=json';
        this.http.get(checkMK,options)
                .map((res:Response)=>response=res)
                .subscribe((res:Response)=>{
                const data=res.json();
               
                if (data.length > 1) {
                     this.deploymentGroups.get($environment)[0]['checkMK']=data[1][4];
                      console.log('checkMK'+ this.deploymentGroups.get($environment)[0]['checkMK']);
                    }
                });
    }
}
