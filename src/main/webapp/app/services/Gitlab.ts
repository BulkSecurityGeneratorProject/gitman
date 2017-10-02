import { Injectable, OnInit } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { ReplaySubject } from 'rxjs/Rx';

@Injectable()
export class Gitlab implements OnInit {

	private gitlabURL = 'https://gitlab.zaa.nttdata-labs.com/api/v4/projects/4/';
	private gitlabAUTH = new Headers({ 'PRIVATE-TOKEN': 'Zv9PMoMNXFhLzYGBv8iz' });
	public latestBuild = Object;

	public build: ReplaySubject<any> = new ReplaySubject(1);

	public deployments: ReplaySubject<any> = new ReplaySubject(1);
	private lastPage = 0;



	constructor(private http: Http) { }

	ngOnInit() {

	}


	getLastestBuilld() {
		let response: Response;
		const queryParams = new URLSearchParams();
		queryParams.append('scope', 'success');
		queryParams.append('scope', 'success');
		queryParams.append('page', '1');
		queryParams.append('per_page', '1');

		const options = new RequestOptions({ headers: this.gitlabAUTH, params: queryParams });

		this.http.get(this.gitlabURL + 'jobs', options).map((res: Response) => response = res).subscribe((res: Response) => {
			this.build.next(res.json());
			console.log('LatestBuild' + JSON.stringify(this.build));
		});

		return this.build.asObservable();

	}

	buildRequest($currentPage) {
		const queryParams = new URLSearchParams();
		queryParams.append('per_page', '100');
		queryParams.append('page', '' + $currentPage);

		const authHeaders = new Headers();
		authHeaders.append('PRIVATE-TOKEN', 'Zv9PMoMNXFhLzYGBv8iz');
		const options = new RequestOptions({ headers: authHeaders, params: queryParams });

		return options;
	}

	retrieveDeployments() {


		// if ( $currentPage < this.lastPage) {
		let page:number=1;
		let response: Response;
		this.http.get(this.gitlabURL + 'deployments', this.buildRequest(0))
			.map((res: Response) => response = res)
			.subscribe((res: Response) => {
				this.deployments.next(res);
				this.lastPage = parseInt(res.headers.get('X-Total-Pages'));

				while (++page < this.lastPage) {
					console.log('Travesing page ' + page + ' of total ' + this.lastPage);
					this.http.get(this.gitlabURL + 'deployments', this.buildRequest(page))
						.map((res: Response) => response = res)
						.subscribe((res: Response) => {
							this.deployments.next(res);


						});

				}

			});
		return this.deployments.asObservable();
	}

}
