import { Injectable, OnInit } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { ReplaySubject, Observable } from 'rxjs/Rx';

@Injectable()
export class Gitlab implements OnInit {

	private readonly URL = 'https://gitlab.zaa.nttdata-labs.com/api/v4/projects/4/';
	private readonly AUTH_HEADER = new Headers({ 'PRIVATE-TOKEN': 'Zv9PMoMNXFhLzYGBv8iz' });
	private build: ReplaySubject<any> = new ReplaySubject(1000);
	private deployments: ReplaySubject<any> = new ReplaySubject(1);
	private lastPage = 0;
	private defaultFetchSize = 100;



	constructor(private http: Http) { }

	ngOnInit() {

	}

	requestOptions($page: number, $perPage: number): RequestOptions {
		const queryParams = new URLSearchParams();
		queryParams.append('per_page', $perPage.toString());
		queryParams.append('page', '' + $page.toString());

		const authHeaders = new Headers();
		authHeaders.append('PRIVATE-TOKEN', 'Zv9PMoMNXFhLzYGBv8iz');
		authHeaders.append('Access-Control-Allow-Origin', '*');
		//authHeaders.append('Access-Control-Allow-Headers', 'Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With');
		//authHeaders.append('Access-Control-Allow-Methods', 'GET, PUT, POST');
		const options = new RequestOptions({ headers: authHeaders, params: queryParams });

		return options;
	}

	defaultRequestOptions($page: number): RequestOptions {
		return this.requestOptions($page, this.defaultFetchSize);
	}

	getLastestBuilld(): Observable<any> {
		let response: Response;

		const requestOptions = this.requestOptions(1, 100);
		requestOptions.params.append('scope', 'success');

		this.http.get(this.URL + 'jobs', requestOptions).map((res: Response) => response = res).subscribe((res: Response) => {
			this.build.next(res.json());
			//console.log('LatestBuild' + JSON.stringify(this.build));
		});

		return this.build.asObservable();

	}

	retrieveDeployments($maxPages: number): Observable<any> {


		let response: Response;
		this.http.get(this.URL + 'deployments', this.requestOptions(1, 100))
			.map((res: Response) => response = res)
			.subscribe((res: Response) => {

				this.lastPage = parseInt(res.headers.get('X-Total-Pages'));
				let page: number = this.lastPage;
				console.log('While is' + (this.lastPage - $maxPages));


				while (page >= this.lastPage - $maxPages) {

					let response: Response;
					this.http.get(this.URL + 'deployments', this.requestOptions(--page, 100))
						.map((response2: Response) => response2.json())
						.subscribe(response2 => {
							response2.forEach(item=>{
								item['collapsed']=false;
								item['checkMK']='Unresolved Status';
							});
							this.deployments.next(response2);
						});



				}


			});
		return this.deployments.asObservable();
	}

}
