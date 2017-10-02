import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';

@Injectable()

export class CheckMK {

	private url='https://monitoring.zaa.nttdata-labs.com/monitoring/check_mk/view.py?view_name=service&service=Process%20Connect%20Direct&_secret=VKTRVCVEYDCBTFNQI@GT&output_format=json';
	
	constructor(private http: Http) { }

	getCheckMKStatus($environment:string, $deploymentGroups:Map<string, Object[]>) {
        const queryParams = new URLSearchParams();
        queryParams.append('_username','auto');
        let response:Response;
        
        const envName:string = $environment.split('/')[0];
        
        queryParams.append('host',envName.toUpperCase()+'-ENG');
        const options = new RequestOptions({ params: queryParams});
        
        this.http.get(this.url,options)
                .map((res:Response)=>response=res)
                .subscribe((res:Response)=>{
                const data=res.json();
               
                if (data.length > 1) {
                      $deploymentGroups.get($environment)[0]['checkMK']=data[1][4];
                      console.log('checkMK'+ $deploymentGroups.get($environment)[0]['checkMK']);
                    }
                });
    }
}