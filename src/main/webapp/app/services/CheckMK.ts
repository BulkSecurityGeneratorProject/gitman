import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';

@Injectable()

export class CheckMK {

	private readonly URL = 'https://monitoring.zaa.nttdata-labs.com/monitoring/check_mk/view.py?view_name=service&service=Process%20Connect%20Direct&_secret=VKTRVCVEYDCBTFNQI@GT&output_format=json';

	constructor(private http: Http) { }

	getCheckMKStatus($environment: string, $deploymentGroups: Map<string, any>) {
        const queryParams = new URLSearchParams();
        queryParams.append('_username', 'auto');
        let response: Response;

        const envName: string = $environment.split('/')[0];
        let hostName: string = envName.toUpperCase();
        if ('acc' == envName) {

            hostName += '-ENG1';
        }
        else {
            hostName += '-ENG';
        }
        queryParams.append('host',  hostName);
        const options = new RequestOptions({ params: queryParams });

        this.http.get(this.URL, options)
            .map((res: Response) => response = res)
            .subscribe((res: Response) => {
                const data = res.json();
                const item=$deploymentGroups.get($environment);
                item['checkMK']='Undefined';
                if (data.length > 1) {
                    item['checkMK'] = data[1][4];

                }
                error => {
                    $deploymentGroups.get($environment)['checkMK'] = 'Error';
                }
            }


            );
    }
}