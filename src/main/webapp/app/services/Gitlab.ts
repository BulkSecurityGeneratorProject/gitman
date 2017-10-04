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

	authHeaders(): Headers {
		const authHeaders = new Headers();
		authHeaders.append('PRIVATE-TOKEN', 'Zv9PMoMNXFhLzYGBv8iz');
		authHeaders.append('Access-Control-Allow-Origin', '*');
		return authHeaders;
	}

	requestOptions($page: number, $perPage: number): RequestOptions {
		const queryParams = new URLSearchParams();
		queryParams.append('per_page', $perPage.toString());
		queryParams.append('page', '' + $page.toString());

		const options = new RequestOptions({ headers: this.authHeaders(), params: queryParams });

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

				while (page >= this.lastPage - $maxPages) {

					let response: Response;
					this.http.get(this.URL + 'deployments', this.requestOptions(--page, 100))
						.map((response2: Response) => response2.json())
						.subscribe(response2 => {
							response2.forEach(item => {
								 item['collapsed'] = false;
								 item['showEnvs'] = false;
								item['checkMK'] = 'Unresolved Status';
							});
							// console.log(response2);
							// const environment: string = response2.environment.name.split('/');
							// const data: Map<string, Object[]> = new Map<string, Object[]>();
							// data.set(environment[1], response2.deployable.commit);
							// let apps = { gitData: data, collapsed: false };
							this.deployments.next(response2);
						});



				}


			});
		return this.deployments.asObservable();
	}

	downloadFile($path): Observable<Response> {
		const options = new RequestOptions({ headers: this.authHeaders() });

		return this.http.get("https://gitlab.zaa.nttdata-labs.com/api/v3/projects/4/repository/files/configuration/local/config.properties?ref=develop-2.2", options);
	}

}
